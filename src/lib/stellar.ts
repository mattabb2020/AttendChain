/**
 * Stellar / Soroban integration — SERVER-ONLY
 *
 * Invokes the AttendChain Soroban smart contract on Stellar Testnet.
 * Each check-in calls `record_attendance` on the contract, storing the
 * attendance hash in persistent contract storage. Verification calls
 * `has` and `get` (read-only, resolved via simulation).
 *
 * The institution's secret key signs all transactions — it must
 * NEVER be imported from client-side code.
 */
import {
  Keypair,
  Networks,
  contract,
} from "@stellar/stellar-sdk";
import crypto from "crypto";

// ─── Config helpers ──────────────────────────────────────

function getRpcUrl(): string {
  return process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
}

function getNetworkPassphrase(): string {
  return process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
}

function getKeypair() {
  const secret = process.env.INSTITUTION_SECRET;
  if (!secret || secret === "placeholder") {
    throw new Error("INSTITUTION_SECRET is not configured");
  }
  return Keypair.fromSecret(secret);
}

function getContractId(): string {
  const id = process.env.CONTRACT_ID;
  if (!id || id === "not-needed") {
    throw new Error(
      "CONTRACT_ID is not configured. Run: node scripts/deploy-contract.mjs"
    );
  }
  return id;
}

// ─── Soroban contract client (lazy singleton) ────────────

let clientPromise: Promise<contract.Client> | null = null;

function getContractClient(): Promise<contract.Client> {
  if (!clientPromise) {
    const keypair = getKeypair();
    const networkPassphrase = getNetworkPassphrase();

    clientPromise = contract.Client.from({
      contractId: getContractId(),
      rpcUrl: getRpcUrl(),
      networkPassphrase,
      publicKey: keypair.publicKey(),
      ...contract.basicNodeSigner(keypair, networkPassphrase),
    });
  }
  return clientPromise;
}

// ─── Public API ──────────────────────────────────────────

/**
 * Record an attendance hash on the Soroban contract.
 *
 * Invokes `record_attendance(admin, record_hash, session_hash, timestamp)`
 * on-chain. The contract is idempotent — duplicate hashes are a no-op.
 */
export async function recordOnChain(
  recordHash: string,
  sessionId: string,
  timestamp: number
): Promise<{ txHash: string }> {
  const client = await getContractClient();
  const keypair = getKeypair();

  // Convert 64-char hex recordHash → 32-byte Buffer for BytesN<32>
  const recordHashBytes = Buffer.from(recordHash, "hex");

  // SHA-256 the sessionId to get a 32-byte session_hash
  const sessionHashBytes = crypto
    .createHash("sha256")
    .update(sessionId)
    .digest();

  // Invoke the contract — client dynamically generates methods from on-chain spec
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tx = await (client as any).record_attendance({
    admin: keypair.publicKey(),
    record_hash: recordHashBytes,
    session_hash: sessionHashBytes,
    ts: BigInt(timestamp),
  });

  const sentTx = await tx.signAndSend();

  // Extract transaction hash from the send response
  const txHash = sentTx.sendTransactionResponse?.hash
    ?? sentTx.getTransactionResponse?.hash
    ?? "";

  return { txHash };
}

/**
 * Verify if a record exists on the Soroban contract.
 *
 * Calls `has(record_hash)` and optionally `get(record_hash)`.
 * Both are read-only — resolved via simulation, no on-chain tx needed.
 */
export async function verifyOnChain(
  recordHash: string
): Promise<{ exists: boolean; sessionHash?: string; timestamp?: number }> {
  try {
    const client = await getContractClient();
    const recordHashBytes = Buffer.from(recordHash, "hex");

    // has() is read-only — result comes from simulation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasTx = await (client as any).has({
      record_hash: recordHashBytes,
    });
    const exists: boolean = hasTx.result;

    if (!exists) return { exists: false };

    // get() returns Option<(BytesN<32>, u64)>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getTx = await (client as any).get({
      record_hash: recordHashBytes,
    });

    if (getTx.result) {
      const [sessionBytes, ts] = getTx.result;
      return {
        exists: true,
        sessionHash: Buffer.from(sessionBytes).toString("hex"),
        timestamp: Number(ts),
      };
    }

    return { exists: true };
  } catch {
    return { exists: false };
  }
}

/**
 * Build the Stellar Explorer URL for a transaction hash.
 */
export function getStellarLabUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

/**
 * Build the Stellar Expert URL for the deployed contract.
 */
export function getContractExplorerUrl(): string {
  return `https://stellar.expert/explorer/testnet/contract/${getContractId()}`;
}
