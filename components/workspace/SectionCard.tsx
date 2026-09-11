"use client";

import React, { ReactNode } from "react";

interface SectionCardProps {
  title: ReactNode;
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
      className={`bg-[#FFFCF5] border border-amber-200/60 rounded-2xl shadow-sm p-6 flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        {/* THE FIX: Changed text-white to text-slate-900 here */}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>

        {action && <div>{action}</div>}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}
