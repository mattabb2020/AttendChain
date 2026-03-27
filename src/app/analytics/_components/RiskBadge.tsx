"use client";

interface RiskBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getBand(score: number): { label: string; color: string; bg: string; ring: string } {
  if (score >= 70) return { label: "ALTO", color: "#ab0b1c", bg: "bg-red-50", ring: "#ab0b1c" };
  if (score >= 50) return { label: "MEDIO", color: "#b45309", bg: "bg-amber-50", ring: "#d97706" };
  if (score >= 35) return { label: "OBSERVAR", color: "#ca8a04", bg: "bg-yellow-50", ring: "#ca8a04" };
  return { label: "NORMAL", color: "#006c49", bg: "bg-emerald-50", ring: "#006c49" };
}

export default function RiskBadge({ score, size = "sm", showLabel = true }: RiskBadgeProps) {
  const band = getBand(score);
  const dims = size === "lg" ? "w-28 h-28" : size === "md" ? "w-14 h-14" : "w-10 h-10";
  const textSize = size === "lg" ? "text-2xl" : size === "md" ? "text-sm" : "text-xs";
  const strokeWidth = size === "lg" ? 6 : size === "md" ? 4 : 3;
  const radius = size === "lg" ? 50 : size === "md" ? 22 : 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = size === "lg" ? 112 : size === "md" ? 56 : 40;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${dims} flex items-center justify-center`}>
        <svg width={svgSize} height={svgSize} className="absolute -rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={band.ring}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className={`${textSize} font-headline font-extrabold`} style={{ color: band.color }}>
          {score}
        </span>
      </div>
      {showLabel && (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${band.bg}`}
          style={{ color: band.color }}
        >
          {band.label}
        </span>
      )}
    </div>
  );
}
