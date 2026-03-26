"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function VerifySearchPage() {
  const router = useRouter();
  const [hash, setHash] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (hash.trim()) {
      router.push(`/verify/${hash.trim()}`);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-6">
        <div className="max-w-lg w-full space-y-8 text-center">
          <div className="space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">
                verified
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Verificar Registro
            </h1>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Ingresá el recordHash de un check-in para verificar su existencia
              en la blockchain de Stellar.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="Pegá el recordHash aquí (64 caracteres hex)"
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-center"
            />
            <PrimaryButton
              type="submit"
              disabled={!hash.trim()}
              className="w-full"
            >
              <span className="material-symbols-outlined text-[20px]">
                search
              </span>
              Verificar
            </PrimaryButton>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
