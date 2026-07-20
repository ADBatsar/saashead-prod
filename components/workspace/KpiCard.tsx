"use client";

import { ComponentType } from "react";

const ORB = {
  blue: "bg-blue-600/25",
  rose: "bg-rose-600/25",
  emerald: "bg-emerald-600/25",
  amber: "bg-amber-600/25",
  violet: "bg-violet-600/25",
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
  return (
    <div
      data-testid={testId}
      className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0E1320]/90 p-6 shadow-2xl group hover:border-slate-700 transition-all"
    >
      <div
        className={`absolute -top-10 -right-10 w-48 h-48 ${ORB[accent]} blur-3xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative flex items-start justify-between">

        <div>

          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
            {label}
          </div>

          <div className="mt-3 font-display text-3xl font-light text-white tabular-nums">
            {value}
          </div>

          {delta && (
            <div
              className={`mt-2 text-xs ${
                deltaPositive
                  ? "text-emerald-400"
                  : "text-rose-400"
              } flex items-center gap-1`}
            >
              <span className="font-semibold">
                {deltaPositive ? "↑" : "↓"} {delta}
              </span>

              <span className="text-slate-500">
                vs last month
              </span>
            </div>
          )}

        </div>

        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-200" />
          </div>
        )}

      </div>

    </div>
  );
}
