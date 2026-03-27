"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { kpis, retentionTrend, dfwHotspots, atRiskCounts, attendanceTrend } from "../_data/mock";
import KpiCard from "../_components/KpiCard";
import ChartCard from "../_components/ChartCard";

const RISK_COLORS = ["#ab0b1c", "#d97706", "#ca8a04", "#006c49"];

export default function OverviewView() {
  const totalStudents = atRiskCounts.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((card, i) => (
          <KpiCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Row 2: Retention + At-risk donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Tendencia de Persistencia"
          subtitle="Tasa de permanencia semestre a semestre (12 meses)"
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionTrend}>
                <defs>
                  <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#004ac6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#004ac6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#737686" }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[75, 85]}
                  tick={{ fontSize: 11, fill: "#737686" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Persistencia"]}
                />
                <Area
                  type="monotone"
                  dataKey="tasa"
                  stroke="#004ac6"
                  strokeWidth={2.5}
                  fill="url(#retGrad)"
                  animationDuration={1200}
                  dot={{ r: 3, fill: "#004ac6", strokeWidth: 0 }}
                  activeDot={{ r: 5, stroke: "#004ac6", strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Estudiantes por Riesgo" subtitle={`${totalStudents} estudiantes totales`}>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={atRiskCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                  stroke="none"
                >
                  {atRiskCounts.map((entry, i) => (
                    <Cell key={entry.name} fill={RISK_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, name: any) => [v, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {atRiskCounts.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[i] }} />
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {c.name} ({c.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: DFW Hotspots + Attendance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Cursos con Mayor Tasa DFW" subtitle="D + F + Abandono como % de inscriptos">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dfwHotspots} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#737686" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="curso"
                  type="category"
                  tick={{ fontSize: 11, fill: "#434655" }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [`${v}%`, "Tasa DFW"]}
                />
                <Bar
                  dataKey="tasa"
                  radius={[0, 6, 6, 0]}
                  animationDuration={1000}
                  fill="#ab0b1c"
                  fillOpacity={0.8}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Tendencia de Asistencia Semanal" subtitle="Promedio general por semana del cuatrimestre">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006c49" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#006c49" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#737686" }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[78, 95]}
                  tick={{ fontSize: 11, fill: "#737686" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [`${v}%`, "Asistencia"]}
                />
                <Area
                  type="monotone"
                  dataKey="tasa"
                  stroke="#006c49"
                  strokeWidth={2.5}
                  fill="url(#attGrad)"
                  animationDuration={1200}
                  dot={{ r: 3, fill: "#006c49", strokeWidth: 0 }}
                  activeDot={{ r: 5, stroke: "#006c49", strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
