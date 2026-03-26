#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, BytesN};

#[contract]
pub struct AttendanceContract;

#[contractimpl]
impl AttendanceContract {
    /// Record an attendance hash on-chain.
    /// Idempotent: if the record_hash already exists, this is a no-op.
    /// Emits an "attend" event with (record_hash, session_hash, timestamp).
    pub fn record_attendance(
        env: Env,
        record_hash: BytesN<32>,
        session_hash: BytesN<32>,
        ts: u64,
    ) {
        // Idempotent — don't overwrite existing records
        if env.storage().persistent().has(&record_hash) {
            return;
        }

        // Store: record_hash → (session_hash, timestamp)
        env.storage()
            .persistent()
            .set(&record_hash, &(session_hash.clone(), ts));

        // Emit event for Stellar Lab visibility
        env.events().publish(
            (symbol_short!("attend"),),
            (record_hash, session_hash, ts),
        );
    }

    /// Check if a record hash exists on-chain.
    pub fn has(env: Env, record_hash: BytesN<32>) -> bool {
        env.storage().persistent().has(&record_hash)
    }

    /// Get the details of a record: (session_hash, timestamp).
    /// Panics if the record doesn't exist — call `has()` first.
    pub fn get(env: Env, record_hash: BytesN<32>) -> (BytesN<32>, u64) {
        env.storage().persistent().get(&record_hash).unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_record_and_verify() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AttendanceContract);
        let client = AttendanceContractClient::new(&env, &contract_id);

        let record_hash = BytesN::from_array(&env, &[1u8; 32]);
        let session_hash = BytesN::from_array(&env, &[2u8; 32]);
        let ts: u64 = 1700000000;

        // Record should not exist yet
        assert!(!client.has(&record_hash));

        // Record attendance
        client.record_attendance(&record_hash, &session_hash, &ts);

        // Now it should exist
        assert!(client.has(&record_hash));

        // Get should return the stored data
        let (stored_session, stored_ts) = client.get(&record_hash);
        assert_eq!(stored_session, session_hash);
        assert_eq!(stored_ts, ts);

        // Calling record_attendance again should be idempotent (no panic)
        client.record_attendance(&record_hash, &session_hash, &ts);
    }
}
