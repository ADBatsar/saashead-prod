"use client";

import { ComponentType } from "react";

// Updated for light theme: Softer opacity backgrounds for the glowing orbs
const ORB = {
  blue: "bg-blue-400/20",
  rose: "bg-rose-400/20",
  emerald: "bg-emerald-400/20",
  amber: "bg-amber-400/20",
  violet: "bg-violet-400/20",
} as const;

// Explicit icon colors so Tailwind doesn't purge them
const ICON_COLOR = {
  blue: "text-blue-600",
  rose: "text-rose-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  violet: "text-violet-600",
} as const;

type Accent = keyof typeof ORB;

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  accent?: Accent;
  icon?: ComponentType<{ className?: string }>;
  testId?: string;
}

export default function KpiCard({
  label,
  value,
  delta,
  deltaPositive = true,
  accent = "blue",
  icon: Icon,
  testId,
}: KpiCardProps) {
  // If the delta is exactly 0%, we want to style it neutrally
  const isNeutral = delta === "0%";

  return (
    <div
      data-testid={testId}
      className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-[#FFFCF5] p-6 shadow-sm group hover:border-amber-300 transition-all"
    >
      {/* The glowing background orb */}
      <div
        className={`absolute -top-10 -right-10 w-48 h-48 ${ORB[accent]} blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-500">
            {label}
          </div>

          <div className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {value}
          </div>

          {delta && (
            <div
              className={`mt-2 text-xs flex items-center gap-1 ${
                isNeutral
                  ? "text-slate-500"
                  : deltaPositive
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              <span className="font-bold">
                {isNeutral ? "—" : deltaPositive ? "↑" : "↓"} {delta}
              </span>

              <span className="text-slate-400 font-medium">
                vs last month
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-white border border-amber-100 shadow-sm flex items-center justify-center">
            <Icon className={`w-5 h-5 ${ICON_COLOR[accent]}`} />
          </div>
        )}
      </div>
    </div>
  );
}
