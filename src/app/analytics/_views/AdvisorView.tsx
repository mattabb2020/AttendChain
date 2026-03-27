"use client";

import { useState } from "react";
import { riskQueue, advisorSummary } from "../_data/mock";
import RiskBadge from "../_components/RiskBadge";
import ReasonChip from "../_components/ReasonChip";

type SortKey = "score" | "nombre" | "curso";

export default function AdvisorView() {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedId, setSelectedId] = useState(riskQueue[0].id);

  const sorted = [...riskQueue].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortKey === "score") return (b.score - a.score) * mul;
    if (sortKey === "nombre") return a.nombre.localeCompare(b.nombre) * mul;
    return a.curso.localeCompare(b.curso) * mul;
  });

  const selected = riskQueue.find((s) => s.id === selectedId) || riskQueue[0];

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const summaryCards = [
    { label: "Casos Abiertos", value: advisorSummary.casosAbiertos, icon: "folder_open", color: "#004ac6" },
    { label: "Alta Prioridad", value: advisorSummary.altaPrioridad, icon: "priority_high", color: "#ab0b1c" },
    { label: "Vencimientos SLA", value: advisorSummary.vencimientosSla, icon: "schedule", color: "#b45309" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}12` }}>
              <span className="material-symbols-outlined text-xl" style={{ color: c.color, fontVariationSettings: "'FILL' 1" }}>
                {c.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-on-surface">{c.value}</p>
              <p className="text-xs text-on-surface-variant font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: table + side panel */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Table */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-headline font-bold text-on-surface">Cola de Riesgo</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Estudiantes ordenados por puntaje de riesgo</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortHeader label="Estudiante" sortKey="nombre" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="Riesgo" sortKey="score" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="Curso" sortKey="curso" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Razones</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Actividad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      selectedId === s.id ? "bg-primary/[0.04]" : "hover:bg-gray-50/80"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-on-surface whitespace-nowrap">{s.nombre}</td>
                    <td className="px-4 py-3">
                      <RiskBadge score={s.score} size="sm" showLabel={false} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{s.curso}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.razones.map((r, i) => (
                          <ReasonChip key={i} label={r.label} category={r.category} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{s.ultimaActividad}</td>
                    <td className="px-4 py-3">
                      <CaseStatusBadge estado={s.casoEstado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-white font-headline font-bold text-lg">
              {selected.nombre.split(", ").map((n) => n[0]).join("")}
            </div>
            <h4 className="mt-3 font-headline font-bold text-on-surface text-sm">{selected.nombre}</h4>
            <p className="text-xs text-on-surface-variant">{selected.curso}</p>
          </div>

          <div className="flex justify-center">
            <RiskBadge score={selected.score} size="md" />
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Razones</h5>
            <div className="space-y-1.5">
              {selected.razones.map((r, i) => (
                <ReasonChip key={i} label={r.label} category={r.category} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ultima actividad</h5>
            <p className="text-sm text-on-surface">{selected.ultimaActividad}</p>
          </div>

          <div className="space-y-2">
            <button className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-colors">
              Abrir Caso
            </button>
            <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-on-surface hover:bg-gray-50 transition-colors">
              Contactar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey: key,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (k: SortKey) => void;
}) {
  const isActive = current === key;
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-on-surface select-none"
      onClick={() => onClick(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="material-symbols-outlined text-xs">
            {asc ? "arrow_upward" : "arrow_downward"}
          </span>
        )}
      </span>
    </th>
  );
}

function CaseStatusBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    abierto: "bg-blue-50 text-blue-700 border-blue-200",
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    sin_caso: "bg-gray-50 text-gray-500 border-gray-200",
  };
  const labels: Record<string, string> = {
    abierto: "Abierto",
    pendiente: "Pendiente",
    sin_caso: "Sin caso",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[estado] || styles.sin_caso}`}>
      {labels[estado] || estado}
    </span>
  );
}
