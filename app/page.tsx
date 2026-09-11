"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Lock, Award, TrendingDown, Sparkles, ArrowRight, Building2, Eye, Zap,
} from "lucide-react";
import ContactModal from "@/components/ContactModal"; // <-- Import the Modal

const STATS = [
  { v: "$8,420", l: "Avg annual savings" },
  { v: "30%", l: "Reduction in SaaS waste" },
  { v: "15 min", l: "To get full visibility" },
  { v: "Free", l: "Starter plan available" },
];

const PILLARS = [
  { icon: ShieldCheck, t: "Bank-grade Security", d: "AES-256 at rest, TLS 1.3 in transit, SOC 2 controls, MFA via authenticator, optional SSO." },
  { icon: Lock, t: "Read-only by Design", d: "We never modify vendor billing or settings. Everything is observational." },
  { icon: Award, t: "Scalable Pricing", d: "Start for free and smoothly upgrade as your team, vendors, and applications grow." },
  { icon: Eye, t: "Total Visibility", d: "One dashboard for every vendor, contract, renewal and license." },
];

const FEATURES = [
  { icon: TrendingDown, t: "Cut SaaS Spend", d: "Identify unused licenses and reduce waste automatically." },
  { icon: Building2, t: "Projects", d: "Allocate software cost to individual projects." },
  { icon: Zap, t: "Real-time Alerts", d: "Renewals, expiring licenses and spending alerts." },
];

const QUOTES = [
  { q: "Finally a SaaS management tool that doesn't upsell.", a: "CIO" },
  { q: "We discovered thousands of dollars in unused licenses.", a: "VP IT" },
  { q: "Exactly the visibility our procurement team needed.", a: "Procurement Director" },
];

const PRICING_TIERS = [
  { name: "Free", seats: "1", members: "50", vendors: "50", apps: "25", price: "$0" },
  { name: "Pro", seats: "3", members: "100", vendors: "100", apps: "100", price: "$10/mo" },
  { name: "Team", seats: "4-9", members: "Unlimited", vendors: "Unlimited", apps: "Unlimited", price: "$90/user/yr", sub: "(annual only)" },
  { name: "Business", seats: "10-49", members: "Unlimited", vendors: "Unlimited", apps: "Unlimited", price: "$8/user/mo", sub: "or $80/user/yr (10+2 free)" },
  { name: "Enterprise", seats: "50+", members: "Unlimited", vendors: "Unlimited", apps: "Custom", price: "Custom" }
];

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false); // <-- Modal State

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-slate-900 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-amber-300/30 blur-[120px] rounded-full"/>
      <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-violet-400/20 blur-[120px] rounded-full"/>

      {/* NAVBAR */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h2 className="font-bold text-xl">HeadSaaS</h2>
            <p className="text-xs text-gray-500 uppercase">For IT Leaders</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <a href="#pricing" className="text-sm font-medium hover:text-violet-600 transition hidden sm:block mr-2">
            Pricing
          </a>
          {/* NEW CONTACT US BUTTON */}
          <button 
            onClick={() => setIsContactOpen(true)} 
            className="text-sm font-medium hover:text-violet-600 transition hidden sm:block mr-4 cursor-pointer"
          >
            Contact Us
          </button>
          
          <Link href="/login" className="px-4 py-2 text-sm font-medium">
            Login
          </Link>
          <Link href="/register" className="bg-black text-amber-300 px-5 py-2 rounded-xl text-sm font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-5 py-2 mb-8">
          <Sparkles size={15}/> Start for Free
        </div>

        <h1 className="text-7xl font-light leading-tight">
          Stop bleeding money to
          <span className="italic text-violet-700">{" "}SaaS sprawl</span>
          <br/>
          Start leading with
          <span className="bg-gradient-to-r from-amber-500 to-violet-600 bg-clip-text text-transparent">{" "}clarity</span>
        </h1>

        <p className="text-xl mt-8 text-slate-600 max-w-3xl">
          HeadSaaS gives CIOs and IT leaders one trusted place to manage every application, license, renewal and vendor.
        </p>

        <div className="flex gap-4 mt-10">
          <Link href="/login" className="bg-black text-amber-300 px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition">
            Login <ArrowRight size={18}/>
          </Link>
          <Link href="/register" className="border border-gray-400 px-8 py-4 rounded-xl hover:bg-black/5 transition">
            Register
          </Link>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-5 mt-20">
          {STATS.map((s)=>(
            <div key={s.l} className="bg-white rounded-2xl p-6 border border-amber-200/60 shadow-sm">
              <h2 className="text-4xl font-bold">{s.v}</h2>
              <p className="text-gray-500 mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-4 gap-6">
          {PILLARS.map((p)=>{
            const Icon=p.icon;
            return(
              <div key={p.t} className="bg-white rounded-2xl p-8 border border-amber-200/60 shadow-sm hover:border-violet-300 transition">
                <Icon className="text-violet-700 mb-4" size={28}/>
                <h3 className="font-bold text-xl">{p.t}</h3>
                <p className="text-gray-600 mt-4">{p.d}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-6">
          {FEATURES.map((f)=>{
            const Icon=f.icon;
            return(
              <div key={f.t} className="bg-slate-900 rounded-3xl p-8 text-white shadow-lg">
                <Icon className="text-amber-400 mb-6" size={30}/>
                <h3 className="text-2xl font-bold">{f.t}</h3>
                <p className="text-gray-400 mt-4">{f.d}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light text-slate-900">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-600 mt-4">Choose the perfect plan for your workspace size.</p>
        </div>

        <div className="overflow-x-auto bg-white rounded-[2rem] p-4 md:p-8 shadow-xl border border-amber-200/60">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-amber-200/60 text-slate-500 text-sm tracking-wide">
                <th className="py-5 px-6 font-bold uppercase">Tier</th>
                <th className="py-5 px-6 font-bold uppercase">Seats</th>
                <th className="py-5 px-6 font-bold uppercase">Members</th>
                <th className="py-5 px-6 font-bold uppercase">Vendors</th>
                <th className="py-5 px-6 font-bold uppercase">Apps</th>
                <th className="py-5 px-6 font-bold uppercase">Price</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_TIERS.map((tier) => (
                <tr key={tier.name} className="border-b border-amber-100/50 hover:bg-amber-50/50 transition-colors group last:border-0">
                  <td className="py-6 px-6 font-bold text-xl text-slate-900 group-hover:text-violet-700 transition-colors">{tier.name}</td>
                  <td className="py-6 px-6 text-slate-600 font-medium">{tier.seats}</td>
                  <td className="py-6 px-6 text-slate-600 font-medium">{tier.members}</td>
                  <td className="py-6 px-6 text-slate-600 font-medium">{tier.vendors}</td>
                  <td className="py-6 px-6 text-slate-600 font-medium">{tier.apps}</td>
                  <td className="py-6 px-6 text-slate-900">
                    <div className="font-bold text-lg">{tier.price}</div>
                    {tier.sub && <div className="text-xs text-slate-500 mt-1 font-medium">{tier.sub}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-slate-900 via-violet-900 to-slate-900 rounded-3xl p-16 text-center text-white shadow-2xl">
          <Award size={40} className="mx-auto text-amber-400 mb-5"/>
          <h2 className="text-4xl font-light">Start Managing Your SaaS Today</h2>
          <p className="mt-6 text-gray-300 text-lg max-w-xl mx-auto">
            Get started on our Free tier and smoothly upgrade as your team expands. Complete visibility is just a click away.
          </p>
          <Link href="/register" className="inline-flex mt-10 bg-amber-300 hover:bg-amber-400 text-black px-8 py-4 rounded-xl font-bold transition shadow-lg hover:shadow-amber-400/20 hover:-translate-y-0.5">
            Create Workspace
          </Link>
        </div>
      </section>

      <footer className="border-t border-amber-200/60 py-8 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-4">
        <div className="flex gap-6">
          <button onClick={() => setIsContactOpen(true)} className="hover:text-violet-600 transition">Contact Support</button>
          <Link href="/login" className="hover:text-violet-600 transition">Sign In</Link>
        </div>
        <div>© 2026 HeadSaaS. All rights reserved.</div>
      </footer>

      {/* CONTACT MODAL COMPONENT */}
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
        defaultType="Contact" 
      />
    </div>
  );
}
