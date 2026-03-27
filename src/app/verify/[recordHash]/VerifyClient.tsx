"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import StatusBadge from "@/components/ui/StatusBadge";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface VerifyData {
  exists: boolean;
  recordHash: string;
  onchainStatus: string | null;
  txHash: string | null;
  stellarLabUrl: string | null;
  timestamp: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
        copied
          ? "text-emerald-600 bg-emerald-50"
          : "text-gray-400 hover:text-primary hover:bg-gray-100"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function ShortHash({ hash }: { hash: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-2 min-w-0">
      <code className="font-label text-xs text-gray-500 truncate min-w-0">
        {hash.slice(0, 12)}...{hash.slice(-8)}
      </code>
      <CopyButton text={hash} />
    </div>
  );
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-headline text-2xl font-bold text-gray-900">
              Verificar Registro
            </h1>
            <p className="text-sm text-gray-400">
              Consultá un registro de asistencia en la blockchain
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="Pegá el hash del registro"
              className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
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
              <p className="text-sm text-gray-400 mt-3">Consultando blockchain...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm text-center ring-1 ring-inset ring-red-600/20">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-4">
              {/* Status card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="text-center space-y-3">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                      data.exists ? "bg-emerald-50" : "bg-red-50"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        data.exists ? "text-emerald-600" : "text-red-500"
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {data.exists ? "verified" : "cancel"}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm uppercase ${
                      data.exists
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                    }`}
                  >
                    {data.exists ? "EXISTE" : "NO EXISTE"}
                  </span>

                  {data.exists && validStatus && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-gray-400">Estado on-chain:</span>
                      <StatusBadge status={validStatus} />
                    </div>
                  )}
                </div>
              </div>

              {/* Details card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <h3 className="font-headline font-bold text-gray-900 text-sm">Detalles del registro</h3>
                <div className="space-y-3">
                  {data.recordHash && (
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium mb-1.5">Record Hash</p>
                      <ShortHash hash={data.recordHash} />
                    </div>
                  )}
                  {data.txHash && (
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium mb-1.5">Transaction Hash</p>
                      <ShortHash hash={data.txHash} />
                    </div>
                  )}
                  {data.timestamp && (
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium mb-1.5">Fecha y hora</p>
                      <p className="text-sm text-gray-900">
                        {new Date(data.timestamp).toLocaleString("es-AR")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium mb-1.5">Red</p>
                    <p className="text-sm text-gray-900">Stellar Testnet</p>
                  </div>
                </div>
                {data.stellarLabUrl && (
                  <a
                    href={data.stellarLabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm shadow-sm"
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
