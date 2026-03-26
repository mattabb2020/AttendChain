"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import StatusBadge from "@/components/ui/StatusBadge";
import HashDisplay from "@/components/ui/HashDisplay";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { VerifyResponse } from "@/types";

function VerifyContent() {
  const params = useParams();
  const router = useRouter();
  const recordHash = params.recordHash as string;

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchHash, setSearchHash] = useState(recordHash || "");

  useEffect(() => {
    if (!recordHash) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/verify/${recordHash}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [recordHash]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHash.trim()) {
      router.push(`/verify/${searchHash.trim()}`);
    }
  };

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Verificar Registro
            </h1>
            <p className="text-sm text-on-surface-variant">
              Consultá la existencia de un registro de asistencia en la
              blockchain
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="Ingresá el recordHash (SHA-256)"
              className="flex-1 px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <PrimaryButton type="submit" disabled={!searchHash.trim()}>
              <span className="material-symbols-outlined text-[20px]">
                search
              </span>
            </PrimaryButton>
          </form>

          {loading && (
            <div className="text-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-primary mx-auto"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-on-surface-variant mt-3">
                Consultando blockchain...
              </p>
            </div>
          )}

          {!loading && data && recordHash && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-6">
                <div className="text-center space-y-3">
                  <div
                    className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
                      data.exists ? "bg-secondary-container" : "bg-error-container"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-4xl ${
                        data.exists ? "text-on-secondary-container" : "text-on-error-container"
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {data.exists ? "verified" : "cancel"}
                    </span>
                  </div>
                  <div>
                    {data.exists ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-label font-bold text-sm uppercase">
                        EXISTE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-error-container text-on-error-container font-label font-bold text-sm uppercase">
                        NO EXISTE
                      </span>
                    )}
                  </div>
                </div>

                {data.exists && data.onchainStatus && (data.onchainStatus === "PENDING" || data.onchainStatus === "SUCCESS" || data.onchainStatus === "FAILED") && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Estado on-chain</span>
                    <StatusBadge status={data.onchainStatus} />
                  </div>
                )}
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
                <h3 className="font-headline font-bold text-on-surface">
                  Detalles del registro
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Record Hash</p>
                    <HashDisplay hash={data.recordHash} />
                  </div>
                  {data.txHash && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Transaction Hash</p>
                      <HashDisplay hash={data.txHash} />
                    </div>
                  )}
                  {data.timestamp && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Timestamp</p>
                      <p className="font-label text-sm text-on-surface">
                        {new Date(data.timestamp).toLocaleString("es-AR")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Red</p>
                    <p className="font-label text-sm text-on-surface">Stellar Testnet</p>
                  </div>
                </div>
                {data.stellarLabUrl && (
                  <a
                    href={data.stellarLabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary/5 text-primary rounded-xl font-semibold hover:bg-primary/10 transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    Abrir en Stellar Explorer
                  </a>
                )}
              </div>
            </div>
          )}

          {!loading && !recordHash && (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">search</span>
              <p className="text-sm">Ingresá un recordHash para verificar su existencia en la blockchain.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <p className="text-on-surface-variant">Cargando...</p>
          </div>
        </PageShell>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
