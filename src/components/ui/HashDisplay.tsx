"use client";

import { useState } from "react";

export default function HashDisplay({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="font-label text-sm text-on-surface-variant hash-mask max-w-[200px] md:max-w-[400px] overflow-hidden whitespace-nowrap">
        {hash}
      </code>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 text-xs font-label font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">
          {copied ? "check" : "content_copy"}
        </span>
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
