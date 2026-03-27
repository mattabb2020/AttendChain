"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";
import StatusBadge from "@/components/ui/StatusBadge";
import HashDisplay from "@/components/ui/HashDisplay";
import type { CheckinResponse } from "@/types";

type Step = "scanning" | "submitting" | "result" | "error";

export default function StudentScanPage() {
  const [step, setStep] = useState<Step>("scanning");
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [scannerReady, setScannerReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        await scanner.stop();
      }
    } catch {
      // Ignore stop errors
    }
  }, []);

  const handleCheckin = useCallback(async (token: string) => {
    setStep("submitting");
    setError("");

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ qrToken: token }),
      });

      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        setError(data.error || "Error al registrar asistencia.");
        setStep("error");
        return;
      }

      setResult(data);
      setStep("result");
    } catch {
      if (!mountedRef.current) return;
      setError("Error de conexión. Intentá de nuevo.");
      setStep("error");
    }
  }, []);

  const startScanner = useCallback(async () => {
    // Wait for DOM element to exist
    const element = document.getElementById("qr-reader");
    if (!element || !mountedRef.current) return;

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!mountedRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          if (processingRef.current || !mountedRef.current) return;
          processingRef.current = true;

          let token = decodedText;
          try {
            const url = new URL(decodedText);
            token = url.searchParams.get("token") || decodedText;
          } catch {
            // Not a URL
          }

          stopScanner();
          handleCheckin(token);
        },
        () => {} // Ignore scan failures
      );

      if (mountedRef.current) {
        setScannerReady(true);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Camera error:", err);
      setCameraError(
        "No se pudo acceder a la cámara. Verificá los permisos del navegador."
      );
    }
  }, [stopScanner, handleCheckin]);

  // Start scanner on mount
  useEffect(() => {
    mountedRef.current = true;
    processingRef.current = false;

    if (step === "scanning") {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(startScanner, 300);
      return () => {
        clearTimeout(timer);
        mountedRef.current = false;
        stopScanner();
      };
    }

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [step, startScanner, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [stopScanner]);

  const handleRetry = async () => {
    await stopScanner();
    processingRef.current = false;
    setScannerReady(false);
    setCameraError("");
    setError("");
    setStep("scanning");
  };

  // Poll for on-chain status
  useEffect(() => {
    if (!result || result.onchain.status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/verify/${result.recordHash}`);
        const data = await res.json();
        if (data.onchainStatus === "SUCCESS" || data.onchainStatus === "FAILED") {
          setResult((prev) =>
            prev
              ? { ...prev, onchain: { status: data.onchainStatus, txHash: data.txHash } }
              : prev
          );
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [result]);

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-6">
        <div className="w-full max-w-md">
          {/* Scanning */}
          {step === "scanning" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="font-headline text-2xl font-bold text-on-surface">
                  Escanear QR
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Apuntá la cámara al código QR proyectado por el organizador
                </p>
              </div>

              {cameraError ? (
                <div className="space-y-4">
                  <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                    {cameraError}
                  </div>
                  <PrimaryButton onClick={handleRetry} className="w-full">
                    Reintentar
                  </PrimaryButton>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-surface-dim min-h-[300px]">
                  <div id="qr-reader" className="w-full" />
                  {!scannerReady && (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-sm text-on-surface-variant">Iniciando cámara...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Manual fallback */}
              <details className="text-sm">
                <summary className="text-on-surface-variant cursor-pointer hover:text-primary">
                  ¿No funciona la cámara? Ingresá el código manualmente
                </summary>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as HTMLFormElement).token as HTMLInputElement;
                    if (input.value.trim()) {
                      processingRef.current = true;
                      stopScanner();
                      handleCheckin(input.value.trim());
                    }
                  }}
                >
                  <input
                    name="token"
                    type="text"
                    placeholder="Pegá el token del QR"
                    className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <PrimaryButton type="submit">Enviar</PrimaryButton>
                </form>
              </details>
            </div>
          )}

          {/* Submitting */}
          {step === "submitting" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">
                Registrando asistencia...
              </h2>
              <p className="text-sm text-on-surface-variant">
                Verificando QR y registrando en la blockchain de Stellar
              </p>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-error-container text-3xl">error</span>
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Error</h2>
                <p className="text-sm text-on-surface-variant mt-1">{error}</p>
              </div>
              <PrimaryButton onClick={handleRetry} className="w-full">
                Reintentar
              </PrimaryButton>
            </div>
          )}

          {/* Result */}
          {step === "result" && result && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container text-3xl">verified</span>
                </div>
                <h1 className="font-headline text-2xl font-bold text-on-surface">
                  ¡Asistencia Registrada!
                </h1>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">Estado on-chain</span>
                  <StatusBadge status={result.onchain.status} />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Record Hash</p>
                    <HashDisplay hash={result.recordHash} />
                  </div>
                  {result.onchain.txHash && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Transaction Hash</p>
                      <HashDisplay hash={result.onchain.txHash} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/verify/${result.recordHash}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary/5 text-primary rounded-xl font-semibold hover:bg-primary/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  Verificar mi registro
                </Link>
                <PrimaryButton onClick={handleRetry} variant="outline" className="w-full">
                  Escanear otro QR
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
