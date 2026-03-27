"use client";

import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { gradeDistribution, weeklyActivity, missingAssignments, courseStudents } from "../_data/mock";
import ChartCard from "../_components/ChartCard";
import HeatmapGrid from "../_components/HeatmapGrid";
import RiskBadge from "../_components/RiskBadge";

export default function CourseHealthView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Course selector header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              menu_book
            </span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface text-sm">Algebra II — Seccion 03</h3>
            <p className="text-xs text-on-surface-variant">Prof. Dr. Herrera &middot; 42 inscriptos &middot; Cuatrimestre 1 2026</p>
          </div>
        </div>
        <select className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-on-surface bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option>Algebra II — Sec. 03</option>
          <option>Fisica I — Sec. 01</option>
          <option>Quimica General — Sec. 02</option>
          <option>Programacion I — Sec. 01</option>
        </select>
      </div>

      {/* Row 1: Grades + Weekly activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Distribucion de Notas" subtitle="Notas finales del ultimo parcial">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="rango" tick={{ fontSize: 12, fill: "#434655" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#737686" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [v, "Estudiantes"]}
                />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} animationDuration={1000} barSize={36}>
                  {gradeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Actividad Semanal" subtitle="Estudiantes activos vs inactivos en el campus virtual">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#004ac6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#004ac6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="inactGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ab0b1c" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#ab0b1c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#737686" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#737686" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Area type="monotone" dataKey="activos" stroke="#004ac6" strokeWidth={2} fill="url(#actGrad)" animationDuration={1000} />
                <Area type="monotone" dataKey="inactivos" stroke="#ab0b1c" strokeWidth={2} fill="url(#inactGrad)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#004ac6]" />
              <span className="text-[11px] text-on-surface-variant">Activos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ab0b1c]" />
              <span className="text-[11px] text-on-surface-variant">Inactivos</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Heatmap + Missing Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Mapa de Calor de Asistencia" subtitle="Tasa promedio por dia y hora (ultimas 4 semanas)">
          <HeatmapGrid />
        </ChartCard>

        <ChartCard title="Entregas Pendientes" subtitle="Tareas vencidas o proximas a vencer">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Estudiante</th>
                  <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tarea</th>
                  <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Vence</th>
                </tr>
              </thead>
              <tbody>
                {missingAssignments.map((a, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 text-on-surface font-medium">{a.estudiante}</td>
                    <td className="py-2.5 text-on-surface-variant">{a.tarea}</td>
                    <td className="py-2.5">
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        {a.vencimiento}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Flagged students */}
      <ChartCard title="Estudiantes Señalizados" subtitle="Estudiantes con indicadores de riesgo en este curso">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Estudiante</th>
                <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Riesgo</th>
                <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Asistencia</th>
                <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nota</th>
                <th className="text-left py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Accion</th>
              </tr>
            </thead>
            <tbody>
              {courseStudents.map((s) => (
                <tr key={s.nombre} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-on-surface">{s.nombre}</td>
                  <td className="py-3"><RiskBadge score={s.score} size="sm" /></td>
                  <td className="py-3">
                    <span className={`text-sm font-semibold ${s.asistencia < 60 ? "text-red-600" : s.asistencia < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                      {s.asistencia}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-sm font-semibold ${s.nota < 4 ? "text-red-600" : s.nota < 6 ? "text-amber-600" : "text-emerald-600"}`}>
                      {s.nota.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-xs font-medium text-primary hover:text-primary-container transition-colors">
                      Enviar mensaje
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
