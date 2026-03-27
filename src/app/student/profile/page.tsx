"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import StatusBadge from "@/components/ui/StatusBadge";
import HashDisplay from "@/components/ui/HashDisplay";
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

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Profile header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-2xl font-bold text-on-surface">
                Mi Perfil
              </h1>
              {user && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-sm text-on-surface-variant">{user.name}</p>
                  <p className="text-xs text-on-surface-variant">{user.email}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-tertiary hover:bg-tertiary/5 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Salir
            </button>
          </div>

          {/* Checkin history */}
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface mb-4">
              Historial de Asistencia
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm text-on-surface-variant">Cargando...</p>
              </div>
            ) : checkins.length === 0 ? (
              <div className="bg-surface-container-low rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">
                  history
                </span>
                <p className="text-sm text-on-surface-variant">
                  Todavía no registraste asistencia. Escaneá un QR para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkins.map((c) => (
                  <div
                    key={c.id}
                    className="bg-surface-container-lowest rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-on-surface text-sm">
                          {c.attendees?.sessions?.classes?.title || "Clase"}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(c.created_at).toLocaleString("es-AR")}
                        </p>
                      </div>
                      <StatusBadge status={c.onchain_status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <HashDisplay hash={c.record_hash} />
                      <Link
                        href={`/verify/${c.record_hash}`}
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          verified
                        </span>
                        Verificar
                      </Link>
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
