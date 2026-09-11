"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/workspace/Layout";
import { formatDate, currency } from "@/lib/utils";

export default function RenewalsPage() {
  const [bucket, setBucket] = useState("all");
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live data and calculate date math
  useEffect(() => {
  
 async function fetchRenewals() {
      try {
        const res = await fetch("/api/licenses");
        const json = await res.json(); // The object: { success: true, data: [...] }

        // BULLETPROOF CHECK: Make sure the API succeeded and json.data is an array
        if (!res.ok || !json.success || !Array.isArray(json.data)) {
          console.error("Failed to fetch renewals or invalid data format:", json);
          setRenewals([]); 
          return;
        }

        const today = new Date().getTime();
        
        // Use json.data here!
        const processed = json.data
          .filter((app: any) => app.renewalDate) // Ignore apps without renewal dates
          .map((app: any) => {
            const rDate = new Date(app.renewalDate).getTime();
            const days = Math.ceil((rDate - today) / (1000 * 3600 * 24));
            
            // Assign Risk Buckets
            let status = "Safe";
            if (days <= 30) status = "Critical";
            else if (days <= 90) status = "Warning";

            // Calculate annual financial impact for context
            const cost = (app.costPerLicense || 0) * (app.licenseCount || 0);
            const annualImpact = app.billingCycle === "yearly" ? cost : cost * 12;

            return {
              ...app,
              days,
              status,
              annualImpact,
            };
          })
          .sort((a: any, b: any) => a.days - b.days); // Sort by most urgent first

        setRenewals(processed);
      } catch (error) {
        console.error("Failed to load renewals", error);
        setRenewals([]); // Fallback to empty state on network failure
      } finally {
        setLoading(false);
      }
    }
    
    fetchRenewals();
  }, []);

  // 2. Compute dynamic counts for the Tabs
  const counts = useMemo(() => {
    return {
      all: renewals.length,
      critical: renewals.filter(r => r.status === "Critical").length,
      warning: renewals.filter(r => r.status === "Warning").length,
      safe: renewals.filter(r => r.status === "Safe").length,
    };
  }, [renewals]);

  const tabs = [
    { k: "all", label: "All Upcoming", count: counts.all, color: "text-slate-900 font-bold" },
    { k: "critical", label: "Critical (≤ 30 days)", count: counts.critical, color: "text-rose-400" },
    { k: "warning", label: "Warning (≤ 90 days)", count: counts.warning, color: "text-amber-400" },
    { k: "safe", label: "Safe (> 90 days)", count: counts.safe, color: "text-emerald-400" },
  ];

  // 3. Filter the table based on the selected bucket
  const filteredRenewals = useMemo(() => {
    if (bucket === "all") return renewals;
    return renewals.filter(r => r.status.toLowerCase() === bucket);
  }, [renewals, bucket]);

  return (
    <Layout title="Renewals" subtitle="Track upcoming contract renewals and financial risk.">
      
      {/* Filter Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setBucket(t.k)}
            className={`text-left rounded-2xl border p-5 transition ${
              bucket === t.k 
                ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                : "border-amber-200/60 shadow-sm bg-[#FFFCF5]/80 hover:bg-white"
            }`}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.label}</div>
            <div className={`font-display text-3xl font-light tabular-nums mt-2 ${t.color}`}>
              {t.count}
            </div>
          </button>
        ))}
      </div>

      {/* Renewals Table */}
      <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5]/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 font-medium">
            <thead className="bg-[#111728] border-b border-amber-200/60 shadow-sm">
              <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Application</th>
                <th className="px-6 py-4 font-medium">Renewal Date</th>
                <th className="px-6 py-4 font-medium">Time Left</th>
                <th className="px-6 py-4 font-medium">Annual Impact</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-pulse">Loading renewal data...</div>
                  </td>
                </tr>
              ) : filteredRenewals.length > 0 ? (
                filteredRenewals.map((app) => (
                  <tr key={app._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-slate-900 font-bold">{app.applicationName}</div>
                          <div className="text-[11px] text-slate-500">{app.owner || "IT"} · {app.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {formatDate(app.renewalDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap tabular-nums font-medium">
                      {app.days < 0 ? (
                        <span className="text-rose-400 font-bold">Expired {Math.abs(app.days)} days ago</span>
                      ) : (
                        <span>{app.days} Days</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap tabular-nums text-slate-600 font-medium">
                      {currency(app.annualImpact)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === "Critical" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        app.status === "Warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-[#FFFCF5]/50">
                    No upcoming renewals found in this category.
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
