# ⛓️ AttendChain

> Asistencia verificable en blockchain. QR rotativo + Smart Contract Soroban en Stellar Testnet.

🌐 **Live:** [www.attendchain.com](https://www.attendchain.com)
📜 **Contrato:** [Ver en Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBV35SVYVYIHD4KSKRC6U3KYS7OY3TCY4FHSVLWMXM3OM45POAHQ4TVA)

---

## ❌ Problema

Los registros de asistencia tradicionales son manipulables. No hay forma de verificar de manera independiente si alguien realmente asistio. Las instituciones pueden reescribir los registros sin dejar rastro.

## ✅ Solucion

AttendChain convierte cada check-in de asistencia en evidencia inmutable y verificable:

1. 📱 **QR Rotativo** — Cambia cada 30 segundos. Solo presentes pueden escanearlo.
2. 🔐 **Hash SHA-256** — Cada check-in genera una huella digital criptografica unica.
3. ⛓️ **Smart Contract Soroban** — El hash se registra invocando `record_attendance` en un contrato desplegado en Stellar Testnet.
4. 🔍 **Verificacion Publica** — Cualquier persona puede verificar un registro con el `recordHash`, sin necesidad de autenticacion.
5. 📊 **Dashboard Analitico** — Panel institucional con KPIs academicos, asesor de riesgo, salud del curso y perfil individual de estudiantes.

---

## 🛠️ Tech Stack

| Capa | Tecnologia |
|------|-----------|
| 🖥️ Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| 🗄️ Base de datos | Supabase (PostgreSQL + Row Level Security) |
| ⛓️ Blockchain | Stellar Testnet + Soroban Smart Contract (Rust) |
| 📦 SDK | `@stellar/stellar-sdk` v14 (`contract.Client`) |
| 🔑 Autenticacion | Supabase Auth (email) + middleware role-based |
| 🚀 Deploy | Vercel (serverless) |

---

## ⛓️ Integracion Stellar / Soroban

El contrato Soroban (`soroban-contract/src/lib.rs`) se invoca directamente desde el backend:

| Funcion | Tipo | Uso |
|---------|------|-----|
| `record_attendance(admin, record_hash, session_hash, ts)` | ✍️ Escritura | Registra asistencia on-chain. Requiere auth del admin. Idempotente. |
| `has(record_hash)` | 👁️ Lectura | Verifica si un registro existe (simulacion, sin tx). |
| `get(record_hash)` | 👁️ Lectura | Obtiene `(session_hash, timestamp)` de un registro. |
| `bump(record_hash)` | ✍️ Escritura | Extiende el TTL de un registro. |
| `upgrade(admin, new_wasm_hash)` | ✍️ Escritura | Actualiza el WASM del contrato. Solo admin. |

- 🔗 **`contract.Client.from()`** obtiene la spec del contrato on-chain y genera metodos dinamicos
- ✍️ **`basicNodeSigner`** firma transacciones y auth entries server-side
- 🔒 **Firma institucional** — la secret key nunca llega al browser
- 🌍 **Verificacion publica** — cualquiera puede verificar un hash sin autenticacion

---

## 📊 Dashboard Analitico

Panel institucional en `/analytics` con cuatro vistas:

- 📈 **Vista General** — KPIs academicos y panorama de riesgo institucional
- 🧑‍🏫 **Asesor Academico** — Cola de riesgo y gestion de casos estudiantiles
- 📚 **Salud del Curso** — Metricas de rendimiento por seccion
- 🎓 **Perfil Estudiante** — Detalle de riesgo y linea de tiempo individual

---

## 🚀 Setup

### 1️⃣ Clonar e instalar

```bash
git clone https://github.com/mattabb2020/AttendChain.git
cd AttendChain
npm install
```

### 2️⃣ Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **Settings > API** y copiar las keys
3. Ir a **SQL Editor** y ejecutar `supabase/schema.sql`
4. En **Authentication > Settings** habilitar el provider de Email

### 3️⃣ Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local` con los valores de Supabase y Stellar.

### 4️⃣ Compilar y desplegar el contrato Soroban

Prerequisitos: [Rust](https://rustup.rs) + target `wasm32-unknown-unknown` + [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)

```bash
# Instalar prerequisitos (si no los tienes)
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli

# Compilar, desplegar e inicializar el contrato
node scripts/deploy-contract.mjs
```

El script compila el WASM, lo despliega a testnet, inicializa el contrato con el admin, y escribe el `CONTRACT_ID` en `.env.local`.

### 5️⃣ Correr localmente

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### 6️⃣ Deploy a Vercel

1. Push a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Agregar las variables de entorno (incluyendo `CONTRACT_ID` e `INSTITUTION_SECRET`)
4. Deploy

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                  # 🏠 Landing
│   ├── auth/                     # 🔑 Login y registro
│   ├── analytics/                # 📊 Dashboard analitico institucional
│   │   ├── _views/              # OverviewView, AdvisorView, CourseHealthView, StudentProfileView
│   │   └── _components/         # SidebarNav
│   ├── organizer/
│   │   ├── dashboard/            # 📋 Dashboard del organizador
│   │   ├── classes/new/          # ➕ Crear clase
│   │   └── sessions/
│   │       ├── open/             # ▶️ Abrir sesion
│   │       └── active/qr/       # 📱 QR rotativo (pantalla principal)
│   ├── student/
│   │   ├── scan/                 # 📷 Escanear QR para check-in
│   │   └── profile/              # 👤 Historial de asistencias
│   ├── verify/                   # 🔍 Verificacion publica
│   └── api/                      # ⚡ API Routes (11 endpoints)
├── components/                   # 🧩 Componentes UI reutilizables
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
├── deploy-contract.mjs          # 🚀 Compila, despliega e inicializa
supabase/
├── schema.sql                   # 🗄️ Database schema + RLS policies
```

---

## 🎬 Flujo de demo

1. 🧑‍🏫 **Organizador** inicia sesion → crea clase → abre sesion → proyecta QR
2. 📱 **QR** rota cada 30 segundos con countdown visual
3. 🎓 **Estudiante** escanea QR → ingresa nombre → confirma asistencia
4. ⚙️ **Backend** calcula `recordHash = SHA-256(sessionId|attendeeId|timestamp)` → invoca `record_attendance` en el contrato Soroban
5. 🔍 **Verificacion** en `/verify/{recordHash}` consulta el contrato via `has()` + `get()` y muestra el resultado con link a Stellar Explorer
6. 📊 **Analytics** en `/analytics` muestra KPIs, riesgo estudiantil y metricas por curso

---

## 🛡️ Seguridad

- 🔐 **QR tokens** firmados con HMAC-SHA256, rotacion cada 30s
- ⏱️ **Comparacion constant-time** (`crypto.timingSafeEqual`) contra timing attacks
- 🛡️ **Middleware** protege rutas por rol (organizador/estudiante)
- 🔒 **Row Level Security** en todas las tablas de Supabase
- 🌐 **Security headers**: CSP, X-Frame-Options, HSTS, Permissions-Policy
- ⛓️ **Contrato**: solo el admin puede escribir, operaciones idempotentes

---

## 📄 Licencia

Este proyecto esta licenciado bajo la [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html).
