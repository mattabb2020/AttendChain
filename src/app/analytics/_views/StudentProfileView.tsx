"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { studentProfile, studentRiskFactors, studentTimeline, studentCases } from "../_data/mock";
import RiskBadge from "../_components/RiskBadge";
import ChartCard from "../_components/ChartCard";

const timelineColors: Record<string, { bg: string; text: string }> = {
  asistencia: { bg: "bg-red-100", text: "text-red-600" },
  nota: { bg: "bg-amber-100", text: "text-amber-600" },
  caso: { bg: "bg-blue-100", text: "text-blue-600" },
  actividad: { bg: "bg-purple-100", text: "text-purple-600" },
  alerta: { bg: "bg-red-100", text: "text-red-700" },
};

export default function StudentProfileView() {
  const shap = studentRiskFactors.map((f) => ({
    name: f.feature,
    value: f.value,
    label: f.label,
    direction: f.direction,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar + info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-headline font-bold text-xl shrink-0">
              RV
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">{studentProfile.nombre}</h2>
              <p className="text-sm text-on-surface-variant">{studentProfile.programa} &middot; Cohorte {studentProfile.cohorte}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Modalidad: {studentProfile.modalidad} &middot; ID: {studentProfile.id}</p>
            </div>
          </div>
          {/* Risk badge */}
          <div className="flex items-center gap-6">
            <RiskBadge score={studentProfile.score} size="lg" />
            <div className="hidden sm:block border-l border-gray-200 pl-6">
              <p className="text-xs text-on-surface-variant font-medium mb-2">Cursos Activos</p>
              {studentProfile.cursos.map((c) => (
                <div key={c.nombre} className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-medium text-on-surface w-36 truncate">{c.nombre}</span>
                  <span className={`text-xs font-semibold ${c.nota < 4 ? "text-red-600" : c.nota < 6 ? "text-amber-600" : "text-emerald-600"}`}>
                    {c.nota.toFixed(1)}
                  </span>
                  <span className={`text-xs ${c.asistencia < 60 ? "text-red-500" : "text-on-surface-variant"}`}>
                    {c.asistencia}% asist.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Risk factors */}
        <ChartCard title="Factores de Riesgo (SHAP)" subtitle="Contribucion de cada factor al puntaje de riesgo">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shap} layout="vertical" margin={{ left: 10, right: 40 }}>
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: "#434655" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={1000} barSize={24} label={renderBarLabel}>
                  {shap.map((entry, i) => (
                    <Cell key={i} fill={entry.direction === "bajo" ? "#ab0b1c" : "#d97706"} fillOpacity={0.75 - i * 0.08} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ab0b1c]" />
              <span className="text-[11px] text-on-surface-variant">Valor bajo (riesgo)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              <span className="text-[11px] text-on-surface-variant">Valor alto (riesgo)</span>
            </div>
          </div>
        </ChartCard>

        {/* Right: Case info */}
        <ChartCard title="Gestion de Casos" subtitle="Historial de intervenciones y seguimiento">
          {studentCases.length > 0 ? (
            <div className="space-y-4">
              {studentCases.map((c) => (
                <div key={c.id} className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-lg">folder_open</span>
                      <span className="text-sm font-bold text-on-surface font-label">{c.id}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                      {c.estado}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{c.motivo}</p>
                  <div className="text-xs text-on-surface-variant">
                    <span className="font-medium">Asignado a:</span> {c.abiertoPor} &middot;{" "}
                    <span className="font-medium">SLA vence:</span>{" "}
                    <span className="text-amber-600 font-semibold">{c.slaVence}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 space-y-1.5">
                    {c.acciones.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[10px] text-on-surface-variant font-label w-20 shrink-0">{a.fecha}</span>
                        <span className="text-xs text-on-surface">{a.accion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant py-8 text-center">Sin casos registrados</p>
          )}
        </ChartCard>
      </div>

      {/* Timeline */}
      <ChartCard title="Linea de Tiempo (30 dias)" subtitle="Eventos recientes del estudiante">
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-0">
            {studentTimeline.map((ev, i) => {
              const colors = timelineColors[ev.tipo] || timelineColors.actividad;
              return (
                <div key={i} className="relative flex items-start gap-4 py-2.5 group">
                  {/* Dot */}
                  <div className={`absolute -left-6 top-3 w-[22px] h-[22px] rounded-full ${colors.bg} flex items-center justify-center z-10 ring-2 ring-white`}>
                    <span className={`material-symbols-outlined text-xs ${colors.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {ev.icono}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-label text-on-surface-variant font-medium">{ev.fecha}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>{ev.tipo}</span>
                    </div>
                    <p className="text-sm text-on-surface mt-0.5 group-hover:text-primary transition-colors">{ev.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderBarLabel(props: any) {
  const { x, y, width, height, index } = props;
  const labels = ["52%", "3 tareas", "Percentil 12", "-12 pts", "4 consecutivas"];
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      fill="#434655"
      fontSize={11}
      fontWeight={600}
      dominantBaseline="middle"
    >
      {labels[index] || ""}
    </text>
  );
}
