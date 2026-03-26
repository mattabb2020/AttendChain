"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import PrimaryButton from "@/components/ui/PrimaryButton";

function QrDisplayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sid = searchParams.get("sid");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [qrData, setQrData] = useState<{
    joinUrl: string;
    expiresAt: number;
    rotationSeconds: number;
    className: string;
    attendeeCount: number;
    sessionId: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");

  // Fetch the current QR token
  const fetchQr = useCallback(async () => {
    if (!sid) return;
    try {
      const res = await fetch(`/api/sessions/${sid}/qr`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error cargando QR.");
        return;
      }
      const data = await res.json();
      setQrData(data);
      setError("");
    } catch {
      setError("Error de conexión.");
    }
  }, [sid]);

  // Initial fetch
  useEffect(() => {
    fetchQr();
  }, [fetchQr]);

  // Render QR code to canvas when data changes
  useEffect(() => {
    if (!qrData?.joinUrl || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, qrData.joinUrl, {
      width: 320,
      margin: 2,
      color: { dark: "#191c1e", light: "#ffffff" },
    });
  }, [qrData?.joinUrl]);

  // Countdown timer + auto-refresh
  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = qrData.expiresAt - now;

      if (remaining <= 0) {
        fetchQr(); // Refresh the QR
      } else {
        setCountdown(remaining);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [qrData, fetchQr]);

  // Close session
  const handleClose = async () => {
    if (!confirm("¿Cerrar la sesión? Los estudiantes ya no podrán registrarse."))
      return;
    setClosing(true);
    try {
      await fetch("/api/sessions", { method: "PATCH" });
      router.push("/organizer/sessions/open");
    } catch {
      setError("Error al cerrar la sesión.");
      setClosing(false);
    }
  };

  const rotationSec = qrData?.rotationSeconds || 30;
  const progress = countdown / rotationSec;
  const isLow = countdown <= 10;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary">
            verified_user
          </span>
          <span className="font-headline font-extrabold text-xl text-primary">
            AttendChain
          </span>
        </div>
        {qrData?.className && (
          <p className="text-on-surface-variant text-sm font-body">
            {qrData.className}
          </p>
        )}
      </div>

      {error ? (
        <div className="bg-error-container text-on-error-container px-6 py-4 rounded-2xl mb-6">
          {error}
        </div>
      ) : (
        <>
          {/* QR Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] mb-8">
            <div className="bg-surface-dim rounded-2xl p-4 flex items-center justify-center">
              <canvas ref={canvasRef} className="rounded-xl" />
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {/* SVG circular countdown */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#e1e2e4"
                    strokeWidth="3"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke={isLow ? "#ab0b1c" : "#004ac6"}
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                </svg>
                <span
                  className={`absolute inset-0 flex items-center justify-center text-sm font-label font-bold ${
                    isLow
                      ? "text-tertiary animate-countdown-pulse"
                      : "text-primary"
                  }`}
                >
                  {countdown}
                </span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-label">
                  Próxima rotación
                </p>
                <p className="text-xs text-on-surface-variant">
                  Actualización cada {rotationSec}s
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary-container rounded-full">
              <span className="material-symbols-outlined text-on-secondary-container text-[18px]">
                people
              </span>
              <span className="font-label font-bold text-on-secondary-container">
                {qrData?.attendeeCount || 0} registrados
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10">
              <span className="w-2 h-2 rounded-full bg-secondary animate-network-pulse" />
              <span className="text-[10px] font-label font-bold text-secondary uppercase">
                Stellar Live
              </span>
            </div>
          </div>
        </>
      )}

      {/* Close button */}
      <PrimaryButton
        onClick={handleClose}
        loading={closing}
        variant="outline"
        className="text-tertiary border-tertiary/20 hover:bg-tertiary/5"
      >
        <span className="material-symbols-outlined text-[18px]">stop</span>
        Cerrar Sesión
      </PrimaryButton>
    </div>
  );
}

export default function QrDisplayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-on-surface-variant">Cargando...</p>
        </div>
      }
    >
      <QrDisplayContent />
    </Suspense>
  );
}
