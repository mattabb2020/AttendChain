import Link from "next/link";
import PageShell from "@/components/layout/PageShell";

export default function AboutPage() {
  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
            ⛓️ AttendChain
          </h1>
          <p className="text-lg text-on-surface-variant font-body">
            Asistencia verificable en blockchain. QR rotativo + Smart Contract
            Soroban en Stellar Testnet.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.attendchain.com"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              🌐 Live Demo
            </a>
            <a
              href="https://github.com/mattabb2020/AttendChain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              💻 GitHub
            </a>
            <a
              href="https://stellar.expert/explorer/testnet/contract/CBV35SVYVYIHD4KSKRC6U3KYS7OY3TCY4FHSVLWMXM3OM45POAHQ4TVA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              📜 Contrato en Stellar Expert
            </a>
          </div>
        </header>

        <hr className="border-outline-variant" />

        {/* Problema */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            ❌ Problema
          </h2>
          <p className="text-on-surface-variant font-body">
            Los registros de asistencia en instituciones educativas y eventos son{" "}
            <strong className="text-on-surface">facilmente manipulables</strong>.
            Un profesor puede alterar una lista, un administrador puede
            reescribir registros, y un estudiante no tiene forma de demostrar que
            realmente asistio.
          </p>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>🔴 <strong className="text-on-surface">Fraude academico</strong> — Asistencias falsificadas sin consecuencias</li>
            <li>🔴 <strong className="text-on-surface">Falta de transparencia</strong> — No existe auditoria independiente de los registros</li>
            <li>🔴 <strong className="text-on-surface">Sin prueba verificable</strong> — El estudiante depende 100% de la institucion para demostrar su asistencia</li>
            <li>🔴 <strong className="text-on-surface">Costo operativo</strong> — Procesos manuales propensos a error y manipulacion</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* Solucion */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            ✅ Solucion
          </h2>
          <p className="text-on-surface-variant font-body">
            AttendChain es una plataforma web que registra cada asistencia como
            una{" "}
            <strong className="text-on-surface">
              prueba criptografica inmutable
            </strong>{" "}
            en la blockchain de Stellar, usando un Smart Contract Soroban.
          </p>

          <h3 className="text-lg font-headline font-bold text-on-surface pt-2">
            Como funciona:
          </h3>
          <div className="space-y-3 text-on-surface-variant font-body">
            <p><strong className="text-on-surface">1. 📱 QR Rotativo</strong> — El profesor proyecta un codigo QR que cambia cada 30 segundos. Solo quien esta fisicamente presente puede escanearlo.</p>
            <p><strong className="text-on-surface">2. 🔐 Hash Criptografico</strong> — Al escanear, el backend genera un <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">recordHash = SHA-256(sessionId | attendeeId | timestamp)</code>, creando una huella digital unica e irrepetible.</p>
            <p><strong className="text-on-surface">3. ⛓️ Registro On-Chain</strong> — El hash se registra invocando <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">record_attendance()</code> en nuestro contrato Soroban desplegado en Stellar Testnet. La transaccion es firmada server-side por la institucion.</p>
            <p><strong className="text-on-surface">4. 🔍 Verificacion Publica</strong> — Cualquier persona puede verificar un registro en <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">/verify/{"{recordHash}"}</code>. No necesita cuenta ni autenticacion. El contrato es la fuente de verdad.</p>
            <p><strong className="text-on-surface">5. 📊 Dashboard Analitico</strong> — Panel institucional con KPIs academicos, asesor de riesgo estudiantil, metricas por curso y perfil individual de estudiantes.</p>
          </div>
        </section>

        <hr className="border-outline-variant" />

        {/* Stellar Integration */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            ⛓️ Integracion con Stellar / Soroban
          </h2>
          <p className="text-on-surface-variant font-body">
            AttendChain usa{" "}
            <strong className="text-on-surface">Soroban Smart Contracts</strong>{" "}
            como capa de verdad inmutable. No es una integracion superficial: el
            contrato se compila desde Rust, se despliega a testnet, y se invoca
            en cada check-in.
          </p>

          <h3 className="text-lg font-headline font-bold text-on-surface pt-2">
            Smart Contract
          </h3>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>✍️ <strong className="text-on-surface"><code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">record_attendance()</code></strong> — Registra hash on-chain. Admin-only, idempotente, emite evento.</li>
            <li>👁️ <strong className="text-on-surface"><code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">has()</code></strong> — Verifica existencia de un registro (via simulacion, sin tx).</li>
            <li>👁️ <strong className="text-on-surface"><code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">get()</code></strong> — Obtiene <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">(session_hash, timestamp)</code> de un registro.</li>
            <li>✍️ <strong className="text-on-surface"><code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">bump()</code></strong> — Extiende TTL de un registro para que no expire.</li>
            <li>✍️ <strong className="text-on-surface"><code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">upgrade()</code></strong> — Actualiza el WASM del contrato. Solo admin.</li>
          </ul>

          <h3 className="text-lg font-headline font-bold text-on-surface pt-2">
            Integracion en el Backend
          </h3>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>🔗 <strong className="text-on-surface"><code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">contract.Client.from()</code></strong> — Obtiene la spec del contrato on-chain y genera metodos dinamicos automaticamente</li>
            <li>✍️ <strong className="text-on-surface"><code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">basicNodeSigner</code></strong> — Firma transacciones y auth entries server-side con la clave institucional</li>
            <li>🔒 <strong className="text-on-surface">Seguridad</strong> — La <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">INSTITUTION_SECRET</code> nunca sale del servidor. El browser no tiene acceso.</li>
            <li>⚡ <strong className="text-on-surface">Lazy singleton</strong> — El cliente se inicializa una vez y se reutiliza, con retry automatico si falla.</li>
          </ul>

          <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 text-sm text-on-surface-variant font-body">
            📜 <strong className="text-on-surface">Contrato verificable:</strong>{" "}
            <a
              href="https://stellar.expert/explorer/testnet/contract/CBV35SVYVYIHD4KSKRC6U3KYS7OY3TCY4FHSVLWMXM3OM45POAHQ4TVA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Ver en Stellar Expert
            </a>{" "}
            — Cada invocacion de <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">record_attendance</code> emite un evento visible en el explorer.
          </div>
        </section>

        <hr className="border-outline-variant" />

        {/* Tech Stack */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            🛠️ Tech Stack
          </h2>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>🖥️ <strong className="text-on-surface">Frontend</strong> — Next.js 14 (App Router) + TypeScript strict + Tailwind CSS</li>
            <li>🗄️ <strong className="text-on-surface">Base de datos</strong> — Supabase (PostgreSQL + Row Level Security)</li>
            <li>⛓️ <strong className="text-on-surface">Blockchain</strong> — Stellar Testnet + Soroban Smart Contract (Rust)</li>
            <li>📦 <strong className="text-on-surface">SDK</strong> — <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">@stellar/stellar-sdk</code> v14 — <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">contract.Client</code></li>
            <li>🔑 <strong className="text-on-surface">Auth</strong> — Supabase Auth (email) + middleware role-based</li>
            <li>🚀 <strong className="text-on-surface">Deploy</strong> — Vercel (serverless)</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* Seguridad */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            🛡️ Seguridad
          </h2>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>🔐 <strong className="text-on-surface">QR tokens</strong> firmados con HMAC-SHA256, rotacion cada 30 segundos</li>
            <li>⏱️ <strong className="text-on-surface">Comparacion constant-time</strong> con <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">crypto.timingSafeEqual()</code> contra timing attacks</li>
            <li>🛡️ <strong className="text-on-surface">Middleware</strong> protege rutas por rol (organizador / estudiante)</li>
            <li>🔒 <strong className="text-on-surface">Row Level Security</strong> en todas las tablas de Supabase</li>
            <li>🌐 <strong className="text-on-surface">Security headers</strong> — CSP, X-Frame-Options, HSTS, Strict-Transport-Security, Permissions-Policy</li>
            <li>⛓️ <strong className="text-on-surface">Contrato</strong> — solo el admin puede escribir, operaciones idempotentes previenen duplicados</li>
            <li>🚫 <strong className="text-on-surface">Zero secrets en el browser</strong> — Todas las claves se manejan server-side</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* Impacto Social */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            🌍 Impacto Social
          </h2>
          <p className="text-on-surface-variant font-body">
            AttendChain apunta al{" "}
            <strong className="text-on-surface">Track 2: Impacto Social</strong>{" "}
            de Vendimia Tech 2026.
          </p>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>🎓 <strong className="text-on-surface">Transparencia educativa</strong> — Los estudiantes tienen prueba inmutable de su asistencia, independiente de la institucion.</li>
            <li>🏛️ <strong className="text-on-surface">Instituciones auditables</strong> — Los registros no pueden ser alterados retroactivamente. Blockchain como fuente de verdad.</li>
            <li>🌎 <strong className="text-on-surface">Escalable a LATAM</strong> — Problema universal en universidades, escuelas, capacitaciones corporativas y eventos.</li>
            <li>💰 <strong className="text-on-surface">Costo cero para el usuario</strong> — No necesita wallet, no paga gas. La institucion absorbe el costo minimo de testnet.</li>
            <li>📱 <strong className="text-on-surface">Accesible</strong> — Solo necesita un celular con camara. No requiere app nativa, funciona en cualquier navegador.</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* Demo Flow */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            🎬 Demo Flow (3 minutos)
          </h2>
          <div className="space-y-3 text-on-surface-variant font-body">
            <p><strong className="text-on-surface">1.</strong> 🧑‍🏫 <strong className="text-on-surface">Organizador</strong> inicia sesion → crea clase → abre sesion → proyecta QR en pantalla</p>
            <p><strong className="text-on-surface">2.</strong> 📱 <strong className="text-on-surface">QR rota</strong> cada 30 segundos con countdown visual. Imposible compartir por foto.</p>
            <p><strong className="text-on-surface">3.</strong> 🎓 <strong className="text-on-surface">Estudiante</strong> escanea QR con su celular → confirma asistencia</p>
            <p><strong className="text-on-surface">4.</strong> ⛓️ <strong className="text-on-surface">On-chain:</strong> el hash se registra en el contrato Soroban. Visible en Stellar Explorer.</p>
            <p><strong className="text-on-surface">5.</strong> 🔍 <strong className="text-on-surface">Verificacion:</strong> cualquiera puede verificar el registro en <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">/verify/{"{hash}"}</code></p>
            <p><strong className="text-on-surface">6.</strong> 📊 <strong className="text-on-surface">Dashboard:</strong> panel analitico con KPIs, riesgo estudiantil y metricas por curso</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-on-surface-variant font-body">
            🌐 <strong className="text-on-surface">Probalo en vivo:</strong>{" "}
            <a href="https://www.attendchain.com" className="text-primary hover:underline">www.attendchain.com</a>
          </div>
        </section>

        <hr className="border-outline-variant" />

        {/* Roadmap */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            🔮 Roadmap
          </h2>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>📍 <strong className="text-on-surface">Geofencing</strong> — Validar ubicacion GPS del estudiante al momento del check-in</li>
            <li>📸 <strong className="text-on-surface">Verificacion por foto</strong> — Selfie al momento del check-in como prueba adicional</li>
            <li>🏛️ <strong className="text-on-surface">Multi-tenancy</strong> — Soporte para multiples instituciones en una sola instancia</li>
            <li>⛓️ <strong className="text-on-surface">Mainnet</strong> — Migracion de Stellar Testnet a Mainnet para registros permanentes</li>
            <li>📊 <strong className="text-on-surface">Exportacion</strong> — Reportes de asistencia en CSV/PDF para administradores</li>
            <li>🔗 <strong className="text-on-surface">Integracion LMS</strong> — Conexion con Moodle, Google Classroom, Canvas</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* Equipo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            👥 Equipo
          </h2>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li><strong className="text-on-surface">Morella Gallardo</strong></li>
            <li><strong className="text-on-surface">Guadalupe Montana</strong></li>
            <li><strong className="text-on-surface">Abril Cortez</strong></li>
            <li><strong className="text-on-surface">Matias Abbona</strong></li>
          </ul>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-on-surface-variant font-body">
            📬 Para mas informacion, contactar a Matias en Telegram: <strong className="text-on-surface">@m8tias</strong>
          </div>
        </section>

        <hr className="border-outline-variant" />

        {/* Links */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            🔗 Links
          </h2>
          <ul className="space-y-2 text-on-surface-variant font-body">
            <li>🌐 <strong className="text-on-surface">Live Demo</strong> — <a href="https://www.attendchain.com" className="text-primary hover:underline">www.attendchain.com</a></li>
            <li>💻 <strong className="text-on-surface">GitHub</strong> — <a href="https://github.com/mattabb2020/AttendChain" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/mattabb2020/AttendChain</a></li>
            <li>📜 <strong className="text-on-surface">Contrato Soroban</strong> — <a href="https://stellar.expert/explorer/testnet/contract/CBV35SVYVYIHD4KSKRC6U3KYS7OY3TCY4FHSVLWMXM3OM45POAHQ4TVA" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stellar Expert</a></li>
          </ul>
        </section>

        {/* Back to home */}
        <div className="pt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver al inicio
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
