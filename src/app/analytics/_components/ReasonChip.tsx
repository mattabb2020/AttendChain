interface ReasonChipProps {
  label: string;
  category: "asistencia" | "notas" | "actividad" | "entregas";
}

const categoryStyles: Record<string, { bg: string; text: string; icon: string }> = {
  asistencia: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: "event_busy" },
  notas: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "trending_down" },
  actividad: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: "computer" },
  entregas: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: "assignment_late" },
};

export default function ReasonChip({ label, category }: ReasonChipProps) {
  const style = categoryStyles[category] || categoryStyles.asistencia;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${style.bg} ${style.text}`}>
      <span className="material-symbols-outlined text-xs">{style.icon}</span>
      {label}
    </span>
  );
}
