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
    >
      {/* --- MOVED INTO BODY: View Toggle Buttons --- */}
      <div className="flex bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl p-1 overflow-x-auto mb-6 w-max">
        <button onClick={() => setView("monthly")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "monthly" ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"}`}>Monthly View</button>
        <button onClick={() => setView("yearly")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "yearly" ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"}`}>Yearly View</button>
        <button onClick={() => setView("projects")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "projects" ? "bg-violet-100 text-violet-700 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"}`}>Project Reports</button>
        <button onClick={() => setView("custom")} className={`px-4 py-1.5 text-xs whitespace-nowrap rounded-lg transition ${view === "custom" ? "bg-emerald-100 text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"}`}>Custom Export</button>
      </div>

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold uppercase tracking-wider text-[11px]">True SaaS Spend</span>
          </div>
          <div className="text-3xl font-display text-slate-900 font-bold">
            {loading ? "..." : currency(data.metrics?.currentSaasSpend || 0)}
          </div>
        </div>

        <div className="bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <FolderKanban className="w-5 h-5 text-violet-500" />
            <span className="text-sm font-bold uppercase tracking-wider text-[11px]">Project Allocated Cost</span>
          </div>
          <div className="text-3xl font-display text-slate-900 font-bold">
            {loading ? "..." : currency(data.metrics?.totalProjectSpend || 0)}
          </div>
        </div>

        <div className="bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-bold uppercase tracking-wider text-[11px]">Purchased Licenses</span>
          </div>
          <div className="text-3xl font-display text-slate-900 font-bold">
            {loading ? "..." : data.metrics?.currentTotalLicenses || 0}
          </div>
        </div>
      </div>

      {/* --- TIME FILTERS FOR HISTORICAL TABS --- */}
      {(view === "monthly" || view === "yearly") && (
        <div className="flex items-center gap-4 mb-4 bg-[#FFFCF5] p-3 rounded-xl border border-amber-200/60 shadow-sm w-max">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date Filters:</span>
          </div>
          <select value={filterYear} onChange={handleYearChange} className="bg-white border border-amber-200/60 text-sm text-slate-900 font-bold rounded-lg px-3 py-1.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-sm cursor-pointer">
            {uniqueYears.map(y => <option key={y} value={y}>{y === "All" ? "All Years" : y}</option>)}
          </select>
          {view === "monthly" && (
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              disabled={filterYear === "All"}
              className={`bg-white border border-amber-200/60 text-sm text-slate-900 font-bold rounded-lg px-3 py-1.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-sm cursor-pointer ${filterYear === "All" ? "opacity-50 cursor-not-allowed" : ""}`}
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
        <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5] overflow-hidden">
          <div className="p-5 border-b border-amber-200/60 flex items-center gap-2 bg-white/50">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm text-slate-900 font-bold">
              {view === "monthly" ? "Monthly Snapshot Database" : "Yearly Historical Trends"}
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="text-left px-5 py-4">Period</th>
                  <th className="text-center px-5 py-4">Active Apps</th>
                  <th className="text-center px-5 py-4">Total Purchased Licenses</th>
                  <th className="text-right px-5 py-4">SaaS Spend</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500 font-medium">Loading snapshot data...</td></tr>
                ) : (view === "monthly" ? filteredMonthly : filteredYearly).length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500 font-medium">No data matches these filters.</td></tr>
                ) : (
                  (view === "monthly" ? filteredMonthly : filteredYearly).map((row: any, i: number) => (
                    <tr key={`${row.period}-${i}`} className="border-b border-slate-100 hover:bg-white transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{row.period}</td>
                      <td className="px-5 py-4 text-center font-medium text-slate-600 tabular-nums">{row.apps}</td>
                      <td className="px-5 py-4 text-center font-medium text-slate-600 tabular-nums">{row.licenses}</td>
                      <td className="px-5 py-4 text-right text-rose-600 tabular-nums font-bold">{currency(row.saasSpend)}</td>
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
        <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5] overflow-hidden">
          <div className="p-5 border-b border-amber-200/60 flex items-center gap-2 bg-white/50">
            <Briefcase className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm text-slate-900 font-bold">Project-Wise Reports (Distributed License Cost)</h2>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="text-left px-5 py-4">Project Name</th>
                  <th className="text-left px-5 py-4">Department</th>
                  <th className="text-center px-5 py-4">Assigned Users</th>
                  <th className="text-right px-5 py-4">Allocated Monthly Cost</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500 font-medium">Loading project data...</td></tr>
                ) : data.rawProjects.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500 font-medium">No projects found in this workspace.</td></tr>
                ) : (
                  data.rawProjects.map((proj: any, i: number) => {
                    return (
                      <tr key={proj._id || i} className="border-b border-slate-100 hover:bg-white transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{proj.name || proj.projectName || "Unnamed Project"}</td>
                        <td className="px-5 py-4 font-medium text-slate-600">{proj.department || "General"}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-white border border-amber-200/60 shadow-sm font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {proj.memberCount || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-emerald-600 tabular-nums font-bold">
                          {currency(proj.allocatedCost || 0)} <span className="text-[10px] text-slate-400 font-medium">/mo</span>
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
        <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5] overflow-hidden">
          <div className="p-5 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-4 bg-white/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Refine Data:</span>
              </div>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-white border border-amber-200/60 text-sm text-slate-900 font-bold rounded-lg px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-sm cursor-pointer">
                <option value="" disabled>Department</option>
                {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="bg-white border border-amber-200/60 text-sm text-slate-900 font-bold rounded-lg px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-sm cursor-pointer">
                <option value="" disabled>Vendor</option>
                {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            
            <button 
              onClick={downloadCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-sm"
            >
              <Download className="w-4 h-4" /> Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="text-left px-5 py-3">Application</th>
                  <th className="text-left px-5 py-3">Vendor</th>
                  <th className="text-left px-5 py-3">Dept</th>
                  <th className="text-center px-5 py-3">Utilization</th>
                  <th className="text-right px-5 py-3">Monthly Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 font-medium">No applications match these filters.</td></tr>
                ) : (
                  filteredLicenses.map((lic: any) => {
                    const utilization = lic.licenseCount > 0 ? Math.round((lic.assignedUsers / lic.licenseCount) * 100) : 0;
                    
                    const isYearly = lic.billingCycle === 'yearly';
                    const unitCost = lic.costPerLicense || 0;
                    const monthlyEquivalent = isYearly ? (unitCost / 12) : unitCost;
                    const totalCost = (lic.licenseCount || 1) * monthlyEquivalent;
                    
                    return (
                      <tr key={lic._id} className="border-b border-slate-100 hover:bg-white transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{lic.applicationName}</td>
                        <td className="px-5 py-4 font-medium text-slate-600">{lic.vendor}</td>
                        <td className="px-5 py-4 font-medium text-slate-600">{lic.department}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${utilization >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : utilization < 40 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {lic.assignedUsers} / {lic.licenseCount} ({utilization}%)
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-900 font-bold tabular-nums">{currency(totalCost)}</td>
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
