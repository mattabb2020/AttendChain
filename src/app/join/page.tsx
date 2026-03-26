"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";
import StatusBadge from "@/components/ui/StatusBadge";
import HashDisplay from "@/components/ui/HashDisplay";
import type { CheckinResponse } from "@/types";

type Step = "name" | "submitting" | "result";

function JoinContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<Step>("name");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckinResponse | null>(null);

  // Poll for on-chain status update
  useEffect(() => {
    if (!result || result.onchain.status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/verify/${result.recordHash}`);
        const data = await res.json();
        if (data.onchainStatus === "SUCCESS" || data.onchainStatus === "FAILED") {
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  onchain: {
                    status: data.onchainStatus,
                    txHash: data.txHash,
                  },
                }
              : prev
          );
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Ingresá tu nombre.");
      return;
    }

    setStep("submitting");
    setError("");

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          qrToken: token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar asistencia.");
        setStep("name");
        return;
      }

      setResult(data);
      setStep("result");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setStep("name");
    }
  };

  // No QR token — show manual instructions
  if (!token) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-6">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                qr_code_scanner
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Escaneá el QR
            </h1>
            <p className="text-on-surface-variant text-sm">
              Pedile al organizador que proyecte el código QR y escanealo con tu
              cámara para registrar tu asistencia.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-6">
        <div className="w-full max-w-md">
          {/* Step: Enter name */}
          {step === "name" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">
                    how_to_reg
                  </span>
                </div>
                <h1 className="font-headline text-2xl font-bold text-on-surface">
                  Registrar Asistencia
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Ingresá tu nombre para confirmar tu presencia
                </p>
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    required
                    autoFocus
                    className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  variant="secondary"
                  className="w-full"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    check
                  </span>
                  Registrar Asistencia
                </PrimaryButton>
              </form>
            </div>
          )}

          {/* Step: Submitting */}
          {step === "submitting" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">
                Registrando...
              </h2>
              <p className="text-sm text-on-surface-variant">
                Estamos verificando y registrando tu asistencia en la blockchain
              </p>
            </div>
          )}

          {/* Step: Result */}
          {step === "result" && result && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container text-3xl">
                    verified
                  </span>
                </div>
                <h1 className="font-headline text-2xl font-bold text-on-surface">
                  ¡Asistencia Registrada!
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Tu registro está siendo anclado en la blockchain de Stellar
                </p>
              </div>

              {/* Status */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">
                    Estado on-chain
                  </span>
                  <StatusBadge status={result.onchain.status} />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">
                      Record Hash
                    </p>
                    <HashDisplay hash={result.recordHash} />
                  </div>

                  {result.onchain.txHash && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">
                        Transaction Hash
                      </p>
                      <HashDisplay hash={result.onchain.txHash} />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href={`/verify/${result.recordHash}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary/5 text-primary rounded-xl font-semibold hover:bg-primary/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    verified
                  </span>
                  Verificar mi registro
                </Link>

                {result.onchain.status === "PENDING" && (
                  <p className="text-center text-xs text-on-surface-variant animate-pulse">
                    Esperando confirmación de la blockchain...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <p className="text-on-surface-variant">Cargando...</p>
          </div>
        </PageShell>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
