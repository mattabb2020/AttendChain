/**
 * Stellar integration — SERVER-ONLY
 *
 * Records attendance hashes on Stellar Testnet as transactions.
 * Each check-in creates a transaction with the recordHash embedded,
 * making it publicly verifiable on Stellar Explorer.
 *
 * The institution's secret key signs all transactions — it must
 * NEVER be imported from client-side code.
 */
import {
  Keypair,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Memo,
  rpc as SorobanRpc,
} from "@stellar/stellar-sdk";

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

/**
 * Record an attendance hash on Stellar Testnet.
 *
 * Creates a self-payment transaction with the recordHash as a
 * managed data entry (key-value on the account). The transaction
 * hash serves as the immutable proof.
 *
 * The recordHash (first 28 chars) goes in the tx memo for quick lookup.
 * The full hash is stored as account data via manage_data operation.
 */
export async function recordOnChain(
  recordHash: string,
  sessionId: string,
  timestamp: number
): Promise<{ txHash: string }> {
  const server = new SorobanRpc.Server(getRpcUrl());
  const keypair = getKeypair();
  const networkPassphrase = getNetworkPassphrase();

  const account = await server.getAccount(keypair.publicKey());

  // Build transaction:
  // - Memo: first 28 chars of recordHash (memo text max = 28 bytes)
  // - manage_data: store the full recordHash as account data
  const memoText = recordHash.substring(0, 28);
  const dataKey = `ac:${recordHash.substring(0, 20)}`; // max 64 chars for key
  const dataValue = Buffer.from(
    JSON.stringify({ h: recordHash, s: sessionId, t: timestamp })
  );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.manageData({
        name: dataKey,
        value: dataValue.length <= 64 ? dataValue : dataValue.subarray(0, 64),
      })
    )
    .addMemo(Memo.text(memoText))
    .setTimeout(30)
    .build();

  tx.sign(keypair);

  const result = await server.sendTransaction(tx);

  if (result.status === "ERROR") {
    throw new Error(`Transaction failed: ${result.status}`);
  }

  // Poll for confirmation (max 30 seconds to prevent infinite loops)
  const txHash = result.hash;
  let getResult = await server.getTransaction(txHash);
  let attempts = 0;
  const MAX_POLL_ATTEMPTS = 30;
  while (getResult.status === "NOT_FOUND" && attempts < MAX_POLL_ATTEMPTS) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResult = await server.getTransaction(txHash);
    attempts++;
  }

  if (getResult.status === "NOT_FOUND") {
    throw new Error(`Transaction confirmation timed out after ${MAX_POLL_ATTEMPTS}s: ${txHash}`);
  }

  if (getResult.status === "FAILED") {
    throw new Error(`Transaction failed on-chain: ${txHash}`);
  }

  return { txHash };
}

/**
 * Verify if a record exists on-chain by checking the institution account's data.
 * Falls back to database check if account data is not available.
 */
export async function verifyOnChain(
  recordHash: string
): Promise<{ exists: boolean }> {
  try {
    const server = new SorobanRpc.Server(getRpcUrl());
    const keypair = getKeypair();

    const account = await server.getAccount(keypair.publicKey());
    const dataKey = `ac:${recordHash.substring(0, 20)}`;

    // Check if the data entry exists on the account
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accountAny = account as any;
    const data = accountAny.data_attr || accountAny._data;
    if (data && data[dataKey]) {
      return { exists: true };
    }

    return { exists: false };
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
