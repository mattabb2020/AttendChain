"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/client";

interface CheckinRecord {
  id: string;
  record_hash: string;
  onchain_status: "PENDING" | "SUCCESS" | "FAILED";
  tx_hash: string | null;
  created_at: string;
  attendees: {
    display_name: string;
    sessions: {
      id: string;
      opened_at: string;
      classes: { title: string };
    };
  };
}

const accentColors = {
  PENDING: "bg-amber-400",
  SUCCESS: "bg-emerald-500",
  FAILED: "bg-red-500",
} as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CopyHashButton({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
        copied
          ? "text-emerald-600 bg-emerald-50"
          : "text-gray-500 bg-gray-100 hover:bg-gray-200"
      }`}
    >
      <span className="material-symbols-outlined text-[15px]">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copiado" : "Copiar Hash"}
    </button>
  );
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser({
        email: user.email || "",
        name: user.user_metadata?.name || "",
      });
    });

    fetch("/api/student/checkins")
      .then((res) => res.json())
      .then((data) => setCheckins(data.checkins || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const verifiedCount = checkins.filter((c) => c.onchain_status === "SUCCESS").length;

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/20">
                {user ? getInitials(user.name || user.email) : ".."}
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold text-gray-900">
                  {user?.name || "Mi Perfil"}
                </h1>
                {user?.email && (
                  <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Salir
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-3.5 text-center">
              <p className="text-2xl font-bold text-gray-900">{checkins.length}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Asistencias</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3.5 text-center">
              <p className="text-2xl font-bold text-emerald-600">{verifiedCount}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">On-Chain</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3.5 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {checkins.length > 0 ? Math.round((verifiedCount / checkins.length) * 100) : 0}%
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Verificado</p>
            </div>
          </div>

          {/* Checkin history */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Historial de Asistencia
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Cargando...
                </div>
              </div>
            ) : checkins.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-200 mb-3 block">
                  history
                </span>
                <p className="text-sm text-gray-400">
                  Todavía no registraste asistencia.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Escaneá un QR para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkins.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex">
                      {/* Accent bar */}
                      <div className={`w-1 ${accentColors[c.onchain_status]}`} />

                      <div className="flex-1 p-4 space-y-3">
                        {/* Top row: class name + status */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-gray-300 text-[18px] flex-shrink-0">
                              school
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {c.attendees?.sessions?.classes?.title || "Clase"}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(c.created_at).toLocaleString("es-AR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={c.onchain_status} />
                        </div>

                        {/* Hash (short) */}
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <code className="font-label text-[11px] text-gray-400">
                            {c.record_hash.slice(0, 16)}...{c.record_hash.slice(-8)}
                          </code>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <CopyHashButton hash={c.record_hash} />
                          <Link
                            href={`/verify/${c.record_hash}`}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">verified</span>
                            Verificar
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
