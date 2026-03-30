## 🏆 2nd Place Winner — Stellar Vendimia Tech Hackathon (Mendoza, Argentina)

AttendChain won **2nd place** at the Stellar track of the **Vendimia Tech 2026 Hackathon** in Mendoza, Argentina, earning a cash prize. Built in the Social Impact track, it demonstrates how blockchain can bring transparency and trust to everyday institutional processes.

---

## 🔎 The Problem

Attendance still runs on trust.

Universities and institutions rely on spreadsheets, static QR codes, or manual signatures — all vulnerable to:

- Proxy attendance (someone scans for you)
- Sharing QR screenshots
- Manipulation by administrators
- Lack of auditability
- No third-party verification

In academic settings, attendance impacts scholarships, academic standing, certifications, and institutional credibility — yet records remain centralized and editable.

There is no cryptographic proof that "I was in class."

---

## 💡 The Solution — AttendChain

AttendChain turns attendance into cryptographically verifiable evidence.

We built a web platform where:

- A professor creates a class
- A rotating QR code refreshes every ~30 seconds
- Students scan and confirm
- Each check-in generates a unique SHA-256 hash
- The hash is anchored on Stellar (Soroban testnet)

The result: an immutable, verifiable attendance record that cannot be edited, deleted, or forged — not even by us.

---

## ⚙️ How It Works (full end-to-end flow)

**Step 1 — Class creation**
The professor creates a class.

**Step 2 — Dynamic QR generation**
A QR code rotates every ~30 seconds to prevent screenshot reuse.

**Step 3 — Secure validation**
- HMAC-signed QR token
- Server-side validation
- Anti-replay protection

**Step 4 — Hash generation**
Attendance → SHA-256 hash

**Step 5 — On-chain anchoring**
The hash is recorded via a Soroban smart contract on Stellar testnet.

**Step 6 — Public verification**
Anyone can verify the attendance hash without accessing institutional databases.

---

## 🔐 Privacy by Design

We do NOT store personal data on-chain.

Only cryptographic hashes are anchored on Stellar.

- Personal information stays off-chain
- The blockchain stores only proof of existence
- Verification without exposing student records

This enables:

- A compliance-friendly architecture
- Minimal data exposure
- An institutional-grade security model

---

## 📊 Analytics Dashboard (demo)

We built a live analytics dashboard (currently with mock data) showing what universities would see once fully deployed:

👉 https://www.attendchain.com/analytics

It includes:

- Attendance rate per class
- Anchored vs. pending records
- Trends over time
- Fraud attempt detection
- Institutional insights

This connects Web3 integrity with Web2 usability.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Auth & Database:** Supabase (PostgreSQL + Row Level Security)
- **Blockchain:** Stellar Testnet
- **Smart Contracts:** Soroban (Rust)
- **Hashing:** SHA-256
- **Security:** HMAC-signed rotating QR tokens

---

## 🎯 Why This Matters

Most QR-based attendance systems are centralized tools with a nicer UI.

AttendChain is different.

We introduce:

- A public verification layer
- On-chain proof
- Replay-resistant rotating QR
- Immutable traceability
- Third-party trust without database access

This enables:

- Academic compliance auditing
- Scholarship validation
- Cross-institutional recognition
- Transparent attendance verification
- A more trustworthy system for professors and universities

---

## 🧪 Demo Links

- **Product:** https://www.attendchain.com/
- **About / MVP Description:** https://www.attendchain.com/about
- **Analytics dashboard (mock data):** https://www.attendchain.com/analytics
- **Public verification:** https://www.attendchain.com/verify
- **GitHub:** https://github.com/mattabb2020/AttendChain

---

## 🗺 Roadmap

- University pilot programs
- Mainnet deployment
- LMS integrations (Moodle, Canvas)
- Institutional API
- Optional geofencing layer
- Credential issuance integration

---

## 🤝 What We're Looking For

- Universities for pilot programs
- Security audit support
- Web3 ecosystem collaboration
- Grants to move to mainnet
- Educational ecosystem partnerships

---

📬 For more information, contact Matias on Telegram: [@m8tias](https://t.me/m8tias)
