"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const role = user.user_metadata?.role;
        if (role === "student") {
          router.replace("/student/scan");
        } else {
          router.replace("/organizer/dashboard");
        }
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <p className="text-sm text-on-surface-variant">Cargando...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative min-h-[618px] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)]" />

        <div className="max-w-4xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest">
              Built on Stellar Blockchain
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface leading-[1.1]">
            Transformamos la asistencia en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              evidencia verificable.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-body">
            Garantizá la integridad de cada registro con QR rotativo y sellado
            de tiempo inmutable en la blockchain de Stellar. Auditable,
            transparente y definitivo.
          </p>

        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "qr_code_2",
              title: "QR Rotativo",
              desc: "El código QR cambia cada 30 segundos. Solo quienes están presentes pueden escanearlo.",
            },
            {
              icon: "link",
              title: "Prueba On-Chain",
              desc: "Cada asistencia genera un hash SHA-256 que se ancla en la blockchain de Stellar.",
            },
            {
              icon: "verified",
              title: "Verificación Pública",
              desc: "Cualquier persona puede verificar un registro. Transparencia total.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-surface-container-lowest rounded-2xl p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">
                  {f.icon}
                </span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                {f.title}
              </h3>
              <p className="text-sm text-on-surface-variant font-body">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-headline font-bold text-gray-900 tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-gray-500 text-base font-body">
            Todo lo que necesitás saber sobre AttendChain
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "¿Cómo funciona el registro de asistencia?",
              a: "El organizador proyecta un código QR que se renueva cada 30 segundos. Vos lo escaneás con tu celular y tu asistencia queda registrada al instante en la blockchain de Stellar. No hace falta instalar nada.",
            },
            {
              q: "¿Por qué el QR cambia cada 30 segundos?",
              a: "La rotación evita que alguien comparta una captura de pantalla para marcar asistencia sin estar presente. Solo funciona el QR que se muestra en vivo en ese momento.",
            },
            {
              q: '¿Qué significa que la asistencia esté "en la blockchain"?',
              a: "Cada registro genera un hash único que se graba en la red Stellar. Es inmutable: nadie puede borrarlo ni modificarlo después. Cualquier persona puede verificar que el registro es auténtico.",
            },
            {
              q: "¿Cómo verifico que un registro es real?",
              a: "Cada check-in tiene un hash de transacción. Pegalo en nuestra página de verificación o directamente en el explorador de Stellar y vas a ver la fecha, hora y datos exactos del registro.",
            },
            {
              q: "¿Tiene algún costo usar AttendChain?",
              a: "No, es completamente gratis. Usamos la testnet de Stellar, así que no hay costos de transacción. Solo necesitás un navegador web y conexión a internet.",
            },
            {
              q: "¿Necesito una wallet de crypto para usarlo?",
              a: "No. AttendChain maneja todo por atrás. Vos solo escaneás el QR y listo. La blockchain trabaja de forma invisible para que la experiencia sea simple.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md open:shadow-md open:border-primary/30 open:bg-primary/[0.02]"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-gray-900 font-semibold text-sm select-none [&::-webkit-details-marker]:hidden list-none">
                <span>{faq.q}</span>
                <span className="flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-45">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
