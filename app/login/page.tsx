"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, KeyRound, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // Multi-step state for Two-Factor Authentication
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Stored for Step 2
  const [maskedPhone, setMaskedPhone] = useState("");
  const [internalPhone, setInternalPhone] = useState("");

  // Step 1: Verify Credentials and Send OTP
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setMaskedPhone(data.maskedPhone);
      setInternalPhone(data.phone);
      setStep(2); // Move to OTP input
    } catch (err: any) {
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP and Route User
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: internalPhone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      if (data.role) localStorage.setItem("role", data.role);

      // STRICT RBAC ROUTING: Matches the exact strings in our User.ts schema
      if (data.role && data.role.startsWith("Platform")) {
        router.push("/admin/platform-portal");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBEF] flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Decorative Blobs */}
      <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-amber-300/30 blur-[120px] rounded-full" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-violet-400/25 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2.5 mb-8 w-fit">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center">
            <span className="font-bold text-[#FFFBEF] text-xl">H</span>
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-lg">HeadSaaS</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">For IT Leaders</div>
          </div>
        </Link>

        <div className="bg-transparent border border-amber-200 rounded-3xl p-9 shadow-2xl backdrop-blur-md">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-700 bg-violet-100 border border-violet-200 rounded-full px-3 py-1 mb-5">
            <ShieldCheck className="w-3 h-3" /> Always Free · Bank-grade Security
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-700 mt-2">Sign in to manage your SaaS stack.</p>

          <div className="mt-8">
            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <Field icon={Mail} label="Work Email" type="email" value={email} setValue={setEmail} />
                <Field icon={KeyRound} label="Password" type="password" value={password} setValue={setPassword} />

                {error && (
                  <div className="text-sm bg-red-100 text-red-700 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-slate-900 text-amber-200 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black transition"
                >
                  {loading ? "Authenticating..." : <>Login & Send OTP <ArrowRight size={18} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <Field 
                  icon={ShieldCheck} 
                  label="Enter 6-Digit OTP" 
                  type="text" 
                  value={otp} 
                  setValue={setOtp} 
                  placeholder="123456"
                  maxLength={6}
                />
                
                <p className="text-xs text-slate-500 mt-2">
                  Code sent to {maskedPhone}.{" "}
                  <button type="button" onClick={() => setStep(1)} className="text-violet-600 hover:underline">
                    Change details
                  </button>
                </p>

                {error && (
                  <div className="text-sm bg-red-100 text-red-700 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-slate-900 text-amber-200 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black transition"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
            <Link href="/forgot-password" className="hover:text-slate-900 transition">Forgot Password?</Link>
            <Link href="/register" className="text-violet-600 hover:text-violet-800 transition">Create Workspace</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Field Component
function Field({ icon: Icon, label, value, setValue, type = "text", placeholder, maxLength }: any) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-slate-500">{label}</label>
      <div className="mt-2 relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-transparent text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
