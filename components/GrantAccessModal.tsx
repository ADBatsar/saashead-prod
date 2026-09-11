"use client";

import { useState } from "react";
import { ShieldCheck, X, Plus, ChevronDown, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GrantAccessModalWrapper() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Platform Admin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
        setIsModalOpen(false);
        setPhone("");
        setMessage({ type: "", text: "" });
        router.refresh(); // Refresh server data to update table instantly
      }, 1500);

    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-50 text-xs font-bold shadow-md transition-all flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Grant Admin Access
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-amber-200 rounded-[32px] p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-700 bg-violet-100 border border-violet-200 rounded-full px-3 py-1">
                <ShieldCheck className="w-3 h-3" /> Security Access
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
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
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="py-2.5 bg-transparent text-slate-700 text-xs font-medium focus:outline-none appearance-none cursor-pointer pr-4"
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
                    className="w-full px-4 py-2.5 text-slate-900 bg-transparent focus:outline-none text-sm font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Assign Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium cursor-pointer"
                >
                  <option value="Platform Admin">Platform Admin (Read-Only Metrics)</option>
                  <option value="Platform Owner">Platform Owner (Super Admin)</option>
                </select>
              </div>

              {message.text && (
                <div className={`text-xs font-bold rounded-xl px-4 py-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-slate-900 text-amber-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50"
              >
                {loading ? "Saving to Database..." : "Confirm & Grant Access"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
