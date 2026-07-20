"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/workspace/Layout";
import VendorBadge from "@/components/workspace/VendorBadge";
import { PiggyBank, AlertTriangle, Layers, TrendingDown, ArrowRight } from "lucide-react";
import { currency } from "@/lib/utils";

export default function CostOptimizationPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ unused: 0, duplicate: 0, oversubscribed: 0, total: 0 });
  const [unusedApps, setUnusedApps] = useState<any[]>([]);
  const [duplicateCategories, setDuplicateCategories] = useState<any[]>([]);

  useEffect(() => {
    async function analyzeCosts() {
      try {
        const res = await fetch("/api/licenses");
        const json = await res.json();
        
        if (!res.ok || !json.success || !Array.isArray(json.data)) {
          return;
        }

        const licenses = json.data;
        let unusedCost = 0;
        let oversubCost = 0;
        const unusedList: any[] = [];
        const categoryMap: Record<string, any[]> = {};

        // 1. Analyze Unused & Oversubscribed
        licenses.forEach((app: any) => {
          const totalSeats = app.licenseCount || 1;
          const assigned = app.assignedTo?.length || app.assignedUsers || 0;
          const unusedSeats = Math.max(totalSeats - assigned, 0);
          
          const monthlyCost = app.billingCycle === 'yearly' ? app.costPerLicense / 12 : app.costPerLicense;
          
          if (unusedSeats > 0) {
            const waste = unusedSeats * monthlyCost;
            unusedCost += waste;
            unusedList.push({ ...app, unusedSeats, waste, monthlyCost });
          }

          const usagePct = assigned / totalSeats;
          if (usagePct > 0 && usagePct < 0.5) {
            oversubCost += (totalSeats * monthlyCost);
          }

          // Group by category for overlap analysis
          const cat = app.category || "Uncategorized";
          if (!categoryMap[cat]) categoryMap[cat] = [];
          categoryMap[cat].push(app);
        });

        // 2. Analyze Duplicate/Overlapping Tools
        let duplicateCost = 0;
        const duplicatesList: any[] = [];

        Object.keys(categoryMap).forEach(cat => {
          const appsInCat = categoryMap[cat];
          if (appsInCat.length > 1 && cat !== "Other" && cat !== "Uncategorized") {
            // Sort by most used to least used
            const sorted = appsInCat.sort((a, b) => 
              (b.assignedTo?.length || 0) - (a.assignedTo?.length || 0)
            );
            
            const primary = sorted[0];
            const redundancies = sorted.slice(1);
            
            let catDupCost = 0;
            redundancies.forEach(r => {
              const mCost = r.billingCycle === 'yearly' ? r.costPerLicense / 12 : r.costPerLicense;
              catDupCost += (mCost * (r.licenseCount || 1));
            });
            
            duplicateCost += catDupCost;
            duplicatesList.push({ 
              category: cat, 
              primary, 
              redundancies, 
              potentialSavings: catDupCost 
            });
          }
        });

        setUnusedApps(unusedList.sort((a, b) => b.waste - a.waste));
        setDuplicateCategories(duplicatesList.sort((a, b) => b.potentialSavings - a.potentialSavings));
        setMetrics({
          unused: unusedCost,
          duplicate: duplicateCost,
          oversubscribed: oversubCost,
          total: unusedCost + duplicateCost
        });

      } catch (error) {
        console.error("Failed to analyze costs", error);
      } finally {
        setLoading(false);
      }
    }

    analyzeCosts();
  }, []);

  const ORB = { 
    rose: "bg-rose-500/20", 
    amber: "bg-amber-500/20", 
    violet: "bg-violet-500/20", 
    emerald: "bg-emerald-500/20" 
  };

  const cards = [
    { l: "Unused Licenses", v: metrics.unused, sub: "/mo", icon: AlertTriangle, accent: "rose" },
    { l: "Overlapping Tools", v: metrics.duplicate, sub: "/mo", icon: Layers, accent: "amber" },
    { l: "Oversubscribed", v: metrics.oversubscribed, sub: "/mo", icon: TrendingDown, accent: "violet" },
    { l: "Total Potential Savings", v: metrics.total, sub: "/mo", icon: PiggyBank, accent: "emerald" },
  ];

  return (
    <Layout title="Cost Optimization" subtitle="Identify SaaS waste and recover lost revenue automatically.">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div key={c.l} className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0E1320]/90 p-6 shadow-2xl">
            <div className={`absolute -top-10 -right-10 w-48 h-48 ${ORB[c.accent as keyof typeof ORB]} blur-3xl rounded-full`} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{c.l}</div>
                <div className="mt-3 font-display text-3xl text-white font-light tabular-nums">
                  {loading ? "..." : currency(c.v)}
                  <span className="text-sm text-slate-500 ml-1">{c.sub}</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
                <c.icon className={`w-5 h-5 text-${c.accent}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        
        {/* Unused Licenses Recovery */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 overflow-hidden shadow-xl flex flex-col">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="font-display text-white font-medium">Unused License Recovery</h3>
              <p className="text-xs text-slate-500 mt-0.5">Seats paid for but not assigned to users.</p>
            </div>
            <span className="bg-rose-500/10 text-rose-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">High Priority</span>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111728] border-b border-slate-800/80">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Application</th>
                  <th className="px-5 py-3 font-medium text-center">Unused Seats</th>
                  <th className="px-5 py-3 font-medium text-right">Monthly Waste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {unusedApps.length > 0 ? unusedApps.map(app => (
                  <tr key={app._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <VendorBadge name={app.vendor} size={28} />
                      <span className="text-slate-200 font-medium">{app.applicationName}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="bg-white/5 text-slate-300 px-2 py-0.5 rounded-md tabular-nums">{app.unusedSeats}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-rose-400 font-medium tabular-nums">
                      {currency(app.waste)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-slate-500">
                      {loading ? "Analyzing licenses..." : "Great job! No unused licenses found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Duplicate Tool Overlap */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 overflow-hidden shadow-xl flex flex-col">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="font-display text-white font-medium">Category Overlap Analysis</h3>
              <p className="text-xs text-slate-500 mt-0.5">Multiple tools serving the same function.</p>
            </div>
            <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Review Required</span>
          </div>

          <div className="overflow-x-auto flex-1 p-5 space-y-4">
            {duplicateCategories.length > 0 ? duplicateCategories.map(cat => (
              <div key={cat.category} className="border border-slate-800/80 bg-[#111728]/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.category}</span>
                  <span className="text-sm font-medium text-amber-400">Save {currency(cat.potentialSavings)}/mo</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  {/* Primary Tool */}
                  <div className="flex-1 bg-[#0E1320] border border-emerald-500/20 rounded-lg p-3">
                    <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-2 font-semibold">Primary Tool</div>
                    <div className="flex items-center gap-2">
                      <VendorBadge name={cat.primary.vendor} size={24} />
                      <span className="text-sm text-slate-200">{cat.primary.applicationName}</span>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  
                  {/* Redundant Tools */}
                  <div className="flex-1 bg-[#0E1320] border border-rose-500/20 rounded-lg p-3 space-y-2">
                    <div className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Consolidate These</div>
                    {cat.redundancies.map((r: any) => (
                      <div key={r._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <VendorBadge name={r.vendor} size={20} />
                          <span className="text-xs text-slate-300">{r.applicationName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-500">
                {loading ? "Analyzing overlap..." : "No overlapping categories detected."}
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
