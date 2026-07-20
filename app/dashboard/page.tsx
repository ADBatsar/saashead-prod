"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/workspace/Layout";
import KpiCard from "@/components/workspace/KpiCard";
import SectionCard from "@/components/workspace/SectionCard";
import StatusChip from "@/components/workspace/StatusChip";
import VendorBadge from "@/components/workspace/VendorBadge";
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
    <div className="bg-[#0E1320] border border-slate-700 rounded-xl shadow-2xl px-3 py-2 text-xs">
      {label && <div className="text-slate-400 mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-white font-medium">{prefix}{Number(p.value).toLocaleString()}</div>
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
        .then((json) => setData(json))
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
      {/* KPI Row (Reverted to 4 columns, showing Potential Savings directly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard testId="kpi-total-apps" label="Total SaaS Apps" value={k.total_apps} accent="blue" icon={Package} delta="12%" />
        <KpiCard testId="kpi-monthly-spend" label="Monthly Spend" value={currency(k.monthly_spend)} accent="violet" icon={DollarSign} delta="8%" />
        <KpiCard testId="kpi-annual-spend" label="Annual Spend" value={currency(k.annual_spend)} accent="emerald" icon={TrendingUp} delta="10%" />
        <KpiCard testId="kpi-potential-savings" label="Potential Savings" value={currency(potentialSavings)} accent="amber" icon={PiggyBank} delta="15%" />
      </div>

      {/* Row 2: Spend trend + Top vendors + Renewal risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <SectionCard testId="spend-trend-card" title="SaaS Spend Trend" className="lg:col-span-2"
          action={<span className="text-[10px] uppercase tracking-wider text-slate-500">6 months</span>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.spend_trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip prefix="$" />} />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="url(#spendG)" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard testId="renewal-risk-card" title="Renewal Risk">
          <div className="flex items-center justify-center h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={renewalPie} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                  {renewalPie.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="font-display text-2xl font-light text-white">{data.renewal_risk.total}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Contracts</div>
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            <RiskRow color="#f43f5e" label="Critical (0–30d)" value={data.renewal_risk.critical} />
            <RiskRow color="#f59e0b" label="Warning (31–90d)" value={data.renewal_risk.warning} />
            <RiskRow color="#10b981" label="Safe (>90d)" value={data.renewal_risk.safe} />
          </div>
        </SectionCard>
      </div>

      {/* Row 3: Top Vendors + AI Insights + Unused Licenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <SectionCard testId="top-vendors-card" title="Top Vendors by Spend">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_vendors} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="vendor" stroke="#cbd5e1" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<ChartTooltip prefix="$" />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                <Bar dataKey="spend" radius={[0, 6, 6, 0]}>
                  {data.top_vendors.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard testId="ai-insights-card" title={<span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400" /> AI Insights</span>}
          className="bg-gradient-to-br from-blue-600/10 via-violet-600/5 to-transparent border-blue-500/20">
          <div className="space-y-3">
            {data.ai_insights.map((it: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span>{it}</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/ai-copilot")} data-testid="open-copilot-btn" className="mt-5 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Open AI Copilot <ArrowRight className="w-3 h-3" />
          </button>
        </SectionCard>

        <SectionCard testId="unused-licenses-card" title="Top Unused Licenses">
          <div className="space-y-3">
            {data.unused_licenses.slice(0, 4).map((u: any) => (
              <div key={u.name} className="flex items-center gap-3">
                <VendorBadge name={u.vendor} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{u.name}</div>
                  <div className="text-[11px] text-slate-500">{u.assigned} assigned · {u.inactive} inactive</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-amber-500 font-medium">{currency(u.savings)}</div>
                  <div className="text-[10px] text-slate-500">/month waste</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/cost-optimization")} className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1" data-testid="view-cost-opt-btn">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </SectionCard>
      </div>

      {/* Upcoming Renewals Table */}
      <SectionCard testId="upcoming-renewals-card" title="Upcoming Renewals" className="mt-5"
        action={<button onClick={() => router.push("/renewals")} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1" data-testid="view-renewals-btn">View all <ArrowRight className="w-3 h-3" /></button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/80">
                <th className="text-left py-3 font-medium">Application</th>
                <th className="text-left py-3 font-medium">Vendor</th>
                <th className="text-left py-3 font-medium">Renewal</th>
                <th className="text-left py-3 font-medium">Amount</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-left py-3 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {data.upcoming_renewals.map((r: any) => (
                <tr key={r.id} className="border-b border-slate-800/40 hover:bg-white/[0.02] transition">
                  <td className="py-3 flex items-center gap-3"><VendorBadge name={r.vendor} size={30} /><span className="text-white">{r.name}</span></td>
                  <td className="py-3 text-slate-400">{r.vendor}</td>
                  <td className="py-3 text-slate-300">{formatDate(r.renewal_date)} <span className="text-slate-500 text-xs">({r.days}d)</span></td>
                  <td className="py-3 text-white tabular-nums">{currency(r.amount)}</td>
                  <td className="py-3"><StatusChip status={r.status}>{r.status}</StatusChip></td>
                  <td className="py-3 text-slate-400">{r.owner}</td>
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
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} /><span className="text-slate-400">{label}</span></div>
      <span className="text-white tabular-nums font-medium">{value}</span>
    </div>
  );
}
