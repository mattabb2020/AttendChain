"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{
    role: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          role: user.user_metadata?.role || "organizer",
          name: user.user_metadata?.name || user.email || "",
        });
      }
    });
  }, []);

  const isStudent = user?.role === "student";
  const isOrganizer = user?.role === "organizer";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[22px]">
            verified_user
          </span>
          <span className="text-lg font-extrabold tracking-tight font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            AttendChain
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {/* Stellar Live */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 ring-1 ring-inset ring-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              Stellar Live
            </span>
          </div>

          {/* Not logged in */}
          {!user && (
            <>
              <Link href="/" className={navLink(pathname === "/")}>Home</Link>
              <Link href="/verify" className={navLink(pathname.startsWith("/verify"))}>Verificar</Link>
              <Link href="/analytics" className={navLink(pathname.startsWith("/analytics"))}>MVP Dashboard</Link>
              <Link href="/auth/login" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                Iniciar Sesión
              </Link>
            </>
          )}

          {/* Student */}
          {isStudent && (
            <>
              <Link href="/student/scan" className={navLink(pathname === "/student/scan")}>
                Escanear QR
              </Link>
              <Link href="/student/profile" className={navLink(pathname === "/student/profile")}>
                Mi Perfil
              </Link>
              <Link href="/verify" className={navLink(pathname.startsWith("/verify"))}>
                Verificar
              </Link>
            </>
          )}

          {/* Organizer */}
          {isOrganizer && (
            <>
              <Link href="/organizer/dashboard" className={navLink(pathname.startsWith("/organizer"))}>
                Mis Clases
              </Link>
              <Link href="/verify" className={navLink(pathname.startsWith("/verify"))}>
                Verificar
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-[72px] pb-28 md:pb-8">{children}</main>

      {/* Footer */}
      <footer className="hidden md:flex items-center justify-center gap-6 py-4 text-xs text-gray-400">
        <span>© 2026 AttendChain</span>
        <span>·</span>
        <span>Powered by Stellar</span>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 px-4 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="flex justify-around items-center">
          {!user && (
            <>
              <MobileNavItem href="/" icon="home" label="Home" active={pathname === "/"} />
              <MobileNavItem href="/verify" icon="verified" label="Verificar" active={pathname.startsWith("/verify")} />
              <MobileNavItem href="/auth/login" icon="login" label="Ingresar" active={pathname.startsWith("/auth")} />
            </>
          )}
          {isStudent && (
            <>
              <MobileNavItem href="/student/scan" icon="qr_code_scanner" label="Escanear" active={pathname === "/student/scan"} />
              <MobileNavItem href="/student/profile" icon="person" label="Perfil" active={pathname === "/student/profile"} />
              <MobileNavItem href="/verify" icon="verified" label="Verificar" active={pathname.startsWith("/verify")} />
            </>
          )}
          {isOrganizer && (
            <>
              <MobileNavItem href="/organizer/dashboard" icon="school" label="Clases" active={pathname.startsWith("/organizer")} />
              <MobileNavItem href="/verify" icon="verified" label="Verificar" active={pathname.startsWith("/verify")} />
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

function navLink(active: boolean) {
  return `text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
    active ? "text-primary bg-primary/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
  }`;
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 min-w-[64px] py-1">
      <div className={`flex items-center justify-center h-8 w-14 rounded-full transition-colors ${
        active ? "bg-primary/10" : ""
      }`}>
        <span className={`material-symbols-outlined text-[22px] ${
          active ? "text-primary" : "text-gray-400"
        }`}>{icon}</span>
      </div>
      <span className={`text-[10px] tracking-wide ${
        active ? "font-semibold text-primary" : "font-medium text-gray-400"
      }`}>{label}</span>
    </Link>
  );
}
