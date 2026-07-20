"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Phone } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send reset code.");
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to reset password.");
      
      setSuccess("Password reset successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070A11] flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-rose-900/10 blur-[140px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111520]/80 border border-slate-800 rounded-3xl p-9 shadow-2xl">
          <h1 className="text-3xl font-light text-white">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-2">Recover your account using your registered mobile number.</p>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4 mt-8">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500">Registered Mobile Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#070A11] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">{error}</div>}

              <button disabled={loading} className="w-full bg-slate-200 hover:bg-white text-slate-900 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition mt-6">
                {loading ? "Sending..." : "Send Reset Code"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-8 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500">Reset Code (OTP)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full mt-1 bg-[#070A11] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white tracking-widest outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500">New Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#070A11] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">{error}</div>}
              {success && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">{success}</div>}

              <button disabled={loading} className="w-full bg-slate-200 hover:bg-white text-slate-900 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition mt-6">
                {loading ? "Resetting..." : "Set New Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Remembered your password? <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
