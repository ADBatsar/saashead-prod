"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/workspace/Layout";
import StatusChip, { HealthDot } from "@/components/workspace/StatusChip";
import { currency, formatDate } from "@/lib/utils";
import { Search, ArrowUpDown } from "lucide-react";

const HEALTH_LABEL: Record<string, string> = { 
  healthy: "Healthy", 
  underutilized: "Underutilized", 
  waste: "Waste" 
};

export default function LicensesPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("monthly_cost");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/licenses");
        const json = await res.json();
        
        // Strictly ensure we extract an array, no matter the API response structure
        let dataArray: any[] = [];
        if (Array.isArray(json)) {
          dataArray = json;
        } else if (json && Array.isArray(json.data)) {
          dataArray = json.data;
        } else if (json && Array.isArray(json.licenses)) {
          dataArray = json.licenses;
        }
        
        // Map the raw DB schema to the frontend table format
        const mappedData = dataArray.map((l: any) => {
            const seats_total = Number(l.licenseCount) || 0;
            // Use assignedTo array length if it exists, otherwise fallback to assignedUsers
            const assignedArray = l.assignedTo || [];
            const seats_used = assignedArray.length > 0 ? assignedArray.length : (Number(l.assignedUsers) || 0);
            
            const costPerLicense = Number(l.costPerLicense) || 0;
            // Total cost for this app per month
            const monthly_cost = seats_total * costPerLicense; 

            // Calculate health dynamically
            const pct = seats_total > 0 ? (seats_used / seats_total) : 0;
            let health = "healthy";
            if (pct < 0.4) health = "waste";
            else if (pct < 0.8) health = "underutilized";

            return {
                id: l._id || l.id,
                name: l.applicationName,
                vendor: l.vendorName || l.vendor || "Unknown",
                owner: l.owner || "IT",
                department: l.department || "Engineering",
                seats_total,
                seats_used,
                monthly_cost,
                renewal_date: l.renewalDate,
                health
            };
        });
        
        setApps(mappedData);
      } catch (error) {
        console.error("Failed to fetch licenses:", error);
        setApps([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Safeguard: Ensure apps is an array before filtering and calculating
  const safeApps = Array.isArray(apps) ? apps : [];

  const rows = safeApps
    .filter((a) => 
      query === "" || 
      a.name?.toLowerCase().includes(query.toLowerCase()) || 
      a.vendor?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av === bv) return 0;
      const d = (av > bv ? 1 : -1) * (sortDir === "asc" ? 1 : -1);
      return d;
    });

  const cols = [
    { key: "name", label: "Application" },
    { key: "vendor", label: "Vendor" },
    { key: "owner", label: "Owner" },
    { key: "department", label: "Department" },
    { key: "seats_total", label: "Seats" },
    { key: "seats_used", label: "Assigned" },
    { key: "inactive", label: "Unused" },
    { key: "monthly_cost", label: "Cost" },
    { key: "renewal_date", label: "Renewal" },
    { key: "health", label: "Health" },
  ];

  // Calculated totals using the safeguarded array
  const totalCost = safeApps.reduce((s, a) => s + (a.monthly_cost || 0), 0);
  const totalSeats = safeApps.reduce((s, a) => s + (a.seats_total || 0), 0);
  const totalUsed = safeApps.reduce((s, a) => s + (a.seats_used || 0), 0);

  if (loading) {
    return (
      <Layout title="Licenses" subtitle="Seat management across applications">
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm font-medium animate-pulse">
          Loading licenses...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Licenses" subtitle="Seat management across applications">
      
      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Total Licenses" value={totalSeats} />
        <Stat label="Assigned" value={totalUsed} />
        <Stat label="Unused" value={Math.max(0, totalSeats - totalUsed)} accent="rose" />
        <Stat label="Monthly Cost" value={currency(totalCost)} accent="blue" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2 w-72 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            data-testid="license-search" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search apps or vendors…"
            className="bg-transparent outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 flex-1" 
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-500">    
                {cols.map((c) => (
                  <th key={c.key} className="text-left px-4 py-3 font-medium">
                    <button 
                      onClick={() => { 
                        if (sortKey === c.key) setSortDir(sortDir === "asc" ? "desc" : "asc"); 
                        else { setSortKey(c.key); setSortDir("desc"); } 
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-900 font-bold transition" 
                      data-testid={`sort-${c.key}`}
                    >
                      {c.label} <ArrowUpDown className="w-3 h-3 opacity-50" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((a, index) => {
                const inactive = Math.max(0, (a.seats_total || 0) - (a.seats_used || 0));
                // Safely handle missing IDs (supports MongoDB _id or falls back to index)
                const rowKey = a.id || a._id || index; 
                
                return (
                  <tr key={rowKey} data-testid={`license-row-${rowKey}`} className="hover:bg-slate-50 transition cursor-pointer">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <span className="text-slate-900 font-bold">{a.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.vendor}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{a.owner}</td>
                    <td className="px-4 py-3 text-slate-600">{a.department}</td>
                    <td className="px-4 py-3 text-slate-900 font-bold tabular-nums">{a.seats_total}</td>
                    <td className="px-4 py-3 text-slate-900 font-bold tabular-nums">{a.seats_used}</td>
                    <td className="px-4 py-3 text-rose-600 font-bold tabular-nums">{inactive}</td>
                    <td className="px-4 py-3 text-slate-900 font-bold tabular-nums">{currency(a.monthly_cost)}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{formatDate(a.renewal_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <HealthDot health={a.health} />
                        <span className="text-slate-600 font-medium text-xs">{HEALTH_LABEL[a.health] || a.health}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={cols.length} className="px-4 py-10 text-center text-slate-500">
                    No licenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  accent?: "slate" | "rose" | "blue";
}

function Stat({ label, value, accent = "slate" }: StatProps) {
  const colors = { 
    slate: "text-slate-900 font-black", 
    rose: "text-rose-600 font-black", 
    blue: "text-blue-600 font-black" 
  };
  
  return (
    <div className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5 hover:shadow-md transition">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className={`font-display text-2xl tabular-nums ${colors[accent]}`}>
        {value}
      </div>
    </div>
  );
}
