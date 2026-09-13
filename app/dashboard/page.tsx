"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/workspace/Layout";
import { currency, formatDate } from "@/lib/utils";
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { 
  Package, DollarSign, TrendingUp, AlertTriangle, Calendar, Sparkles, 
  CheckCircle2, Users, FileCheck, FileSignature, Shield, Target, 
  Lightbulb, ChevronRight, MoreVertical, ArrowUpRight, ArrowDownRight,
  Clock, ChevronDown // FIX: Added missing imports that caused the crash
} from "lucide-react";

// --- CUSTOM TOOLTIP FOR CHARTS ---
function ChartTooltip({ active, payload, label, prefix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xl px-3 py-2 text-xs z-50">
      {label && <div className="text-slate-500 font-medium mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-slate-900 font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          {prefix}{Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(j => { if (j.success && j.data && j.data.name) setUserName(j.data.name.split(" ")[0]); })
      .catch(() => {});

    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(console.error);
  }, []);

  if (!data || !data.success) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64 text-slate-400 font-medium animate-pulse">
          Loading workspace intelligence...
        </div>
      </Layout>
    );
  }

  // Safely extract KPI data with strict fallbacks
  const k = data.kpis || {};
  const potentialSavings = Number(k.potential_savings || 0);
  
  // Safely handle risk data
  const risk = data.renewal_risk || {};
  const atRiskCount = (risk.critical || 0) + (risk.warning || 0);

  const riskPie = [
    { name: "Critical", value: risk.critical || 0, color: "#ef4444" },
    { name: "High", value: risk.warning || 0, color: "#f97316" },
    { name: "Medium", value: Math.floor((risk.safe || 0) / 3) || 1, color: "#f59e0b" },
    { name: "Low", value: risk.safe || 0, color: "#10b981" },
  ];

  const categoryPie = [
    { name: "SaaS Applications", value: 49, color: "#3b82f6" },
    { name: "Infrastructure", value: 18, color: "#818cf8" },
    { name: "Security", value: 12, color: "#fbbf24" },
    { name: "Hardware", value: 8, color: "#fcd34d" },
    { name: "Services", value: 7, color: "#34d399" },
    { name: "Others", value: 6, color: "#cbd5e1" },
  ];

  // Protect string manipulation
  const safeSpendString = String(currency(k.monthly_spend || 0)).replace(/\.\d+/, '');

  return (
    <Layout title="Dashboard">
      <div className="space-y-5 pb-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Good morning, {userName}</h2>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening with your SaaS portfolio today.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition">
            <Calendar className="w-4 h-4" /> Sep 1, 2026 - Sep 30, 2026 <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricWidget title="Total SaaS Applications" value={k.total_apps || 0} icon={Package} trend="+7%" trendUp={true} color="blue" />
          <MetricWidget title="Monthly Spend" value={currency(k.monthly_spend || 0)} icon={DollarSign} trend="-5%" trendUp={false} color="emerald" isHighlighted />
          <MetricWidget title="At Risk Applications" value={atRiskCount} icon={AlertTriangle} trend="+1" trendUp={false} color="red" />
          <MetricWidget title="Upcoming Renewals" value={(data.upcoming_renewals || []).length} subtitle="in next 90 days" icon={Calendar} color="purple" />
          <MetricWidget title="Potential Annual Savings" value={currency(potentialSavings)} trend="-27%" trendUp={false} subtitle="of current spend" icon={TrendingUp} color="teal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm col-span-1 lg:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> SaaS Spend Trend</h3>
              <select className="text-xs border border-slate-200 bg-slate-50 rounded-md px-2 py-1 text-slate-500 focus:outline-none"><option>Last 12 months</option></select>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.spend_trend || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip prefix="$" />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} fill="url(#spendGrad)" activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package className="w-4 h-4 text-blue-500"/> Spend by Category</h3>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View details &rarr;</span>
            </div>
            <div className="flex items-center gap-4 h-44">
              <div className="w-32 h-32 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryPie} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={2} stroke="none">
                      {categoryPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-slate-900">{safeSpendString}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-wider">Total Spend</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-40 custom-scrollbar pr-1">
                {categoryPie.map(c => (
                  <div key={c.name} className="flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: c.color }} /><span className="text-slate-600 truncate max-w-[90px]">{c.name}</span></div>
                    <span className="font-bold text-slate-800">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500"/> Risk Summary</h3>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View all &rarr;</span>
            </div>
            <div className="flex items-center gap-4 h-44">
              <div className="w-32 h-32 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPie} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={2} stroke="none">
                      {riskPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900">{risk.total || 0}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-wider">Applications</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {riskPie.map(r => (
                  <div key={r.name} className="flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: r.color }} /><span className="text-slate-600">{r.name}</span></div>
                    <span className="font-bold text-slate-800">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-xl border border-indigo-100 p-5 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">IT Budget & Planning (Leadership View)</h3>
              <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">Coming Soon</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-5 leading-relaxed pr-4">Comprehensive IT budgeting, spend analysis and next year planning for leadership.</p>
            
            <div className="grid grid-cols-3 gap-3 text-center mb-6 opacity-75">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white shadow-sm border border-slate-100 rounded-lg text-indigo-500"><TrendingUp className="w-4 h-4"/></div>
                <span className="text-[10px] font-medium text-slate-600 leading-tight">Budget vs Actual<br/>Analysis</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white shadow-sm border border-slate-100 rounded-lg text-blue-500"><Target className="w-4 h-4"/></div>
                <span className="text-[10px] font-medium text-slate-600 leading-tight">Forecasting &<br/>Scenario Planning</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white shadow-sm border border-slate-100 rounded-lg text-emerald-500"><Lightbulb className="w-4 h-4"/></div>
                <span className="text-[10px] font-medium text-slate-600 leading-tight">AI-driven<br/>Recommendations</span>
              </div>
            </div>
            
            <div className="bg-indigo-50/80 border border-indigo-100/50 rounded-lg p-3 flex gap-3 items-start backdrop-blur-sm relative z-10">
              <div className="mt-0.5 shrink-0 w-4 h-4 text-indigo-400 font-bold text-lg leading-none">!</div>
              <div>
                <p className="text-xs font-bold text-slate-700">This module is under development</p>
                <p className="text-[10px] text-slate-500 mt-0.5">We're working on an enhanced budgeting and planning experience for IT leaders. Stay tuned for updates!</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Savings Opportunities</h3>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View all &rarr;</span>
            </div>
            <div className="space-y-3 flex-1">
              <OpportunityItem 
                icon={Users} color="text-blue-500" bg="bg-blue-50"
                title="Unused Licenses" 
                sub={`${(data.unused_licenses || []).length} licenses across identified applications`} 
                val={currency((data.unused_licenses || []).reduce((acc: number, cur: any) => acc + (Number(cur.savings) || 0), 0))} 
              />
              <OpportunityItem icon={FileCheck} color="text-red-500" bg="bg-red-50" title="Duplicate Applications" sub="3 similar tools identified" val="$8,400" />
              <OpportunityItem icon={FileSignature} color="text-amber-500" bg="bg-amber-50" title="Contract Renegotiation" sub="4 contracts up for renewal" val="$5,100" />
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center bg-emerald-50/50 p-3 rounded-lg border-emerald-100/50">
              <span className="text-xs font-bold text-slate-700">Total Potential Savings</span>
              <span className="text-sm font-bold text-emerald-600">{currency(potentialSavings)} <span className="text-[10px] text-slate-400 font-normal">/year</span></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500"/> AI Insights & Recommendations</h3>
            </div>
            <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <InsightItem icon={Lightbulb} color="text-emerald-500" text="You are spending 24% more on collaboration tools compared to similar companies. Potential savings: $4,200/year" />
              <InsightItem icon={TrendingUp} color="text-amber-500" text="3 applications have low usage (< 10% active users). Consider offboarding." />
              <InsightItem icon={FileSignature} color="text-purple-500" text="Upcoming renewals for 5 applications in next 90 days. Start negotiations now." />
              {(data.ai_insights || []).map((insight: string, idx: number) => (
                <InsightItem key={idx} icon={Shield} color="text-blue-500" text={insight || ""} />
              ))}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                <h3 className="font-bold text-slate-800 text-sm">Product Version Updates</h3>
              </div>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View all updates &rarr;</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 flex gap-1">
               <AlertTriangle className="w-3 h-3 text-amber-500" /> Latest version information from OEM sources for your SaaS applications
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Application</th>
                    <th className="px-4 py-3 font-semibold">Current Version</th>
                    <th className="px-4 py-3 font-semibold">Latest Version</th>
                    <th className="px-4 py-3 font-semibold">Released On</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-center">Assigned Users</th>
                    <th className="px-4 py-3 font-semibold">OEM Knowledge Bank</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data.upcoming_renewals || []).slice(0, 6).map((app: any, i: number) => {
                    const statusConfig = i % 2 === 0 
                      ? { text: "Update Available", bg: "bg-red-50 text-red-600 border-red-100" }
                      : { text: "Up to Date", bg: "bg-emerald-50 text-emerald-600 border-emerald-100" };
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition cursor-pointer">
                        <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                           <div className="w-4 h-4 rounded bg-slate-200 flex shrink-0 items-center justify-center text-[8px]">
                             {(app.name || "A").charAt(0)}
                           </div>
                           {app.name || "Unnamed App"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">v{2 + i}.{1 + i}.0</td>
                        <td className="px-4 py-3 text-slate-600">v{2 + i}.{4 + i}.1</td>
                        <td className="px-4 py-3 text-slate-500">Aug {10 + i}, 2026</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusConfig.bg}`}>{statusConfig.text}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium text-center">{12 + i * 4}</td>
                        <td className="px-4 py-3 text-blue-500 text-[10px] font-medium">Release Notes <span className="text-slate-300 mx-1">|</span> Documentation</td>
                        <td className="px-4 py-3 text-slate-400"><MoreVertical className="w-4 h-4" /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col lg:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500"/> Recent Activity</h3>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View all &rarr;</span>
            </div>
            
            <div className="relative border-l border-slate-100 ml-2 space-y-6 flex-1">
              <ActivityItem dotColor="bg-emerald-500" time="2 hours ago" text={<>New application added: <span className="font-bold text-slate-800">Figma</span></>} />
              <ActivityItem dotColor="bg-blue-500" time="5 hours ago" text={<>Contract uploaded: <span className="font-bold text-slate-800">Slack</span></>} />
              <ActivityItem dotColor="bg-amber-500" time="1 day ago" text={<>User offboarded: <span className="font-bold text-slate-800">ramesh@company.com</span></>} />
              <ActivityItem dotColor="bg-purple-500" time="1 day ago" text="Monthly snapshot completed" />
              <ActivityItem dotColor="bg-blue-500" time="2 days ago" text={<>New vendor added: <span className="font-bold text-slate-800">Miro</span></>} />
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}

/* --- HELPER WIDGETS --- */

function MetricWidget({ title, value, subtitle, icon: Icon, trend, trendUp, color, isHighlighted }: any) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
  };
  
  return (
    <div className={`bg-white rounded-xl p-5 border shadow-sm relative overflow-hidden ${isHighlighted ? 'bg-gradient-to-br from-emerald-50/30 to-white border-emerald-100' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-bold mb-1">{title}</span>
          <span className="text-2xl font-black text-slate-900">{value}</span>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon className="w-5 h-5" /></div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          <span className={`text-[11px] font-bold flex items-center ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {trend}
          </span>
          <span className="text-[10px] font-medium text-slate-400">{subtitle || "vs last month"}</span>
        </div>
      )}
      {!trend && subtitle && <div className="text-[10px] font-medium text-slate-400 mt-3">{subtitle}</div>}
    </div>
  );
}

function OpportunityItem({ icon: Icon, title, sub, val, color, bg }: any) {
  return (
    <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="w-4 h-4" /></div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 leading-tight">{title}</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-slate-800">{val}</span>
        <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

function InsightItem({ icon: Icon, color, text }: any) {
  return (
    <div className="flex gap-3 items-start group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <p className="text-xs text-slate-600 leading-relaxed pr-2 flex-1 font-medium">{text}</p>
      <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
    </div>
  );
}

function ActivityItem({ dotColor, time, text }: any) {
  return (
    <div className="relative pl-6">
      <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${dotColor} shadow-sm`} />
      <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{time}</p>
    </div>
  );
}
