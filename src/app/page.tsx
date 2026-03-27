"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all text-center"
            >
              Crear Cuenta
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-on-primary rounded-xl font-semibold hover:scale-[0.98] transition-all shadow-lg shadow-secondary/20 text-center"
            >
              Ingresar
            </Link>
            <Link
              href="/verify"
              className="w-full sm:w-auto px-8 py-4 text-primary font-semibold hover:bg-primary/5 rounded-xl transition-all border border-primary/20 text-center"
            >
              Verificar Registro
            </Link>
          </div>
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
    </PageShell>
  );
}
