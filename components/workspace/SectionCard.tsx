"use client";

import { ReactNode } from "react";

interface SectionCardProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  testId?: string;
}

export default function SectionCard({
  title,
  action,
  children,
  className = "",
  testId,
}: SectionCardProps) {
  return (
    <div
      data-testid={testId}
      className={`rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 p-6 shadow-lg ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && (
            <div className="font-display text-base font-medium text-white tracking-tight">
              {title}
            </div>
          )}

          {action}
        </div>
      )}

      {children}
    </div>
  );
}
