"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/workspace/Layout";
import { TrendingUp, FolderKanban, BarChart3, Download, Filter, CalendarDays, Briefcase, Users } from "lucide-react";
import { currency, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [data, setData] = useState<any>({ monthly: [], yearly: [], rawLicenses: [], rawProjects: [], metrics: {} });
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<"monthly" | "yearly" | "projects" | "custom">("monthly");

  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterVendor, setFilterVendor] = useState("All");

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    setFilterYear(newYear);
    if (newYear === "All") {
        setFilterMonth("All");
    }
  };

  const filteredMonthly = data.monthly.filter((row: any) => {
    if (filterMonth !== "All" && row.month !== filterMonth) return false;
    if (filterYear !== "All" && row.year !== filterYear) return false;
    return true;
  });

  const filteredYearly = data.yearly.filter((row: any) => {
    if (filterYear !== "All" && row.year !== filterYear) return false;
    return true;
  });

  const filteredLicenses = (data.rawLicenses || []).filter((l: any) => {
    if (filterDept !== "All" && l.department !== filterDept) return false;
    if (filterVendor !== "All" && l.vendor !== filterVendor) return false;
    return true;
  });

  const uniqueDepts = ["All", ...Array.from(new Set(data.rawLicenses?.map((l: any) => l.department).filter(Boolean))) as string[]];
  const uniqueVendors = ["All", ...Array.from(new Set(data.rawLicenses?.map((l: any) => l.vendor).filter(Boolean))) as string[]];
  const uniqueYears = ["All", ...Array.from(new Set(data.monthly?.map((m: any) => m.year))) as string[]].sort((a,b) => b.localeCompare(a));

  const downloadCSV = () => {
    const headers = [
      "Application Name", "Vendor", "Category", "Department", 
      "Total Purchased Seats", "Assigned Seats", "Utilization %", 
      "Billing Cycle", "Cost Per License", "Total Monthly Cost", "Renewal Date"
    ];

    const csvRows = [headers.join(",")];

    filteredLicenses.forEach((row: any) => {
      const isYearly = row.billingCycle === 'yearly';
      const unitCost = row.costPerLicense || 0;
      const monthlyEquivalent = isYearly ? (unitCost / 12) : unitCost;
      
      const totalCost = (row.licenseCount || 1) * monthlyEquivalent;
      const utilization = row.licenseCount > 0 ? Math.round((row.assignedUsers / row.licenseCount) * 100) + "%" : "0%";
      const renewalDate = row.renewalDate ? new Date(row.renewalDate).toISOString().split('T')[0] : "N/A";
      
      const values = [
        `"${row.applicationName || ''}"`,
        `"${row.vendor || ''}"`,
        `"${row.category || ''}"`,
        `"${row.department || ''}"`,
        row.licenseCount || 0,
        row.assignedUsers || 0,
        `"${utilization}"`,
        `"${row.billingCycle || 'monthly'}"`,
        unitCost,
        totalCost,
        `"${renewalDate}"`
      ];
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `SaaS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout 
      title="Reports & Analytics" 
      subtitle="Consolidated metrics from Snapshots, Projects, Licenses, and Users"
      action={
        <div className="flex bg-[#0E1320] border border-slate-800 rounded-xl p-1 overflow-x-auto">
          <button onClick={() => setView("monthly")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "monthly" ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-white"}`}>Monthly View</button>
          <button onClick={() => setView("yearly")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "yearly" ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-white"}`}>Yearly View</button>
          <button onClick={() => setView("projects")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "projects" ? "bg-violet-500/20 text-violet-300" : "text-slate-400 hover:text-white"}`}>Project Reports</button>
          <button onClick={() => setView("custom")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "custom" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"}`}>Custom Export</button>
        </div>
      }
    >
      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-[#0E1320]/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3 text-slate-400 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">True SaaS Spend (Total Licenses)</span>
          </div>
          <div className="text-3xl font-display text-white">
            {loading ? "..." : currency(data.metrics?.currentSaasSpend || 0)}
          </div>
        </div>

        <div className="bg-[#0E1320]/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3 text-slate-400 mb-3">
            <FolderKanban className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-medium">Dynamically Allocated Project Costs</span>
          </div>
          <div className="text-3xl font-display text-white">
            {loading ? "..." : currency(data.metrics?.totalProjectSpend || 0)}
          </div>
        </div>

        <div className="bg-[#0E1320]/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3 text-slate-400 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Total Purchased Licenses</span>
          </div>
          <div className="text-3xl font-display text-white">
            {loading ? "..." : data.metrics?.currentTotalLicenses || 0}
          </div>
        </div>
      </div>

      {/* --- TIME FILTERS FOR HISTORICAL TABS --- */}
      {(view === "monthly" || view === "yearly") && (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Date Filters:</span>
          </div>
          <select value={filterYear} onChange={handleYearChange} className="bg-[#0E1320] border border-slate-700 text-sm text-white rounded-lg px-3 py-1.5 outline-none focus:border-blue-500">
            {uniqueYears.map(y => <option key={y} value={y}>{y === "All" ? "All Years" : y}</option>)}
          </select>
          {view === "monthly" && (
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              disabled={filterYear === "All"}
              className={`bg-[#0E1320] border border-slate-700 text-sm text-white rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 ${filterYear === "All" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="All">All Months</option>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* --- TAB 1 & 2: SNAPSHOT TIMELINE --- */}
      {(view === "monthly" || view === "yearly") && (
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-2 bg-[#111728]/50">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-medium text-white">
              {view === "monthly" ? "Monthly Snapshot Database" : "Yearly Historical Trends"}
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111728] sticky top-0 z-10">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left px-5 py-4 font-medium">Period</th>
                  <th className="text-center px-5 py-4 font-medium">Active Apps</th>
                  <th className="text-center px-5 py-4 font-medium">Total Purchased Licenses</th>
                  <th className="text-right px-5 py-4 font-medium">SaaS Spend</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">Loading snapshot data...</td></tr>
                ) : (view === "monthly" ? filteredMonthly : filteredYearly).length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">No data matches these filters.</td></tr>
                ) : (
                  (view === "monthly" ? filteredMonthly : filteredYearly).map((row: any, i: number) => (
                    <tr key={`${row.period}-${i}`} className="border-t border-slate-800/40 hover:bg-white/[0.02] transition">
                      <td className="px-5 py-4 font-medium text-white">{row.period}</td>
                      <td className="px-5 py-4 text-center text-slate-400 tabular-nums">{row.apps}</td>
                      <td className="px-5 py-4 text-center text-slate-400 tabular-nums">{row.licenses}</td>
                      <td className="px-5 py-4 text-right text-rose-300 tabular-nums font-medium">{currency(row.saasSpend)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: PROJECTS REPORT --- */}
      {view === "projects" && (
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-2 bg-[#111728]/50">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-medium text-white">Project-Wise Reports (Distributed License Cost)</h2>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111728] sticky top-0 z-10">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left px-5 py-4 font-medium">Project Name</th>
                  <th className="text-left px-5 py-4 font-medium">Department</th>
                  <th className="text-center px-5 py-4 font-medium">Assigned Users</th>
                  <th className="text-right px-5 py-4 font-medium">Allocated Monthly Software Cost</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">Loading project data...</td></tr>
                ) : data.rawProjects.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">No projects found in this workspace.</td></tr>
                ) : (
                  data.rawProjects.map((proj: any, i: number) => {
                    return (
                      <tr key={proj._id || i} className="border-t border-slate-800/40 hover:bg-white/[0.02] transition">
                        <td className="px-5 py-4 font-medium text-white">{proj.name || proj.projectName || "Unnamed Project"}</td>
                        <td className="px-5 py-4 text-slate-400">{proj.department || "General"}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                            <Users className="w-3 h-3" /> {proj.memberCount || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-emerald-400 tabular-nums font-bold">
                          {currency(proj.allocatedCost || 0)} <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: CUSTOM REPORT GENERATOR --- */}
      {view === "custom" && (
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-[#111728]/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">Refine Data:</span>
              </div>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-[#0E1320] border border-slate-700 text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500">
                <option value="" disabled>Department</option>
                {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="bg-[#0E1320] border border-slate-700 text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500">
                <option value="" disabled>Vendor</option>
                {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            
            <button 
              onClick={downloadCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-900/20"
            >
              <Download className="w-4 h-4" /> Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111728] sticky top-0 z-10">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left px-5 py-3 font-medium">Application</th>
                  <th className="text-left px-5 py-3 font-medium">Vendor</th>
                  <th className="text-left px-5 py-3 font-medium">Dept</th>
                  <th className="text-center px-5 py-3 font-medium">Utilization</th>
                  <th className="text-right px-5 py-3 font-medium">Monthly Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No applications match these filters.</td></tr>
                ) : (
                  filteredLicenses.map((lic: any) => {
                    const utilization = lic.licenseCount > 0 ? Math.round((lic.assignedUsers / lic.licenseCount) * 100) : 0;
                    
                    const isYearly = lic.billingCycle === 'yearly';
                    const unitCost = lic.costPerLicense || 0;
                    const monthlyEquivalent = isYearly ? (unitCost / 12) : unitCost;
                    const totalCost = (lic.licenseCount || 1) * monthlyEquivalent;
                    
                    return (
                      <tr key={lic._id} className="border-t border-slate-800/40 hover:bg-white/[0.02]">
                        <td className="px-5 py-4 font-medium text-white">{lic.applicationName}</td>
                        <td className="px-5 py-4 text-slate-400">{lic.vendor}</td>
                        <td className="px-5 py-4 text-slate-400">{lic.department}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${utilization >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : utilization < 40 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {lic.assignedUsers} / {lic.licenseCount} ({utilization}%)
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-white tabular-nums">{currency(totalCost)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
