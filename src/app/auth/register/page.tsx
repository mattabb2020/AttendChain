"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "organizer">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // 1. Register
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error);
        return;
      }

      // 2. Auto-login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        // Registration worked but login failed — redirect to login page
        router.push("/auth/login");
        return;
      }

      const loginData = await loginRes.json();
      const userRole = loginData.user?.role || role;

      router.push(userRole === "organizer" ? "/organizer/dashboard" : "/student/scan");
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
            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-3xl">
                person_add
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Crear Cuenta
            </h1>
            <p className="text-sm text-on-surface-variant">
              Registrate para verificar tu asistencia en blockchain
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="flex gap-3">
              {(["student", "organizer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    role === r
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {r === "student" ? "Estudiante" : "Organizador"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
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
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetí la contraseña"
                  required
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <PrimaryButton
              type="submit"
              loading={loading}
              className="w-full"
              variant="secondary"
            >
              Crear Cuenta
            </PrimaryButton>

            <p className="text-center text-sm text-on-surface-variant">
              ¿Ya tenés cuenta?{" "}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
