const variants = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
} as const;

const dotColors = {
  PENDING: "bg-amber-500",
  SUCCESS: "bg-emerald-500",
  FAILED: "bg-red-500",
} as const;

const labels = {
  PENDING: "Pendiente",
  SUCCESS: "Confirmado",
  FAILED: "Fallido",
} as const;

export default function StatusBadge({
  status,
}: {
  status: "PENDING" | "SUCCESS" | "FAILED";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${variants[status]}`}
    >
      {status === "PENDING" && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} animate-pulse`} />
      )}
      {status === "SUCCESS" && (
        <span className="material-symbols-outlined text-emerald-500 text-[13px]">check_circle</span>
      )}
      {status === "FAILED" && (
        <span className="material-symbols-outlined text-red-500 text-[13px]">error</span>
      )}
      {labels[status]}
    </span>
  );
}
