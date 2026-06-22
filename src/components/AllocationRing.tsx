"use client";

import type { EnrichedHolding } from "@/types";

const ACCENTS = [
  "#c8ff3d",
  "#3de8ff",
  "#a472ff",
  "#ff6ec7",
  "#ffb84d",
  "#ff4d5e",
  "#5ddcb0",
  "#7a9bff",
];

export function colorFor(index: number) {
  return ACCENTS[index % ACCENTS.length];
}

export function AllocationRing({ holdings, total }: { holdings: EnrichedHolding[]; total: number }) {
  const sorted = [...holdings].sort((a, b) => b.value - a.value);
  const radius = 80;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = sorted.map((h, i) => {
    const fraction = total > 0 ? h.value / total : 0;
    const dash = fraction * circumference;
    const offset = cumulative;
    cumulative += dash;
    return { ...h, dash, offset, color: colorFor(i) };
  });

  const top = sorted[0];
  const topPct = total > 0 ? (top.value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-6">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        role="img"
        aria-label={`Portfolio allocation donut chart. Largest holding ${top?.name} at ${topPct.toFixed(1)} percent.`}
      >
        <g transform="rotate(-90 100 100)">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#1a1d24" strokeWidth={stroke} />
          {segments.map((s) => (
            <circle
              key={s.symbol}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text x="100" y="94" textAnchor="middle" fill="var(--text-faint)" fontSize="11" fontFamily="var(--font-inter)">
          TOP HOLDING
        </text>
        <text
          x="100"
          y="116"
          textAnchor="middle"
          fill="var(--text)"
          fontSize="20"
          fontWeight="700"
          fontFamily="var(--font-jbmono)"
        >
          {topPct.toFixed(0)}%
        </text>
      </svg>
      <div className="flex flex-col gap-1.5 text-sm min-w-0">
        {segments.slice(0, 6).map((s) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <div key={s.symbol} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="truncate" style={{ color: "var(--text-dim)" }}>
                {s.symbol}
              </span>
              <span className="font-mono-num ml-auto" style={{ color: "var(--text)" }}>
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
        {segments.length > 6 && (
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            +{segments.length - 6} more below
          </span>
        )}
      </div>
    </div>
  );
}
