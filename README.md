# AttendChain

Asistencia verificable en blockchain. QR rotativo + prueba on-chain en Stellar.

## Problema

Los registros de asistencia tradicionales son fácilmente manipulables. No hay forma de verificar de manera independiente si alguien realmente asistió. Las instituciones pueden reescribir los registros sin dejar rastro.

## Solución

AttendChain convierte cada check-in de asistencia en evidencia inmutable y verificable:

1. **QR Rotativo** — Cambia cada 30 segundos. Solo presentes pueden escanearlo.
2. **Hash SHA-256** — Cada check-in genera una huella digital criptográfica única.
3. **Prueba On-Chain** — El hash se registra en un contrato Soroban en Stellar Testnet.
4. **Verificación Pública** — Cualquier persona puede verificar un registro con el `recordHash`.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL)
- **Blockchain:** Stellar Testnet + Soroban Smart Contract
- **SDK:** `@stellar/stellar-sdk`
- **Deploy:** Vercel (serverless)

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/attendchain.git
cd attendchain
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **Settings > API** y copiar las keys
3. Ir a **SQL Editor** y ejecutar `supabase/schema.sql`
4. En **Authentication > Settings** habilitar el provider de Email

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local` con los valores de Supabase y Stellar.

### 4. Soroban Contract (opcional para dev local)

```bash
# Requiere Rust + Stellar CLI
cd soroban-contract
stellar contract build
stellar keys generate institution --network testnet
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/attend_contract.wasm --source institution --network testnet
# Copiar el CONTRACT_ID al .env.local
```

### 5. Correr localmente

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### 6. Deploy a Vercel

1. Push a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Agregar las variables de entorno
4. Deploy

## Estructura del proyecto

```
src/
├── app/                          # Páginas (Next.js App Router)
│   ├── page.tsx                  # Landing
│   ├── auth/login/               # Login organizador
│   ├── organizer/
│   │   ├── classes/new/          # Crear clase
│   │   └── sessions/
│   │       ├── open/             # Abrir sesión
│   │       └── active/qr/       # QR rotativo (pantalla principal)
│   ├── join/                     # Check-in estudiante
│   ├── verify/                   # Verificar registro
│   └── api/                      # API Routes
│       ├── auth/login/
│       ├── classes/
│       ├── sessions/
│       ├── checkins/
│       └── verify/[recordHash]/
├── components/                   # Componentes UI
├── lib/                          # Lógica de negocio
│   ├── qr.ts                    # QR token HMAC
│   ├── hash.ts                  # SHA-256 recordHash
│   ├── stellar.ts               # Soroban integration
│   └── supabase/                # Supabase clients
├── types/                        # TypeScript interfaces
supabase/schema.sql               # Database schema
soroban-contract/                  # Rust smart contract
```

## Flujo de demo

1. **Organizador** inicia sesión > crea clase > abre sesión > proyecta QR
2. **QR** rota cada 30 segundos con countdown visual
3. **Estudiante** escanea QR > ingresa nombre > confirma asistencia
4. **Backend** calcula `recordHash = SHA-256(sessionId|attendeeId|timestamp)` > registra en Soroban
5. **Verificación** en `/verify/{recordHash}` muestra EXISTE + link a Stellar Explorer

## Integración Stellar

- **Contrato Soroban** (`soroban-contract/src/lib.rs`): 3 funciones
  - `record_attendance(record_hash, session_hash, ts)` — almacena el hash + emite evento
  - `has(record_hash)` — verifica existencia (usado por la página de verificación)
  - `get(record_hash)` — obtiene detalles
- **Firma institucional** server-side only — la secret key nunca llega al browser
- **Verificación pública** — cualquiera puede verificar un hash sin autenticación

## Licencia

MIT
