"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { DbClass } from "@/types";

export default function OpenSessionPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [classId, setClassId] = useState("");
  const [rotation, setRotation] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data.classes || []);
        if (data.classes?.length > 0) setClassId(data.classes[0].id);
      })
      .catch(() => setError("Error cargando clases."))
      .finally(() => setLoadingClasses(false));

    // Check if there's already an active session
    fetch("/api/sessions")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.session) {
          // Already have an open session, go to QR
          router.push(`/organizer/sessions/active/qr?sid=${data.session.id}`);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, qrRotationSeconds: rotation }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push(`/organizer/sessions/active/qr?sid=${data.session.id}`);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Abrir Sesión
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Configurá y abrí una nueva sesión de asistencia
            </p>
          </div>

          <form onSubmit={handleOpen} className="space-y-6">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Class selector */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Clase
              </label>
              {loadingClasses ? (
                <div className="px-4 py-3 bg-surface-container-low rounded-xl text-sm text-on-surface-variant">
                  Cargando clases...
                </div>
              ) : classes.length === 0 ? (
                <div className="bg-surface-container-low rounded-2xl p-5 text-center space-y-3">
                  <p className="text-sm text-on-surface-variant">
                    No tenés clases creadas todavía.
                  </p>
                  <Link
                    href="/organizer/classes/new"
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      add
                    </span>
                    Crear una clase
                  </Link>
                </div>
              ) : (
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* QR Rotation */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Rotación del QR
              </label>
              <div className="flex gap-3">
                {[10, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRotation(sec)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                      rotation === sec
                        ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                El QR se actualiza automáticamente cada {rotation} segundos
              </p>
            </div>

            {/* Warning */}
            <div className="bg-surface-container-low rounded-2xl p-5 flex gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                info
              </span>
              <p className="text-xs text-on-surface-variant">
                Solo podés tener una sesión activa a la vez. El QR rotativo es
                la prueba de presencia: solo quienes estén presentes podrán
                escanearlo.
              </p>
            </div>

            <PrimaryButton
              type="submit"
              loading={loading}
              disabled={!classId || classes.length === 0}
              className="w-full"
            >
              <span className="material-symbols-outlined text-[20px]">
                play_arrow
              </span>
              Abrir Sesión
            </PrimaryButton>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
