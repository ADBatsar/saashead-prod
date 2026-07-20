"use client";

import { vendorColor } from "@/lib/utils";

interface VendorBadgeProps {
  name: string;
  size?: number;
}

export default function VendorBadge({
  name,
  size = 36,
}: VendorBadgeProps) {

  const { bg, fg } = vendorColor(name);

  const initials = (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="rounded-xl flex items-center justify-center font-display font-semibold shrink-0"
      style={{
        background: bg,
        color: fg,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}
