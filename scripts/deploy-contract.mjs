/**
 * Deploy AttendChain Soroban contract to Stellar Testnet
 *
 * This script:
 * 1. Checks prerequisites (Rust, wasm32 target, stellar CLI)
 * 2. Generates a new Stellar keypair (or uses existing INSTITUTION_SECRET)
 * 3. Funds it via Friendbot (Testnet faucet)
 * 4. Compiles the Soroban contract to WASM
 * 5. Deploys the WASM to Stellar Testnet
 * 6. Initializes the contract with the admin address
 * 7. Outputs the CONTRACT_ID and INSTITUTION_SECRET for .env.local
 *
 * Run: node scripts/deploy-contract.mjs
 */
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Keypair, Networks } from "@stellar/stellar-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const CONTRACT_DIR = resolve(PROJECT_ROOT, "soroban-contract");
const WASM_PATH = resolve(
  CONTRACT_DIR,
  "target/wasm32-unknown-unknown/release/attend_contract.wasm"
);

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const FRIENDBOT_URL = "https://friendbot.stellar.org";

// ─── Helpers ─────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  const result = execSync(cmd, { encoding: "utf-8", stdio: "pipe", ...opts });
  return result ? result.trim() : "";
}

function runVisible(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { encoding: "utf-8", stdio: "inherit", ...opts });
}

function checkCommand(cmd, name, installHint) {
  try {
    execSync(`${cmd}`, { encoding: "utf-8", stdio: "pipe" });
    return true;
  } catch {
    console.error(`\n❌ ${name} not found.`);
    console.error(`   Install: ${installHint}\n`);
    return false;
  }
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log("🚀 AttendChain Soroban Contract Deployment\n");

  // Step 0: Check prerequisites
  console.log("🔍 Checking prerequisites...");
  let ok = true;

  if (!checkCommand("rustup --version", "Rust (rustup)", "https://rustup.rs")) {
    ok = false;
  } else {
    // Check wasm32 target
    const targets = run("rustup target list --installed");
    if (!targets.includes("wasm32-unknown-unknown")) {
      console.log("  ⚠️  wasm32-unknown-unknown target not installed. Installing...");
      run("rustup target add wasm32-unknown-unknown");
      console.log("  ✅ wasm32 target installed");
    }
  }

  if (
    !checkCommand(
      "stellar --version",
      "Stellar CLI",
      "cargo install --locked stellar-cli --features opt"
    )
  ) {
    ok = false;
  }

  if (!ok) {
    console.error("Install the missing prerequisites and try again.");
    process.exit(1);
  }
  console.log("  ✅ All prerequisites met\n");

  // Step 1: Generate or load keypair
  let keypair;
  if (
    process.env.INSTITUTION_SECRET &&
    process.env.INSTITUTION_SECRET !== "placeholder"
  ) {
    keypair = Keypair.fromSecret(process.env.INSTITUTION_SECRET);
    console.log("📋 Using existing keypair");
  } else {
    keypair = Keypair.random();
    console.log("🔑 Generated new keypair");
  }
  console.log(`   Public:  ${keypair.publicKey()}\n`);

  // Step 2: Fund via Friendbot
  console.log("💰 Funding account via Friendbot...");
  try {
    const response = await fetch(
      `${FRIENDBOT_URL}?addr=${keypair.publicKey()}`
    );
    if (!response.ok) {
      const text = await response.text();
      if (!text.includes("createAccountAlreadyExist")) {
        throw new Error(`Friendbot failed: ${text}`);
      }
      console.log("   Account already funded\n");
    } else {
      console.log("   Account funded successfully\n");
    }
  } catch (err) {
    console.error("   Friendbot error:", err.message);
    console.log("   Continuing anyway (account might already exist)\n");
  }

  // Step 3: Compile the Soroban contract
  console.log("🔨 Compiling Soroban contract...");
  try {
    runVisible("stellar contract build", { cwd: CONTRACT_DIR });
  } catch {
    // stellar contract build might not be available, fall back to cargo
    console.log("   Falling back to cargo build...");
    runVisible(
      "cargo build --target wasm32-unknown-unknown --release",
      { cwd: CONTRACT_DIR }
    );
  }

  if (!existsSync(WASM_PATH)) {
    console.error(`\n❌ WASM not found at ${WASM_PATH}`);
    console.error("   Contract compilation may have failed.");
    process.exit(1);
  }
  console.log(`   ✅ WASM compiled: ${WASM_PATH}\n`);

  // Step 4: Deploy the contract to testnet
  console.log("📡 Deploying contract to Stellar Testnet...");
  const contractId = run(
    `stellar contract deploy ` +
      `--wasm "${WASM_PATH}" ` +
      `--source ${keypair.secret()} ` +
      `--rpc-url ${RPC_URL} ` +
      `--network-passphrase "${NETWORK_PASSPHRASE}"`
  );

  console.log(`   ✅ Contract deployed: ${contractId}\n`);

  // Step 5: Initialize the contract with the admin address
  console.log("⚙️  Initializing contract...");
  try {
    run(
      `stellar contract invoke ` +
        `--id ${contractId} ` +
        `--source ${keypair.secret()} ` +
        `--rpc-url ${RPC_URL} ` +
        `--network-passphrase "${NETWORK_PASSPHRASE}" ` +
        `-- initialize --admin ${keypair.publicKey()}`
    );
    console.log("   ✅ Contract initialized\n");
  } catch (err) {
    if (err.message?.includes("already initialized")) {
      console.log("   Contract was already initialized\n");
    } else {
      throw err;
    }
  }

  // Step 6: Update .env.local
  const envPath = resolve(PROJECT_ROOT, ".env.local");
  let envContent = "";
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf-8");
  }

  // Update or add CONTRACT_ID
  if (envContent.includes("CONTRACT_ID=")) {
    envContent = envContent.replace(/CONTRACT_ID=.*/, `CONTRACT_ID=${contractId}`);
  } else {
    envContent += `\nCONTRACT_ID=${contractId}\n`;
  }

  // Update or add INSTITUTION_SECRET
  if (envContent.includes("INSTITUTION_SECRET=")) {
    envContent = envContent.replace(
      /INSTITUTION_SECRET=.*/,
      `INSTITUTION_SECRET=${keypair.secret()}`
    );
  } else {
    envContent += `INSTITUTION_SECRET=${keypair.secret()}\n`;
  }

  writeFileSync(envPath, envContent);

  // Output summary
  console.log("═══════════════════════════════════════════════════");
  console.log("✅ DONE! Values written to .env.local:\n");
  console.log(`   CONTRACT_ID=${contractId}`);
  console.log(`   INSTITUTION_SECRET=***REDACTED***`);
  console.log(`\n   View contract: https://stellar.expert/explorer/testnet/contract/${contractId}`);
  console.log("═══════════════════════════════════════════════════\n");

  console.log("Next steps:");
  console.log("1. Copy CONTRACT_ID and INSTITUTION_SECRET to Vercel Environment Variables");
  console.log("2. Restart your dev server: npm run dev");
  console.log("3. Redeploy on Vercel if in production");
}

main().catch((err) => {
  console.error("\n❌ Deployment failed:", err.message || err);
  process.exit(1);
});
