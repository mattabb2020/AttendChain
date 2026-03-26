"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

        <nav className="hidden md:flex items-center gap-8">
          {/* Stellar Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10">
            <span className="w-2 h-2 rounded-full bg-secondary animate-network-pulse" />
            <span className="text-[10px] font-label font-bold text-secondary uppercase tracking-wider">
              Stellar Live
            </span>
          </div>

          <Link
            href="/"
            className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
              pathname === "/"
                ? "text-primary"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Home
          </Link>
          <Link
            href="/organizer/sessions/open"
            className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
              pathname.startsWith("/organizer")
                ? "text-primary"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Sesiones
          </Link>
          <Link
            href="/verify"
            className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
              pathname.startsWith("/verify")
                ? "text-primary"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Verificar
          </Link>
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
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-[10px] font-label">Home</span>
        </Link>
        <Link
          href="/organizer/sessions/open"
          className="flex flex-col items-center gap-1 text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px]">
            qr_code_scanner
          </span>
          <span className="text-[10px] font-label">Sesiones</span>
        </Link>
        <Link
          href="/join"
          className="flex flex-col items-center gap-1 text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px]">
            person_add
          </span>
          <span className="text-[10px] font-label">Unirse</span>
        </Link>
        <Link
          href="/verify"
          className="flex flex-col items-center gap-1 text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px]">
            verified
          </span>
          <span className="text-[10px] font-label">Verificar</span>
        </Link>
      </nav>
    </div>
  );
}
