#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, BytesN};

#[contracttype]
enum DataKey {
    Admin,
    Record(BytesN<32>),
}

const MIN_TTL: u32 = 518_400;  // ~60 days in ledgers
const MAX_TTL: u32 = 3_110_400; // ~360 days in ledgers

#[contract]
pub struct AttendanceContract;

#[contractimpl]
impl AttendanceContract {
    /// Initialize the contract with an admin address.
    /// Can only be called once — panics if already initialized.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Record an attendance hash on-chain.
    /// Requires admin authorization. Idempotent: duplicate hashes are a no-op.
    pub fn record_attendance(
        env: Env,
        admin: Address,
        record_hash: BytesN<32>,
        session_hash: BytesN<32>,
        ts: u64,
    ) {
        // Verify caller is admin
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();
        assert!(admin == stored_admin, "unauthorized");

        let key = DataKey::Record(record_hash.clone());

        // Idempotent — don't overwrite existing records
        if env.storage().persistent().has(&key) {
            return;
        }

        // Store: record_hash → (session_hash, timestamp)
        env.storage()
            .persistent()
            .set(&key, &(session_hash.clone(), ts));

        // Extend TTL so records don't get archived
        env.storage()
            .persistent()
            .extend_ttl(&key, MIN_TTL, MAX_TTL);

        // Emit event for Stellar Lab visibility
        env.events().publish(
            (symbol_short!("attend"),),
            (record_hash, session_hash, ts),
        );
    }

    /// Check if a record hash exists on-chain.
    pub fn has(env: Env, record_hash: BytesN<32>) -> bool {
        env.storage().persistent().has(&DataKey::Record(record_hash))
    }

    /// Get the details of a record: (session_hash, timestamp).
    /// Returns None if the record doesn't exist.
    pub fn get(env: Env, record_hash: BytesN<32>) -> Option<(BytesN<32>, u64)> {
        env.storage().persistent().get(&DataKey::Record(record_hash))
    }

    /// Bump the TTL of a record to keep it alive.
    pub fn bump(env: Env, record_hash: BytesN<32>) {
        let key = DataKey::Record(record_hash);
        if env.storage().persistent().has(&key) {
            env.storage()
                .persistent()
                .extend_ttl(&key, MIN_TTL, MAX_TTL);
        }
    }

    /// Upgrade the contract WASM. Admin only.
    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();
        assert!(admin == stored_admin, "unauthorized");
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_record_and_verify() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, AttendanceContract);
        let client = AttendanceContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        // Initialize with admin
        client.initialize(&admin);

        let record_hash = BytesN::from_array(&env, &[1u8; 32]);
        let session_hash = BytesN::from_array(&env, &[2u8; 32]);
        let ts: u64 = 1700000000;

        // Record should not exist yet
        assert!(!client.has(&record_hash));

        // Record attendance
        client.record_attendance(&admin, &record_hash, &session_hash, &ts);

        // Now it should exist
        assert!(client.has(&record_hash));

        // Get should return the stored data
        let result = client.get(&record_hash);
        assert!(result.is_some());
        let (stored_session, stored_ts) = result.unwrap();
        assert_eq!(stored_session, session_hash);
        assert_eq!(stored_ts, ts);

        // Calling record_attendance again should be idempotent (no panic)
        client.record_attendance(&admin, &record_hash, &session_hash, &ts);

        // Get on non-existent record should return None
        let missing_hash = BytesN::from_array(&env, &[99u8; 32]);
        assert!(client.get(&missing_hash).is_none());
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_initialize() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, AttendanceContract);
        let client = AttendanceContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);
        client.initialize(&admin); // Should panic
    }
}
