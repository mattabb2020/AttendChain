# ⛓️ AttendChain

> Blockchain-verified attendance. Rotating QR + Soroban Smart Contract on Stellar Testnet.

🏆 **2nd Place Winner** at the [Stellar Vendimia Tech Hackathon](https://dorahacks.io/buidl/41900) in Mendoza, Argentina.

🌐 **Live:** [www.attendchain.com](https://www.attendchain.com)
📜 **Contract:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBV35SVYVYIHD4KSKRC6U3KYS7OY3TCY4FHSVLWMXM3OM45POAHQ4TVA)
📖 **MVP Description:** [attendchain.com/about](https://www.attendchain.com/about)

---

## ❌ Problem

Traditional attendance records are easy to manipulate. There is no way to independently verify whether someone actually attended. Institutions can rewrite records without leaving a trace.

## ✅ Solution

AttendChain turns every attendance check-in into immutable, verifiable evidence:

1. 📱 **Rotating QR** — Changes every 30 seconds. Only those present can scan it.
2. 🔐 **SHA-256 Hash** — Each check-in generates a unique cryptographic fingerprint.
3. ⛓️ **Soroban Smart Contract** — The hash is recorded by invoking `record_attendance` on a contract deployed to Stellar Testnet.
4. 🔍 **Public Verification** — Anyone can verify a record using the `recordHash`, no authentication required.
5. 📊 **Analytics Dashboard** — Institutional panel with academic KPIs, risk advisor, course health, and individual student profiles.

---

## 🏆 Hackathon

AttendChain won **2nd place** at the **Stellar Vendimia Tech Hackathon** in Mendoza, Argentina, earning a cash prize.

- 🔗 **DoraHacks:** [View project on DoraHacks](https://dorahacks.io/buidl/41900)
- 📖 **About:** [MVP Description](https://www.attendchain.com/about)
- 💬 **Contact:** Reach Matias on Telegram [@m8tias](https://t.me/m8tias)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| 🗄️ Database | Supabase (PostgreSQL + Row Level Security) |
| ⛓️ Blockchain | Stellar Testnet + Soroban Smart Contract (Rust) |
| 📦 SDK | `@stellar/stellar-sdk` v14 (`contract.Client`) |
| 🔑 Authentication | Supabase Auth (email) + role-based middleware |
| 🚀 Deployment | Vercel (serverless) |

---

## ⛓️ Stellar / Soroban Integration

The Soroban contract (`soroban-contract/src/lib.rs`) is invoked directly from the backend:

| Function | Type | Usage |
|----------|------|-------|
| `record_attendance(admin, record_hash, session_hash, ts)` | ✍️ Write | Records attendance on-chain. Requires admin auth. Idempotent. |
| `has(record_hash)` | 👁️ Read | Checks if a record exists (simulation, no tx). |
| `get(record_hash)` | 👁️ Read | Returns `(session_hash, timestamp)` for a record. |
| `bump(record_hash)` | ✍️ Write | Extends the TTL of a record. |
| `upgrade(admin, new_wasm_hash)` | ✍️ Write | Upgrades the contract WASM. Admin only. |

- 🔗 **`contract.Client.from()`** fetches the contract spec on-chain and generates dynamic methods
- ✍️ **`basicNodeSigner`** signs transactions and auth entries server-side
- 🔒 **Institutional signing** — the secret key never reaches the browser
- 🌍 **Public verification** — anyone can verify a hash without authentication

---

## 📊 Analytics Dashboard

Institutional panel at `/analytics` with four views:

- 📈 **Overview** — Academic KPIs and institutional risk panorama
- 🧑‍🏫 **Academic Advisor** — Risk queue and student case management
- 📚 **Course Health** — Performance metrics by section
- 🎓 **Student Profile** — Individual risk detail and timeline

---

## 🚀 Setup

### 1️⃣ Clone and install

```bash
git clone https://github.com/mattabb2020/AttendChain.git
cd AttendChain
npm install
```

### 2️⃣ Configure Supabase

1. Create a project on [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy the keys
3. Go to **SQL Editor** and run `supabase/schema.sql`
4. In **Authentication > Settings** enable the Email provider

### 3️⃣ Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase and Stellar values.

### 4️⃣ Build and deploy the Soroban contract

Prerequisites: [Rust](https://rustup.rs) + target `wasm32-unknown-unknown` + [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)

```bash
# Install prerequisites (if you don't have them)
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli

# Build, deploy, and initialize the contract
node scripts/deploy-contract.mjs
```

The script compiles the WASM, deploys it to testnet, initializes the contract with the admin, and writes the `CONTRACT_ID` to `.env.local`.

### 5️⃣ Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6️⃣ Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add the environment variables (including `CONTRACT_ID` and `INSTITUTION_SECRET`)
4. Deploy

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # 🏠 Landing
│   ├── auth/                     # 🔑 Login and registration
│   ├── analytics/                # 📊 Institutional analytics dashboard
│   │   ├── _views/              # OverviewView, AdvisorView, CourseHealthView, StudentProfileView
│   │   └── _components/         # SidebarNav
│   ├── organizer/
│   │   ├── dashboard/            # 📋 Organizer dashboard
│   │   ├── classes/new/          # ➕ Create class
│   │   └── sessions/
│   │       ├── open/             # ▶️ Open session
│   │       └── active/qr/       # 📱 Rotating QR (main screen)
│   ├── student/
│   │   ├── scan/                 # 📷 Scan QR to check in
│   │   └── profile/              # 👤 Attendance history
│   ├── verify/                   # 🔍 Public verification
│   └── api/                      # ⚡ API Routes (11 endpoints)
├── components/                   # 🧩 Reusable UI components
├── lib/
│   ├── qr.ts                    # 📱 QR token generation (HMAC-SHA256)
│   ├── hash.ts                  # 🔐 Record hash (SHA-256)
│   ├── stellar.ts               # ⛓️ Soroban contract invocation
│   └── supabase/                # 🗄️ Supabase clients (server, browser)
├── types/                        # 📝 TypeScript interfaces
├── middleware.ts                 # 🛡️ Auth + role-based route protection
soroban-contract/
├── src/lib.rs                   # ⛓️ Smart contract (Rust) + tests
├── Cargo.toml                   # 📦 Soroban SDK 21.7.5
scripts/
├── deploy-contract.mjs          # 🚀 Build, deploy, and initialize
supabase/
├── schema.sql                   # 🗄️ Database schema + RLS policies
```

---

## 🎬 Demo Flow

1. 🧑‍🏫 **Organizer** logs in → creates class → opens session → projects QR
2. 📱 **QR** rotates every 30 seconds with a visual countdown
3. 🎓 **Student** scans QR → enters name → confirms attendance
4. ⚙️ **Backend** computes `recordHash = SHA-256(sessionId|attendeeId|timestamp)` → invokes `record_attendance` on the Soroban contract
5. 🔍 **Verification** at `/verify/{recordHash}` queries the contract via `has()` + `get()` and displays the result with a link to Stellar Explorer
6. 📊 **Analytics** at `/analytics` shows KPIs, student risk, and course metrics

---

## 🛡️ Security

- 🔐 **QR tokens** signed with HMAC-SHA256, rotating every 30s
- ⏱️ **Constant-time comparison** (`crypto.timingSafeEqual`) against timing attacks
- 🛡️ **Middleware** protects routes by role (organizer/student)
- 🔒 **Row Level Security** on all Supabase tables
- 🌐 **Security headers**: CSP, X-Frame-Options, HSTS, Permissions-Policy
- ⛓️ **Contract**: only the admin can write, idempotent operations

---

## 📄 License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html).
