"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/workspace/Layout";
import KpiCard from "@/components/workspace/KpiCard";
import SectionCard from "@/components/workspace/SectionCard";
import StatusChip from "@/components/workspace/StatusChip";
import { currency, formatDate } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import { Package, DollarSign, TrendingUp, PiggyBank, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#64748b", "#06b6d4", "#a855f7"];

function ChartTooltip({ active, payload, label, prefix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      {label && <div className="text-slate-500 font-medium mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-slate-900 font-bold">{prefix}{Number(p.value).toLocaleString()}</div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
  fetch("/api/dashboard")
        .then((r) => r.json())
        .then((json) => {
            if (json.top_vendors) {
                json.top_vendors = json.top_vendors.map((v: any) => ({ ...v, vendor: v.vendorName || v.vendor || "Unknown Vendor" }));
            }
            if (json.unused_licenses) {
                json.unused_licenses = json.unused_licenses.map((u: any) => ({ ...u, vendor: u.vendorName || u.vendor || "Unknown Vendor" }));
            }
            setData(json);
        })
        .catch(console.error);
  }, []);

  if (!data || !data.success) {
    return <Layout title="Overview" subtitle="Executive snapshot of your SaaS estate"><div className="text-slate-500 text-sm animate-pulse">Loading dashboard...</div></Layout>;
  }

  const k = data.kpis;
  const potentialSavings = Number(k.potential_savings || 0);

  const renewalPie = [
    { name: "Critical", value: data.renewal_risk.critical, color: "#f43f5e" },
    { name: "Warning", value: data.renewal_risk.warning, color: "#f59e0b" },
    { name: "Safe", value: data.renewal_risk.safe, color: "#10b981" },
  ];

  return (
    <Layout title="Overview" subtitle="Executive snapshot of your SaaS estate">
      {/* KPI Row - Deltas set to 0% initially */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard testId="kpi-total-apps" label="Total SaaS Apps" value={k.total_apps} accent="blue" icon={Package} delta="0%" />
        <KpiCard testId="kpi-monthly-spend" label="Monthly Spend" value={currency(k.monthly_spend)} accent="violet" icon={DollarSign} delta="0%" />
        <KpiCard testId="kpi-annual-spend" label="Annual Spend" value={currency(k.annual_spend)} accent="emerald" icon={TrendingUp} delta="0%" />
        <KpiCard testId="kpi-potential-savings" label="Potential Savings" value={currency(potentialSavings)} accent="amber" icon={PiggyBank} delta="0%" />
      </div>

      {/* Row 2: Spend trend + Top vendors + Renewal risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <SectionCard testId="spend-trend-card" title="SaaS Spend Trend" className="lg:col-span-2 bg-[#FFFCF5] border border-amber-200/60 shadow-sm"
          action={<span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">6 months</span>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.spend_trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip prefix="$" />} />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="url(#spendG)" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard testId="renewal-risk-card" title="Renewal Risk" className="bg-[#FFFCF5] border border-amber-200/60 shadow-sm">
          <div className="flex items-center justify-center h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={renewalPie} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {renewalPie.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* THE FIX: Dark text (text-slate-900) for the center number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="font-display text-3xl font-bold text-slate-900">{data.renewal_risk.total}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contracts</div>
            </div>

          </div>
          <div className="mt-2 space-y-2">
            <RiskRow color="#f43f5e" label="Critical (0–30d)" value={data.renewal_risk.critical} />
            <RiskRow color="#f59e0b" label="Warning (31–90d)" value={data.renewal_risk.warning} />
            <RiskRow color="#10b981" label="Safe (>90d)" value={data.renewal_risk.safe} />
          </div>
        </SectionCard>
      </div>

      {/* Row 3: Top Vendors + AI Insights + Unused Licenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <SectionCard testId="top-vendors-card" title="Top Vendors by Spend" className="bg-[#FFFCF5] border border-amber-200/60 shadow-sm">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_vendors} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="vendor" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<ChartTooltip prefix="$" />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="spend" radius={[0, 6, 6, 0]}>
                  {data.top_vendors.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard testId="ai-insights-card" title={<span className="flex items-center gap-2 font-bold text-slate-900"><Sparkles className="w-4 h-4 text-blue-600" /> AI Insights</span>}
          className="bg-gradient-to-br from-blue-50 via-white to-transparent border border-blue-100 shadow-sm">
          <div className="space-y-4">
            {data.ai_insights.map((it: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span>{it}</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/ai-copilot")} data-testid="open-copilot-btn" className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
            Open AI Copilot <ArrowRight className="w-3 h-3" />
          </button>
        </SectionCard>

        <SectionCard testId="unused-licenses-card" title="Top Unused Licenses" className="bg-[#FFFCF5] border border-amber-200/60 shadow-sm">
          <div className="space-y-4">
            {/* ICONS REMOVED HERE */}
            {data.unused_licenses.slice(0, 4).map((u: any) => (
              <div key={u.name} className="flex items-center justify-between p-2 hover:bg-white rounded-xl transition">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{u.name}</div>
                  <div className="text-[11px] font-medium text-slate-500">
                    {u.vendor} &middot; {u.assigned} assigned &middot; {u.inactive} inactive
                  </div>
                </div>
                <div className="text-right pl-3">
                  <div className="text-sm text-amber-600 font-bold">{currency(u.savings)}</div>
                  <div className="text-[10px] font-medium text-slate-400">/mo waste</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/cost-optimization")} className="mt-5 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition" data-testid="view-cost-opt-btn">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </SectionCard>
      </div>

      <SectionCard testId="upcoming-renewals-card" title="Upcoming Renewals" className="mt-5 bg-[#FFFCF5] border border-amber-200/60 shadow-sm"
        action={<button onClick={() => router.push("/renewals")} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition" data-testid="view-renewals-btn">View all <ArrowRight className="w-3 h-3" /></button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="text-left py-3">Application</th>
                <th className="text-left py-3">Vendor</th>
                <th className="text-left py-3">Renewal</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {/* ICONS REMOVED HERE TOO */}
              {data.upcoming_renewals.map((r: any) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-white transition">
                  <td className="py-3 font-bold text-slate-900">{r.name}</td>
                  <td className="py-3 font-medium text-slate-600">{r.vendor}</td>
                  <td className="py-3 font-medium text-slate-600">{formatDate(r.renewal_date)} <span className="text-slate-400 text-xs ml-1">({r.days}d)</span></td>
                  <td className="py-3 text-slate-900 font-bold tabular-nums">{currency(r.amount)}</td>
                  <td className="py-3"><StatusChip status={r.status}>{r.status}</StatusChip></td>
                  <td className="py-3 font-medium text-slate-500">{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </Layout>
  );
}

function RiskRow({ color, label, value }: { color: string, label: string, value: number }) {
  return (
    <div className="flex items-center justify-between text-xs px-1">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ background: color }} />
        <span className="font-medium text-slate-600">{label}</span>
      </div>
      <span className="text-slate-900 tabular-nums font-bold">{value}</span>
    </div>
  );
}
