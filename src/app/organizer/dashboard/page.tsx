"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { createClient } from "@/lib/supabase/client";

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface ActiveSession {
  id: string;
  class_id: string;
  qr_rotation_seconds: number;
  opened_at: string;
  classes?: { title: string };
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [closingSession, setClosingSession] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.name || user.email || "");
    });

    // Fetch classes and active session in parallel
    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/sessions").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([classData, sessionData]) => {
        setClasses(classData.classes || []);
        if (sessionData?.session) {
          setActiveSession(sessionData.session);
          setAttendeeCount(sessionData.attendeeCount || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleCloseSession = async () => {
    if (!confirm("¿Finalizar la clase? Los estudiantes ya no podrán registrarse."))
      return;
    setClosingSession(true);
    try {
      await fetch("/api/sessions", { method: "PATCH" });
      setActiveSession(null);
      setAttendeeCount(0);
    } catch {
      // ignore
    } finally {
      setClosingSession(false);
    }
  };

  const handleStartClass = (classId: string) => {
    router.push(`/organizer/sessions/open?classId=${classId}`);
  };

  if (loading) {
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
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Mis Clases
            </h1>
            {userName && (
              <p className="text-sm text-on-surface-variant mt-1">{userName}</p>
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

        {/* Active class banner */}
        {activeSession && (
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-network-pulse" />
              <span className="text-xs font-label font-bold text-secondary uppercase tracking-wider">
                Clase en curso
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-headline font-bold text-lg text-on-surface">
                  {activeSession.classes?.title || "Clase"}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {attendeeCount} asistente{attendeeCount !== 1 ? "s" : ""} registrado{attendeeCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/organizer/sessions/active/qr?sid=${activeSession.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:scale-[0.98] transition-all text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                Ver QR
              </Link>
              <PrimaryButton
                onClick={handleCloseSession}
                loading={closingSession}
                variant="outline"
                className="flex-1 text-tertiary border-tertiary/20 hover:bg-tertiary/5"
              >
                <span className="material-symbols-outlined text-[18px]">stop</span>
                Finalizar
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* Create class button */}
        <Link
          href="/organizer/classes/new"
          className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-br from-secondary to-secondary-container text-on-primary rounded-xl font-semibold shadow-lg shadow-secondary/20 hover:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva Clase
        </Link>

        {/* Class list */}
        {classes.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-8 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 block">
              school
            </span>
            <p className="text-sm text-on-surface-variant">
              Todavía no tenés clases. Creá tu primera clase para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((c) => {
              const isActive = activeSession?.class_id === c.id;
              return (
                <div
                  key={c.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-on-surface truncate">
                          {c.title}
                        </p>
                        {isActive && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-secondary/10 text-secondary rounded-full">
                            En curso
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                      <p className="text-xs text-on-surface-variant/60 mt-1">
                        Creada {new Date(c.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    {!isActive && !activeSession && (
                      <button
                        onClick={() => handleStartClass(c.id)}
                        className="ml-4 flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          play_arrow
                        </span>
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
