"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Added default country code state
  const [countryCode, setCountryCode] = useState("+91");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "", 
    companyName: "",
    companySize: "1-50",
    role: "IT",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Combine country code with mobile number ONLY if they entered one
      const fullMobile = form.mobileNumber ? `${countryCode}${form.mobileNumber}` : "";

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          mobileNumber: fullMobile, 
          companyName: form.companyName,
          companySize: form.companySize,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to register.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#070A11] flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-violet-900/15 blur-[140px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold">H</span>
          </div>
          <div>
            <div className="text-white font-semibold text-lg">HeadSaaS</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Spend Intelligence</div>
          </div>
        </div>

        <div className="bg-[#111520]/80 border border-slate-800 rounded-3xl p-9 shadow-2xl">
          <h1 className="text-3xl font-light text-white">Create your Workspace</h1>
          <p className="text-sm text-slate-500 mt-2">Start managing your SaaS applications.</p>

          <form onSubmit={submit} className="space-y-4 mt-8">

            {/* NEW COMPOSITE PHONE FIELD WITH COUNTRY DROPDOWN */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500">Mobile Number (Optional)</label>
              <div className="mt-1 flex rounded-xl border border-slate-800 bg-[#070A11] overflow-hidden focus-within:border-blue-500 transition">
                <div className="relative flex items-center border-r border-slate-800 bg-[#111520]">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="pl-4 pr-8 py-3 bg-transparent text-white text-sm focus:outline-none appearance-none cursor-pointer z-10"
                  >
                    <option value="+91" className="bg-slate-900">IN (+91)</option>
                    <option value="+1" className="bg-slate-900">US (+1)</option>
                    <option value="+44" className="bg-slate-900">UK (+44)</option>
                    <option value="+61" className="bg-slate-900">AU (+61)</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 pointer-events-none" />
                </div>
                <input
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="98765 43210"
                  className="w-full px-4 py-3 text-sm text-white bg-transparent outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500">Work Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="pt-2">
              <label className="text-[11px] uppercase tracking-wider text-slate-500">Company Name</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Acme Corp"
                className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500">Company Size</label>
                <div className="relative">
                  <select
                    value={form.companySize}
                    onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                    className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl pl-4 pr-8 py-3 text-sm text-white outline-none focus:border-blue-500 transition appearance-none"
                  >
                    <option value="1-50">1 - 50</option>
                    <option value="51-200">51 - 200</option>
                    <option value="201-500">201 - 500</option>
                    <option value="500+">500+</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-[22px] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500">Your Role</label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl pl-4 pr-8 py-3 text-sm text-white outline-none focus:border-blue-500 transition appearance-none"
                  >
                    <option value="IT">IT / Eng</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive">Executive</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-[22px] pointer-events-none" />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 mt-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition mt-6"
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  Create Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
