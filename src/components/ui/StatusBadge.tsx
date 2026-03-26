const variants = {
  PENDING: "bg-surface-container-highest text-on-surface-variant",
  SUCCESS: "bg-secondary-container text-on-secondary-container",
  FAILED: "bg-error-container text-on-error-container",
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-label font-bold uppercase tracking-wider ${variants[status]}`}
    >
      {status === "PENDING" && (
        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-pulse" />
      )}
      {status === "SUCCESS" && (
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
      )}
      {status === "FAILED" && (
        <span className="material-symbols-outlined text-[14px]">error</span>
      )}
      {labels[status]}
    </span>
  );
}
