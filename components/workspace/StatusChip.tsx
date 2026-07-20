"use client";

import { ReactNode } from "react";

const STATUS_MAP = {
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  safe: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  healthy: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",

  renewing: "bg-blue-500/10 text-blue-300 border-blue-500/30",

  warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  underutilized: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  expiring: "bg-amber-500/10 text-amber-300 border-amber-500/30",

  expired: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  critical: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  waste: "bg-rose-500/10 text-rose-300 border-rose-500/30",

  unused: "bg-slate-500/10 text-slate-300 border-slate-500/30",
} as const;

interface StatusChipProps {
  status?: string;
  children?: ReactNode;
  className?: string;
  testId?: string;
}

export default function StatusChip({
  status,
  children,
  className = "",
  testId,
}: StatusChipProps) {

  const key = (status || "").toLowerCase();

  const cls =
    STATUS_MAP[key as keyof typeof STATUS_MAP] ??
    "bg-slate-500/10 text-slate-300 border-slate-500/30";

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${cls} ${className}`}
    >
      {children || status}
    </span>
  );
}

interface HealthDotProps {
  health?: string;
}

export function HealthDot({
  health,
}: HealthDotProps) {

  const map: Record<string, string> = {
    healthy:
      "bg-emerald-400 shadow-emerald-400/60",

    underutilized:
      "bg-amber-400 shadow-amber-400/60",

    waste:
      "bg-rose-400 shadow-rose-400/60",
  };

  return (
    <span
      className={`w-2.5 h-2.5 rounded-full inline-block shadow-[0_0_10px] ${
        map[health || ""] || "bg-slate-400"
      }`}
    />
  );
}
