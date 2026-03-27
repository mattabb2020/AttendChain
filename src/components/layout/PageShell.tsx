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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-surface/80 glass-effect">
        <Link href="/" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">
            verified_user
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary font-headline">
            AttendChain
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {/* Stellar Live */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10">
            <span className="w-2 h-2 rounded-full bg-secondary animate-network-pulse" />
            <span className="text-[10px] font-label font-bold text-secondary uppercase tracking-wider">
              Stellar Live
            </span>
          </div>

          {/* Not logged in */}
          {!user && (
            <>
              <Link href="/" className={navLink(pathname === "/")}>Home</Link>
              <Link href="/verify" className={navLink(pathname.startsWith("/verify"))}>Verificar</Link>
              <Link href="/auth/login" className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:scale-[0.98] transition-all">
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
      <main className="flex-1 pt-16 pb-24 md:pb-8">{children}</main>

      {/* Footer */}
      <footer className="hidden md:flex items-center justify-center gap-6 py-4 text-xs text-on-surface-variant">
        <span>© 2026 AttendChain</span>
        <span>·</span>
        <span>Powered by Stellar</span>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 glass-effect px-4 py-2 flex justify-around">
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
      </nav>
    </div>
  );
}

function navLink(active: boolean) {
  return `text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
    active ? "text-primary" : "text-on-surface-variant hover:bg-surface-container-low"
  }`;
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-on-surface-variant"}`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="text-[10px] font-label">{label}</span>
    </Link>
  );
}
