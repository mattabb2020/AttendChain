"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { KpiCard as KpiCardType } from "../_data/mock";

export default function KpiCard({ card, index }: { card: KpiCardType; index: number }) {
  const sparkData = card.sparkline.map((v, i) => ({ v, i }));
  const isNegativeTrend = card.label.includes("DFW") || card.label.includes("Casos");
  const deltaColor = isNegativeTrend
    ? card.trend === "down" ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
    : card.trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50";

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: card.color }}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${card.color}15` }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: card.color, fontVariationSettings: "'FILL' 1" }}
              >
                {card.icon}
              </span>
            </div>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${deltaColor}`}>
              <span className="material-symbols-outlined text-xs">
                {card.trend === "up" ? "arrow_upward" : "arrow_downward"}
              </span>
              {card.delta}
            </span>
          </div>
          <p className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">
            {card.value}
          </p>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            {card.label}
          </p>
        </div>

        {/* Mini sparkline */}
        <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={card.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={card.color}
                strokeWidth={2}
                fill={`url(#spark-${index})`}
                isAnimationActive={true}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
