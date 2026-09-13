"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/workspace/Layout";
import { formatDate, currency } from "@/lib/utils";

export default function RenewalsPage() {
  const [bucket, setBucket] = useState("all");
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRenewals() {
      try {
        const res = await fetch("/api/licenses");
        const json = await res.json(); 

        if (!res.ok || !json.success || !Array.isArray(json.data)) {
          setRenewals([]); 
          return;
        }

        const today = new Date().getTime();
        
        const processed = json.data
          .filter((app: any) => app.renewalDate) 
          .map((app: any) => {
            const rDate = new Date(app.renewalDate).getTime();
            const days = Math.ceil((rDate - today) / (1000 * 3600 * 24));
            
            let status = "Safe";
            if (days <= 30) status = "Critical";
            else if (days <= 90) status = "Warning";

            const cost = (app.costPerLicense || 0) * (app.licenseCount || 0);
            const annualImpact = app.billingCycle === "yearly" ? cost : cost * 12;

            return {
              ...app,
              days,
              status,
              annualImpact,
            };
          })
          .sort((a: any, b: any) => a.days - b.days); 

        setRenewals(processed);
      } catch (error) {
        console.error("Failed to load renewals", error);
        setRenewals([]); 
      } finally {
        setLoading(false);
      }
    }
    
    fetchRenewals();
  }, []);

  const counts = useMemo(() => {
    return {
      all: renewals.length,
      critical: renewals.filter(r => r.status === "Critical").length,
      warning: renewals.filter(r => r.status === "Warning").length,
      safe: renewals.filter(r => r.status === "Safe").length,
    };
  }, [renewals]);

  const tabs = [
    { k: "all", label: "All Upcoming", count: counts.all, color: "text-slate-900" },
    { k: "critical", label: "Critical (≤ 30 days)", count: counts.critical, color: "text-rose-600" },
    { k: "warning", label: "Warning (≤ 90 days)", count: counts.warning, color: "text-amber-500" },
    { k: "safe", label: "Safe (> 90 days)", count: counts.safe, color: "text-emerald-600" },
  ];

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
            className={`text-left rounded-2xl border p-5 transition-all ${
              bucket === t.k 
                ? "border-blue-500 bg-blue-50 shadow-sm" 
                : "border-slate-200 shadow-sm bg-white hover:border-blue-300"
            }`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.label}</div>
            <div className={`font-display text-3xl font-bold tabular-nums mt-2 ${t.color}`}>
              {t.count}
            </div>
          </button>
        ))}
      </div>

      {/* Renewals Table */}
      <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 font-medium">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Application</th>
                <th className="px-6 py-4">Renewal Date</th>
                <th className="px-6 py-4">Time Left</th>
                <th className="px-6 py-4">Annual Impact</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="animate-pulse">Loading renewal data...</div>
                  </td>
                </tr>
              ) : filteredRenewals.length > 0 ? (
                filteredRenewals.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold text-slate-900">{app.applicationName}</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">{app.owner || "IT"} · {app.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-bold">
                      {formatDate(app.renewalDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap tabular-nums font-bold">
                      {app.days < 0 ? (
                        <span className="text-rose-600">Expired {Math.abs(app.days)} days ago</span>
                      ) : (
                        <span className="text-slate-900">{app.days} Days</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap tabular-nums text-slate-900 font-bold">
                      {currency(app.annualImpact)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        app.status === "Critical" ? "bg-rose-50 text-rose-600 border-rose-200" :
                        app.status === "Warning" ? "bg-amber-50 text-amber-600 border-amber-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
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
