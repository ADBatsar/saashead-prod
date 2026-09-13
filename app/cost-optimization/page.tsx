"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/workspace/Layout";
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
    rose: "bg-rose-500/10", 
    amber: "bg-amber-500/10", 
    violet: "bg-violet-500/10", 
    emerald: "bg-emerald-500/10" 
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
          <div key={c.l} className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white p-6 hover:shadow-md transition">
            <div className={`absolute -top-10 -right-10 w-48 h-48 ${ORB[c.accent as keyof typeof ORB]} blur-3xl rounded-full`} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{c.l}</div>
                <div className="mt-3 font-display text-3xl text-slate-900 font-bold tabular-nums">
                  {loading ? "..." : currency(c.v)}
                  <span className="text-sm text-slate-500 ml-1">{c.sub}</span>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${c.accent}-50 border border-${c.accent}-100`}>
                <c.icon className={`w-5 h-5 text-${c.accent}-500`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        
        {/* Unused Licenses Recovery */}
        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Unused License Recovery</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Seats paid for but not assigned to users.</p>
            </div>
            <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">High Priority</span>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Application</th>
                  <th className="px-5 py-3 text-center">Unused Seats</th>
                  <th className="px-5 py-3 text-right">Monthly Waste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unusedApps.length > 0 ? unusedApps.map(app => (
                  <tr key={app._id} className="hover:bg-slate-50 transition cursor-pointer">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <span className="text-slate-900 font-bold">{app.applicationName}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md tabular-nums">{app.unusedSeats}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-rose-600 font-bold tabular-nums">
                      {currency(app.waste)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-slate-500 font-medium">
                      {loading ? "Analyzing licenses..." : "Great job! No unused licenses found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Duplicate Tool Overlap */}
        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Category Overlap Analysis</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Multiple tools serving the same function.</p>
            </div>
            <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Review Required</span>
          </div>

          <div className="overflow-x-auto flex-1 p-5 space-y-4 custom-scrollbar">
            {duplicateCategories.length > 0 ? duplicateCategories.map(cat => (
              <div key={cat.category} className="border border-slate-200 shadow-sm bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{cat.category}</span>
                  <span className="text-sm font-bold text-emerald-600">Save {currency(cat.potentialSavings)}/mo</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  {/* Primary Tool */}
                  <div className="flex-1 bg-white border border-emerald-200 shadow-sm rounded-lg p-3">
                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-2">Primary Tool</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-900 font-bold">{cat.primary.applicationName}</span>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  
                  {/* Redundant Tools */}
                  <div className="flex-1 bg-white border border-rose-200 shadow-sm rounded-lg p-3 space-y-2">
                    <div className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Consolidate These</div>
                    {cat.redundancies.map((r: any) => (
                      <div key={r._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-700 font-bold">{r.applicationName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-500 font-medium">
                {loading ? "Analyzing overlap..." : "No overlapping categories detected."}
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
