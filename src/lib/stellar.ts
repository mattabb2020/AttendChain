/**
 * Stellar / Soroban integration — SERVER-ONLY
 *
 * This module handles recording attendance hashes on the Soroban smart contract
 * and verifying their existence. It uses the institution's secret key to sign
 * transactions, so it must NEVER be imported from client-side code.
 */
import {
  Keypair,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  nativeToScVal,
  Contract,
  rpc as SorobanRpc,
} from "@stellar/stellar-sdk";
import crypto from "crypto";

function getRpcUrl(): string {
  return process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
}

function getNetworkPassphrase(): string {
  return process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
}

function getKeypair() {
  const secret = process.env.INSTITUTION_SECRET;
  if (!secret) throw new Error("INSTITUTION_SECRET is not configured");
  return Keypair.fromSecret(secret);
}

function getContractId(): string {
  const id = process.env.CONTRACT_ID;
  if (!id) throw new Error("CONTRACT_ID is not configured");
  return id;
}

/**
 * Convert a hex hash string to a Soroban Bytes ScVal.
 */
function hashToScVal(hexHash: string): xdr.ScVal {
  const bytes = Buffer.from(hexHash, "hex");
  return xdr.ScVal.scvBytes(bytes);
}

/**
 * Record an attendance hash on the Soroban contract.
 * Builds, signs, and submits the transaction.
 *
 * Returns the transaction hash on success, or throws on failure.
 */
export async function recordOnChain(
  recordHash: string,
  sessionId: string,
  timestamp: number
): Promise<{ txHash: string }> {
  const server = new SorobanRpc.Server(getRpcUrl());
  const keypair = getKeypair();
  const contractId = getContractId();
  const networkPassphrase = getNetworkPassphrase();

  // Load the source account
  const account = await server.getAccount(keypair.publicKey());

  // Create a session hash from the sessionId
  const sessionHashHex = crypto
    .createHash("sha256")
    .update(sessionId)
    .digest("hex");

  // Build the contract invocation
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      contract.call(
        "record_attendance",
        hashToScVal(recordHash),
        hashToScVal(sessionHashHex),
        nativeToScVal(timestamp, { type: "u64" })
      )
    )
    .setTimeout(30)
    .build();

  // Simulate to get the proper footprint and fees
  const simulated = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(
      `Simulation failed: ${(simulated as SorobanRpc.Api.SimulateTransactionErrorResponse).error}`
    );
  }

  // Assemble the transaction with the simulation results
  const assembled = SorobanRpc.assembleTransaction(
    tx,
    simulated as SorobanRpc.Api.SimulateTransactionSuccessResponse
  ).build();

  // Sign and submit
  assembled.sign(keypair);
  const result = await server.sendTransaction(assembled);

  if (result.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${result.status}`);
  }

  // Poll for confirmation
  const txHash = result.hash;
  let getResult = await server.getTransaction(txHash);
  while (getResult.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResult = await server.getTransaction(txHash);
  }

  if (getResult.status === "FAILED") {
    throw new Error(`Transaction failed on-chain: ${txHash}`);
  }

  return { txHash };
}

/**
 * Check if a record hash exists on the Soroban contract.
 * This is a read-only query (simulated, no transaction submitted).
 */
export async function verifyOnChain(
  recordHash: string
): Promise<{ exists: boolean }> {
  try {
    const server = new SorobanRpc.Server(getRpcUrl());
    const keypair = getKeypair();
    const contractId = getContractId();
    const networkPassphrase = getNetworkPassphrase();

    const account = await server.getAccount(keypair.publicKey());
    const contract = new Contract(contractId);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(contract.call("has", hashToScVal(recordHash)))
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simulated)) {
      return { exists: false };
    }

    const successResult =
      simulated as SorobanRpc.Api.SimulateTransactionSuccessResponse;
    if (successResult.result) {
      const retVal = successResult.result.retval;
      return { exists: retVal.b() === true };
    }

    return { exists: false };
  } catch {
    // If contract is not deployed or any error, return false
    return { exists: false };
  }
}

/**
 * Build the Stellar Explorer URL for a transaction hash.
 */
export function getStellarLabUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}
