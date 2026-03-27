"use client";

import { heatmapDias, heatmapHoras, attendanceHeatmap } from "../_data/mock";

function getHeatColor(tasa: number): string {
  if (tasa >= 0.9) return "rgba(0, 108, 73, 0.85)";
  if (tasa >= 0.8) return "rgba(0, 108, 73, 0.55)";
  if (tasa >= 0.7) return "rgba(0, 108, 73, 0.30)";
  if (tasa >= 0.6) return "rgba(202, 138, 4, 0.45)";
  return "rgba(171, 11, 28, 0.50)";
}

export default function HeatmapGrid() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Header row */}
        <div className="grid gap-1" style={{ gridTemplateColumns: `56px repeat(${heatmapHoras.length}, 1fr)` }}>
          <div />
          {heatmapHoras.map((h) => (
            <div key={h} className="text-[10px] text-center text-on-surface-variant font-label py-1">
              {h}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {heatmapDias.map((dia) => (
          <div
            key={dia}
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: `56px repeat(${heatmapHoras.length}, 1fr)` }}
          >
            <div className="text-xs text-on-surface-variant font-medium flex items-center">
              {dia}
            </div>
            {heatmapHoras.map((hora) => {
              const cell = attendanceHeatmap.find((c) => c.dia === dia && c.hora === hora);
              const tasa = cell?.tasa ?? 0;
              return (
                <div
                  key={`${dia}-${hora}`}
                  className="rounded-lg h-9 flex items-center justify-center text-[10px] font-bold text-white cursor-default transition-transform hover:scale-110"
                  style={{ backgroundColor: getHeatColor(tasa) }}
                  title={`${dia} ${hora}: ${Math.round(tasa * 100)}%`}
                >
                  {Math.round(tasa * 100)}%
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 justify-end">
          <span className="text-[10px] text-on-surface-variant">Baja</span>
          {[0.5, 0.65, 0.75, 0.85, 0.95].map((v) => (
            <div
              key={v}
              className="w-5 h-3 rounded-sm"
              style={{ backgroundColor: getHeatColor(v) }}
            />
          ))}
          <span className="text-[10px] text-on-surface-variant">Alta</span>
        </div>
      </div>
    </div>
  );
}
