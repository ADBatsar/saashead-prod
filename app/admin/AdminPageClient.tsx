"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users, CreditCard, Activity, Download, ShieldCheck, UserCheck, Plus, X, Phone, ChevronDown, Eye } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminPageClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  
  // Modal states
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [activeModalData, setActiveModalData] = useState<{ title: string; type: 'companies' | 'users' | 'licenses' | null }>({ title: "", type: null });
  
  // Grant Access Form States
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Platform Admin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const {
    companiesCount,
    usersCount,
    activePlansCount,
    formattedSpend,
    adminUsers,
    allCompanies,
    allUsers,
    allLicenses
  } = initialData;

  async function handleGrantAccess(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const fullPhoneNumber = `${countryCode}${phone.trim()}`;
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhoneNumber, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: "success", text: "Role successfully updated!" });
      setTimeout(() => {
        setIsGrantModalOpen(false);
        setPhone("");
        setMessage({ type: "", text: "" });
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FFFBEF] relative overflow-hidden">
      
      {/* Decor */}
      <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-amber-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-violet-400/15 blur-[120px] rounded-full pointer-events-none" />

      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-amber-200/60 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-[10px] uppercase font-bold tracking-widest text-violet-700 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                Live Platform Data
              </div>
              <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
                HeadSaaS Control Center
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Click any metric card below to inspect underlying records and vendor structures.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-700 font-bold text-sm hover:bg-amber-50 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
          </header>

          {/* INTERACTIVE METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => setActiveModalData({ title: "Registered Companies", type: "companies" })}>
              <MetricCard title="Total Companies" value={companiesCount} icon={Building2} color="text-violet-600" bg="bg-violet-100" clickable={true} />
            </div>
            <div onClick={() => setActiveModalData({ title: "Platform Users Directory", type: "users" })}>
              <MetricCard title="Platform Users" value={usersCount} icon={Users} color="text-blue-600" bg="bg-blue-100" clickable={true} />
            </div>
            <div onClick={() => setActiveModalData({ title: "Managed Applications & Vendors", type: "licenses" })}>
              <MetricCard title="Managed Applications" value={activePlansCount} icon={Activity} color="text-amber-600" bg="bg-amber-100" clickable={true} />
            </div>
            <div onClick={() => setActiveModalData({ title: "Active Vendor Spend Breakdown", type: "licenses" })}>
              <MetricCard title="Managed SaaS Spend" value={formattedSpend} icon={CreditCard} color="text-emerald-600" bg="bg-emerald-100" highlight={true} clickable={true} />
            </div>
          </div>

          {/* ACCESS MANAGEMENT TABLE */}
          <div className="mt-12 bg-white/80 backdrop-blur-xl border border-amber-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-amber-200/60 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-violet-600" /> Authorized Personnel
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage team members who have backend control access.</p>
              </div>
              <button 
                onClick={() => setIsGrantModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-50 text-xs font-bold shadow-md transition-all flex items-center gap-2 w-fit"
              >
                <Plus className="w-4 h-4" /> Grant Admin Access
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-amber-200/60 bg-amber-50/30">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Name / Email</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobile Number</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Global Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60">
                  {adminUsers.map((admin: any) => (
                    <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{admin.name || "Unnamed Admin"}</div>
                        <div className="text-xs text-slate-500">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 font-medium tabular-nums">{admin.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold border ${
                          admin.role === 'Platform Owner' ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          <UserCheck className="w-3.5 h-3.5" />
                          {admin.role}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* DYNAMIC RECORD INSPECTION POPUP MODAL */}
      {activeModalData.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-amber-200 rounded-[32px] p-8 w-full max-w-3xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{activeModalData.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Live inspection view extracted from database clusters.</p>
              </div>
              <button onClick={() => setActiveModalData({ title: "", type: null })} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {activeModalData.type === 'companies' && allCompanies.map((comp: any) => (
                <div key={comp._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{comp.name || comp.companyName}</h4>
                    <p className="text-xs text-slate-500">Domain: {comp.domain || "N/A"} • Size: {comp.companySize || "N/A"}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-violet-100 text-violet-700 rounded-lg">Workspace</span>
                </div>
              ))}

              {activeModalData.type === 'users' && allUsers.map((usr: any) => (
                <div key={usr._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{usr.name || "Unnamed"}</h4>
                    <p className="text-xs text-slate-500">{usr.email || "No email"} • {usr.phone}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">{usr.role}</span>
                </div>
              ))}

              {activeModalData.type === 'licenses' && allLicenses.map((lic: any) => (
                <div key={lic._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{lic.appName || "Unknown App"}</h4>
                    <p className="text-xs text-slate-500">Allocated Licenses: {lic.licenseCount} • Cost per License: ${lic.costPerLicense}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg">${lic.licenseCount * lic.costPerLicense}/mo</span>
                </div>
              ))}
              
              {/* Empty state fallbacks */}
              {activeModalData.type === 'companies' && allCompanies.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No companies found.</p>}
              {activeModalData.type === 'users' && allUsers.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No users found.</p>}
              {activeModalData.type === 'licenses' && allLicenses.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No licenses found.</p>}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setActiveModalData({ title: "", type: null })} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRANT ACCESS MODAL */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-amber-200 rounded-[32px] p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-700 bg-violet-100 border border-violet-200 rounded-full px-3 py-1">
                <ShieldCheck className="w-3 h-3" /> Security Access
              </div>
              <button onClick={() => setIsGrantModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Promote User</h2>
            <p className="text-xs text-slate-500 mb-6">Target user must already be registered on HeadSaaS.</p>

            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Mobile Number</label>
                <div className="mt-1.5 relative flex shadow-sm rounded-xl border border-slate-300 bg-transparent overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 transition-all">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                     <Phone className="w-4 h-4" />
                  </div>
                  
                  <div className="relative flex items-center border-r border-slate-300 bg-slate-50 pl-10 pr-2">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="py-2.5 bg-transparent text-slate-700 text-xs font-medium focus:outline-none appearance-none cursor-pointer pr-4">
                      <option value="+91">IN (+91)</option>
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+61">AU (+61)</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                  </div>

                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="98765 43210" className="w-full px-4 py-2.5 text-slate-900 bg-transparent focus:outline-none text-sm font-medium placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Assign Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium cursor-pointer">
                  <option value="Platform Admin">Platform Admin (Read-Only Metrics)</option>
                  <option value="Platform Owner">Platform Owner (Super Admin)</option>
                </select>
              </div>

              {message.text && (
                <div className={`text-xs font-bold rounded-xl px-4 py-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full mt-2 bg-slate-900 text-amber-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50">
                {loading ? "Saving..." : "Confirm & Grant Access"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg, highlight = false, clickable = false }: any) {
  return (
    <div className={`relative group overflow-hidden rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1 ${clickable ? 'cursor-pointer' : ''} ${
      highlight ? 'bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200 shadow-md hover:shadow-lg' : 'bg-white/80 backdrop-blur-md border border-amber-200/60 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          {clickable && (
            <span className="text-[10px] font-bold tracking-wider text-slate-400 group-hover:text-violet-600 transition flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg border border-slate-200/60 shadow-sm">
              <Eye className="w-3 h-3" /> Inspect
            </span>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 text-[11px] font-bold tracking-widest uppercase mb-1.5">{title}</h3>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
