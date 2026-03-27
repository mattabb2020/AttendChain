"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function NewClassPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/organizer/dashboard"), 1500);
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
          {/* Header */}
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Nueva Clase
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Creá una clase para registrar asistencia
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="bg-secondary-container text-on-secondary-container px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              Clase creada exitosamente. Redirigiendo...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Título de la clase *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Matemáticas III - 2do Cuatrimestre"
                required
                minLength={3}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Una breve descripción de la clase..."
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Info panel */}
            <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[20px]">
                  info
                </span>
                <span className="text-sm font-semibold">Registro Digital</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Cada clase generará un QR rotativo. Los registros de asistencia
                se anclan en la blockchain de Stellar como evidencia inmutable.
              </p>
            </div>

            <PrimaryButton
              type="submit"
              loading={loading}
              disabled={success}
              className="w-full"
            >
              Crear Clase
            </PrimaryButton>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
