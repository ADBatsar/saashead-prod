"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, ShieldAlert, X, Plus, ChevronDown, Phone } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AccessManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // States for composite phone input with country code
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  
  const [role, setRole] = useState("Platform Admin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setAdmins([
      { _id: "1", name: "Anand Bhatkar", phone: "+919762058339", role: "Platform Owner" }
    ]);
  }, []);

  async function handleGrantAccess(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Combine country code and phone number
      const fullPhoneNumber = `${countryCode}${phone.trim()}`;

      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhoneNumber, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMessage({ type: "success", text: "User successfully upgraded!" });
      setAdmins((prev) => [...prev, data.user]);
      
      setTimeout(() => {
        setIsModalOpen(false);
        setPhone("");
        setMessage({ type: "", text: "" });
      }, 2000);

    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FFFBEF] relative overflow-hidden">
      <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-amber-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-violet-400/15 blur-[120px] rounded-full pointer-events-none" />

      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-200/60 pb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">Access Management</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Control who has access to the owner command center.</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-50 text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Grant Admin Access
            </button>
          </header>

          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Strict Security Notice</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Users listed below have access to global platform metrics. Platform Admins cannot delete workspaces or billing, but the Platform Owner can. Ensure mobile numbers are correct before granting access.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-amber-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-amber-200/60 bg-white/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-violet-600" /> Authorized Personnel
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-amber-200/60 bg-amber-50/30">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">User Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobile Number</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Global Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60">
                  {admins.map((admin, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{admin.name || "Unknown User"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 font-medium tabular-nums">{admin.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold border ${
                          admin.role === 'Platform Owner' 
                            ? 'bg-violet-100 text-violet-700 border-violet-200' 
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
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

      {/* GRANT ACCESS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-amber-200 rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-700 bg-violet-100 border border-violet-200 rounded-full px-3 py-1">
                <ShieldCheck className="w-3 h-3" /> Assign Role
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Promote User</h2>
            <p className="text-sm text-slate-500 mb-6">The user must already have registered an account on HeadSaaS.</p>

            <form onSubmit={handleGrantAccess} className="space-y-5">
              
              {/* COMPOSITE PHONE FIELD WITH COUNTRY CODE DROPDOWN */}
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Registered Mobile Number</label>
                <div className="mt-2 relative flex shadow-sm rounded-xl border border-slate-300 bg-transparent overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 transition-all">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                     <Phone className="w-4 h-4" />
                  </div>
                  
                  <div className="relative flex items-center border-r border-slate-300 bg-slate-50 hover:bg-slate-100 transition pl-10 pr-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="py-3 bg-transparent text-slate-700 text-sm font-medium focus:outline-none appearance-none cursor-pointer pr-4"
                    >
                      <option value="+91">IN (+91)</option>
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+61">AU (+61)</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                  </div>

                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full px-4 py-3 text-slate-900 bg-transparent focus:outline-none font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Select Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium appearance-none cursor-pointer"
                >
                  <option value="Platform Admin">Platform Admin (Read-Only Global Metrics)</option>
                  <option value="Platform Owner">Platform Owner (Full Super Admin)</option>
                </select>
              </div>

              {message.text && (
                <div className={`text-sm font-bold rounded-xl px-4 py-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-amber-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50"
              >
                {loading ? "Updating Database..." : "Confirm & Grant Access"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
