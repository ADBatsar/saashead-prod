/**
 * Formats a number as USD currency (e.g., $1,250)
 */
export function currency(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/**
 * Formats a date string into a readable format (e.g., Jul 4, 2026)
 * Handles invalid or null dates by returning a fallback string.
 */
export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "N/A";

  const d = new Date(date);
  
  // Check if the date is actually valid
  if (isNaN(d.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Returns a consistent color class based on the vendor name
 */
export function vendorColor(name: string): string {
if (!name) return "#64748b";
     const colors = [
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
