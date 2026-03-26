"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import StatusBadge from "@/components/ui/StatusBadge";
import HashDisplay from "@/components/ui/HashDisplay";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface VerifyData {
  exists: boolean;
  recordHash: string;
  onchainStatus: string | null;
  txHash: string | null;
  stellarLabUrl: string | null;
  timestamp: string | null;
}

export default function VerifyClient({ recordHash }: { recordHash: string }) {
  const router = useRouter();
  const [data, setData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchHash, setSearchHash] = useState(recordHash);

  useEffect(() => {
    if (!recordHash) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`/api/verify/${recordHash}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al verificar");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((e) => {
        setError(e.message || "Error al verificar el registro.");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [recordHash]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHash.trim()) {
      router.push(`/verify/${searchHash.trim()}`);
    }
  };

  const validStatus =
    data?.onchainStatus === "PENDING" ||
    data?.onchainStatus === "SUCCESS" ||
    data?.onchainStatus === "FAILED"
      ? (data.onchainStatus as "PENDING" | "SUCCESS" | "FAILED")
      : null;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Verificar Registro
            </h1>
            <p className="text-sm text-on-surface-variant">
              Consultá la existencia de un registro de asistencia en la blockchain
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
              <span className="material-symbols-outlined text-[20px]">search</span>
            </PrimaryButton>
          </form>

          {loading && (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-on-surface-variant mt-3">Consultando blockchain...</p>
            </div>
          )}

          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {!loading && !error && data && (
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
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-label font-bold text-sm uppercase ${
                      data.exists
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    {data.exists ? "EXISTE" : "NO EXISTE"}
                  </span>
                </div>

                {data.exists && validStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Estado on-chain</span>
                    <StatusBadge status={validStatus} />
                  </div>
                )}
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
                <h3 className="font-headline font-bold text-on-surface">Detalles del registro</h3>
                <div className="space-y-3">
                  {data.recordHash && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Record Hash</p>
                      <HashDisplay hash={data.recordHash} />
                    </div>
                  )}
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
        </div>
      </div>
    </PageShell>
  );
}
