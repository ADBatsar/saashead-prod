"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Users, CreditCard, Activity, Download, ShieldCheck, UserCheck, Plus, X, Phone, ChevronDown, Eye, Network, ChevronLeft, LayoutDashboard } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminPageClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [activeModalData, setActiveModalData] = useState<{ title: string; type: 'companies' | 'users' | 'licenses' | 'vendors' | null }>({ title: "", type: null });
  const [detailedItem, setDetailedItem] = useState<{ type: string, data: any } | null>(null);

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
    allLicenses,
    allVendors
  } = initialData;

  const vendorList = allVendors && allVendors.length > 0 
    ? allVendors 
    : Array.from(new Set(allLicenses.map((l: any) => l.vendorName).filter(Boolean))).map((name) => ({ name, vendorName: name }));

  const handleExportReport = () => {
    let csv = "HEADSAAS GLOBAL PLATFORM REPORT\n\n";
    
    csv += "--- PLATFORM SUMMARY ---\n";
    csv += `Total Registered Companies,${companiesCount}\n`;
    csv += `Total Platform Users,${usersCount}\n`;
    csv += `Total Managed Applications,${activePlansCount}\n`;
    csv += `Global Monitored Spend,${formattedSpend.replace(/,/g, '')}\n\n`;

    csv += "--- MANAGED APPLICATIONS DIRECTORY ---\n";
    csv += "Application Name,Company,Workspace ID,Vendor,Category,Department,Billing Cycle,License Count,Cost Per License,Total Spend\n";
    
    allLicenses.forEach((lic: any) => {
      const totalSpend = ((lic.licenseCount || 0) * (lic.costPerLicense || 0)).toFixed(2);
      csv += `"${lic.applicationName}","${lic.companyName}","${lic.workspaceId}","${lic.vendorName}","${lic.category}","${lic.department}","${lic.billingCycle}",${lic.licenseCount},${lic.costPerLicense},${totalSpend}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HeadSaaS_Global_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const closeInspector = () => {
    setActiveModalData({ title: "", type: null });
    setDetailedItem(null);
  };

  return (
    <div className="flex min-h-screen bg-[#FFFBEF] relative overflow-hidden">
      
      <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-amber-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-violet-400/15 blur-[120px] rounded-full pointer-events-none" />

      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-amber-200/60 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* STRICT ROUTING: Sends admin to their own authenticated workspace dashboard */}
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-amber-200 text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-all shadow-sm text-[10px] uppercase tracking-wider font-bold" 
                  title="Return to your company workspace"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> My Workspace
                </Link>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-[10px] uppercase font-bold tracking-widest text-violet-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                  Live Platform Data
                </div>
              </div>
              <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
                HeadSaaS Control Center
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Click any metric card below to inspect underlying records and vendor structures.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportReport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-700 font-bold text-sm hover:bg-amber-50 hover:text-amber-700 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div onClick={() => setActiveModalData({ title: "Registered Companies", type: "companies" })}>
              <MetricCard title="Companies" value={companiesCount} icon={Building2} color="text-violet-600" bg="bg-violet-100" clickable={true} />
            </div>
            <div onClick={() => setActiveModalData({ title: "Platform Users Directory", type: "users" })}>
              <MetricCard title="Users" value={usersCount} icon={Users} color="text-blue-600" bg="bg-blue-100" clickable={true} />
            </div>
            <div onClick={() => setActiveModalData({ title: "Managed Applications", type: "licenses" })}>
              <MetricCard title="Applications" value={activePlansCount} icon={Activity} color="text-amber-600" bg="bg-amber-100" clickable={true} />
            </div>
            <div onClick={() => setActiveModalData({ title: "Vendor Network", type: "vendors" })}>
              <MetricCard title="Vendors" value={vendorList.length} icon={Network} color="text-rose-600" bg="bg-rose-100" clickable={true} />
            </div>
            <div>
              <MetricCard title="Total SaaS Spend" value={formattedSpend} icon={CreditCard} color="text-emerald-600" bg="bg-emerald-100" highlight={true} />
            </div>
          </div>

          <div className="mt-12 bg-white/80 backdrop-blur-xl border border-amber-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-amber-200/60 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-violet-600" /> Authorized Personnel
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage team members who have backend control access.</p>
              </div>
              <button onClick={() => setIsGrantModalOpen(true)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-50 text-xs font-bold shadow-md transition-all flex items-center gap-2 w-fit">
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
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold border ${admin.role === 'Platform Owner' ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
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
          <div className="bg-[#FFFBEF] border border-amber-200 rounded-[32px] p-8 w-full max-w-3xl shadow-2xl max-h-[85vh] flex flex-col transition-all">
            
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-amber-200/60">
              <div>
                {detailedItem && (
                  <button onClick={() => setDetailedItem(null)} className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition mb-3 bg-violet-100 hover:bg-violet-200 px-3 py-1.5 rounded-lg w-fit">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to List
                  </button>
                )}
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  {detailedItem 
                    ? detailedItem.data.applicationName || detailedItem.data.name || detailedItem.data.workspaceName || detailedItem.data.vendorName || "Record Details"
                    : activeModalData.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {detailedItem ? "Complete granular record data." : "Live inspection view extracted from database clusters."}
                </p>
              </div>
              <button onClick={closeInspector} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              
              {detailedItem ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(detailedItem.data).map(([key, value]) => {
                    if (['_id', '__v', 'assignedTo', 'password', 'vendorId'].includes(key) || value === null || value === undefined) return null;
                    
                    let displayValue = String(value);
                    if (key.toLowerCase().includes('date') || key === 'createdAt' || key === 'updatedAt') {
                      displayValue = new Date(value as string).toLocaleDateString();
                    }
                    if (key.toLowerCase().includes('cost')) {
                      displayValue = `$${Number(value).toFixed(2)}`;
                    }

                    return (
                      <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold text-slate-800 break-words">{displayValue || "N/A"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {activeModalData.type === 'companies' && allCompanies.map((comp: any) => (
                    <div key={comp._id} onClick={() => setDetailedItem({ type: 'company', data: comp })} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm cursor-pointer hover:border-violet-300 hover:shadow-md transition group">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-violet-700 transition">
                          {comp.name || comp.companyName || comp.workspaceName || "Unnamed Company"}
                        </h4>
                        <p className="text-xs text-slate-500">Workspace ID: {comp._id}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-violet-100 text-violet-700 rounded-lg">View Details</span>
                    </div>
                  ))}

                  {activeModalData.type === 'users' && allUsers.map((usr: any) => (
                    <div key={usr._id} onClick={() => setDetailedItem({ type: 'user', data: usr })} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition group">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">{usr.name || "Unnamed"}</h4>
                        <p className="text-xs text-slate-500">{usr.email || "No email"} • {usr.phone}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">View Details</span>
                    </div>
                  ))}

                  {activeModalData.type === 'licenses' && allLicenses.map((lic: any) => (
                    <div key={lic._id} onClick={() => setDetailedItem({ type: 'license', data: lic })} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-300 hover:shadow-md transition group">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">{lic.applicationName}</h4>
                        <p className="text-xs text-slate-500">Company: {lic.companyName} • Vendor: {lic.vendorName}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg shadow-sm group-hover:bg-emerald-200 transition">
                        ${((lic.licenseCount || 0) * (lic.costPerLicense || 0)).toFixed(2)}/mo
                      </span>
                    </div>
                  ))}

                  {activeModalData.type === 'vendors' && vendorList.map((vendor: any, vIdx: number) => {
                    const vendorName = vendor.name || vendor.vendorName || "Unknown Vendor";
                    const associatedApps = allLicenses.filter((lic: any) => lic.vendorId === vendor._id || lic.vendorName === vendorName);

                    return (
                      <div key={vIdx} className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h4 className="font-bold text-slate-900 text-lg">{vendorName}</h4>
                          <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-amber-100 text-amber-700 rounded-lg cursor-pointer hover:bg-amber-200" onClick={() => setDetailedItem({ type: 'vendor', data: vendor })}>View Vendor Data</span>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Associated Accounts & Applications</h5>
                          {associatedApps.length > 0 ? (
                            <div className="space-y-2">
                              {associatedApps.map((app: any, aIdx: number) => (
                                <div key={aIdx} onClick={() => setDetailedItem({ type: 'license', data: app })} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 hover:bg-white hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all group">
                                  <div>
                                    <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition">{app.applicationName}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs text-slate-500 block mb-0.5">Licenses: {app.licenseCount}</span>
                                    <span className="text-xs font-bold text-emerald-600 block">${(app.costPerLicense || 0).toFixed(2)}/each</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No specific applications tracked under this vendor yet.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200/60 flex justify-end">
              <button onClick={closeInspector} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition">
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
                {loading ? "Saving to Database..." : "Confirm & Grant Access"}
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
