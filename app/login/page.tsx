"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Phone, ShieldCheck, ChevronDown, LayoutDashboard, Settings } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';

// Fun error messages for unauthorized/failed attempts
const CHEEKY_ERRORS = [
  "Nice try, hacker! That OTP is incorrect. 🛑",
  "The bouncer says no. Wrong code! 🙅‍♂️",
  "Access Denied. Are you guessing? 🕵️‍♂️",
  "Whoops! That code didn't work. Try again. 🚫",
];

export default function LoginPage() {
  const router = useRouter();
  
  // 1 = Phone, 2 = OTP, 3 = Admin Crossroads
  const [step, setStep] = useState(1); 
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCount, setErrorCount] = useState(0); 
  const [isShaking, setIsShaking] = useState(false); 
  
  const [maskedPhone, setMaskedPhone] = useState("");
  const [internalPhone, setInternalPhone] = useState("");

  // Trigger the funny shake animation
  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!turnstileToken) {
      triggerError("Please wait for the security check to complete.");
      setLoading(false);
      return;
    }

    try {
      const fullPhoneNumber = `${countryCode}${phone.trim()}`;

      const response = await fetch("/api/auth/login/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhoneNumber, turnstileToken }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed");

      setMaskedPhone(data.maskedPhone);
      setInternalPhone(data.phone);
      setStep(2); 
    } catch (err: any) {
      triggerError(err.message || "Unable to login.");
      setTurnstileToken(""); 
    } finally {
      setLoading(false);
    }
  }

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
        const funnyMessage = CHEEKY_ERRORS[errorCount % CHEEKY_ERRORS.length];
        setErrorCount(prev => prev + 1);
        throw new Error(funnyMessage);
      }

      if (data.role) localStorage.setItem("role", data.role);

      // STRICT RBAC ROUTING (The "Bouncer")
      const isAdmin = internalPhone === "+919762058339" || data.role === "Platform Owner" || data.role === "Platform Admin";
      
      if (isAdmin) {
        setStep(3); // Show the Crossroads UI
      } else {
        router.push("/dashboard"); // Normal users go straight to workspace
      }

    } catch (err: any) {
      triggerError(err.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes headshake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px) rotate(-2deg); }
          40% { transform: translateX(10px) rotate(2deg); }
          60% { transform: translateX(-10px) rotate(-2deg); }
          80% { transform: translateX(10px) rotate(2deg); }
        }
        .animate-headshake {
          animation: headshake 0.4s ease-in-out;
        }
      `}} />

      <div className="min-h-screen bg-[#FFFBEF] flex items-center justify-center relative overflow-hidden px-4 py-8">
        <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-amber-300/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-violet-400/25 blur-[120px] rounded-full" />

        <div className="absolute top-8 right-8 z-50 flex items-center">
           <span className="text-sm text-slate-600 mr-2">New to HeadSaaS?</span>
           <Link href="/register" className="text-sm font-medium text-violet-600 hover:text-violet-800 transition">
              Sign Up
           </Link>
        </div>

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

          <div className="bg-white/80 border border-amber-200 rounded-3xl p-9 shadow-2xl backdrop-blur-xl">
            
            {step < 3 && (
              <>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-700 bg-violet-100 border border-violet-200 rounded-full px-3 py-1 mb-5">
                  <ShieldCheck className="w-3 h-3" /> Passwordless Security
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
                <p className="text-sm text-slate-700 mt-2 mb-8">Sign in using your mobile number.</p>
              </>
            )}

            <div>
              {/* STEP 1: PHONE NUMBER */}
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-500">Mobile Number</label>
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                        required
                        placeholder="98765 43210"
                        className="w-full px-4 py-3 text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center my-4">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => triggerError("Security check failed. Please refresh.")}
                    />
                  </div>

                  {error && (
                    <div className={`text-sm font-bold bg-rose-100 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 ${isShaking ? 'animate-headshake' : ''}`}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !turnstileToken}
                    className="w-full mt-4 bg-slate-900 text-amber-200 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : <>Send OTP <ArrowRight size={18} /></>}
                  </button>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {step === 2 && (
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
                    <button type="button" onClick={() => {
                      setStep(1);
                      setTurnstileToken(""); 
                    }} className="text-violet-600 hover:underline font-bold">
                      Change number
                    </button>
                  </p>

                  {error && (
                    <div className={`text-sm font-bold bg-rose-100 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 ${isShaking ? 'animate-headshake' : ''}`}>
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

              {/* STEP 3: THE ADMIN CROSSROADS */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-50">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Identity Verified</h1>
                    <p className="text-sm text-slate-500 mt-2">Welcome back, Admin. Where would you like to go today?</p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      type="button"
                      onClick={() => router.push("/admin")}
                      className="w-full group text-left bg-white border-2 border-violet-200 hover:border-violet-500 rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-md cursor-pointer"
                    >
                      <div className="p-3 bg-violet-100 text-violet-700 rounded-xl group-hover:scale-110 transition-transform">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">Command Center</div>
                        <div className="text-xs text-slate-500 mt-0.5">Manage global platform metrics</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                    </button>

                    <button 
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="w-full group text-left bg-white border-2 border-amber-200 hover:border-amber-500 rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-md cursor-pointer"
                    >
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">My Workspace</div>
                        <div className="text-xs text-slate-500 mt-0.5">Access your company SaaS stack</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-400 font-medium"
        />
      </div>
    </div>
  );
}
