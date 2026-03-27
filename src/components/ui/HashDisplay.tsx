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
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 min-w-0">
      <code className="font-label text-xs text-gray-500 truncate min-w-0">
        {hash}
      </code>
      <button
        onClick={handleCopy}
        className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
          copied
            ? "text-emerald-500 bg-emerald-50"
            : "text-gray-400 hover:text-primary hover:bg-gray-100"
        }`}
        title={copied ? "Copiado" : "Copiar"}
      >
        <span className="material-symbols-outlined text-[15px]">
          {copied ? "check" : "content_copy"}
        </span>
      </button>
    </div>
  );
}
