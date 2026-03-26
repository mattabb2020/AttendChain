"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión.");
        return;
      }

      // Redirect based on role
      const role = data.user?.role || "organizer";
      router.push(role === "student" ? "/student/scan" : "/organizer/sessions/open");
      router.refresh();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                lock
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-on-surface-variant">
              Ingresá como organizador o estudiante
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <PrimaryButton type="submit" loading={loading} className="w-full">
              Iniciar Sesión
            </PrimaryButton>

            <p className="text-center text-sm text-on-surface-variant">
              ¿No tenés cuenta?{" "}
              <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                Registrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
