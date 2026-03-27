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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

  const firstName = userName.split(" ")[0] || "";

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando...
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-base shadow-md shadow-primary/20">
              {getInitials(userName || "O")}
            </div>
            <div>
              <h1 className="font-headline text-xl font-bold text-gray-900">
                {firstName ? `Hola, ${firstName}` : "Mis Clases"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {classes.length} clase{classes.length !== 1 ? "s" : ""}
              </p>
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

        {/* Active class banner */}
        {activeSession && (
          <div className="bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/15 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                Clase en curso
              </span>
            </div>
            <div>
              <p className="font-headline font-bold text-lg text-gray-900">
                {activeSession.classes?.title || "Clase"}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {attendeeCount} asistente{attendeeCount !== 1 ? "s" : ""} registrado{attendeeCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/organizer/sessions/active/qr?sid=${activeSession.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-md shadow-primary/15 hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                Ver QR
              </Link>
              <PrimaryButton
                onClick={handleCloseSession}
                loading={closingSession}
                variant="outline"
                className="flex-1 !border-red-200 !text-red-500 hover:!bg-red-50"
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
          className="flex items-center justify-center gap-2 w-full px-6 py-4 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nueva Clase
        </Link>

        {/* Class list */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-200 mb-3 block">
              school
            </span>
            <p className="text-sm text-gray-400">
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
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-50 text-gray-400"
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">school</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {c.title}
                          </p>
                          {isActive && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-600 rounded-full ring-1 ring-inset ring-emerald-200/60">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              En curso
                            </span>
                          )}
                        </div>
                        {c.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {c.description}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-300 mt-1">
                          {new Date(c.created_at).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {!isActive && !activeSession && (
                      <button
                        onClick={() => handleStartClass(c.id)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
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
