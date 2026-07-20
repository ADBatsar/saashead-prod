"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Users,
  Award,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Building2,
  Eye,
  Zap,
} from "lucide-react";

const STATS = [
  { v: "$8,420", l: "Avg annual savings" },
  { v: "30%", l: "Reduction in SaaS waste" },
  { v: "15 min", l: "To get full visibility" },
  { v: "100%", l: "Free, forever" },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    t: "Bank-grade Security",
    d: "AES-256 at rest, TLS 1.3 in transit, SOC 2 controls, MFA via authenticator, optional SSO.",
  },
  {
    icon: Lock,
    t: "Read-only by Design",
    d: "We never modify vendor billing or settings. Everything is observational.",
  },
  {
    icon: Award,
    t: "Always Free",
    d: "Unlimited users, unlimited applications and unlimited projects.",
  },
  {
    icon: Eye,
    t: "Total Visibility",
    d: "One dashboard for every vendor, contract, renewal and license.",
  },
];

const FEATURES = [
  {
    icon: TrendingDown,
    t: "Cut SaaS Spend",
    d: "Identify unused licenses and reduce waste automatically.",
  },
  {
    icon: Building2,
    t: "Projects",
    d: "Allocate software cost to individual projects.",
  },
  {
    icon: Zap,
    t: "Real-time Alerts",
    d: "Renewals, expiring licenses and spending alerts.",
  },
];

const QUOTES = [
  {
    q: "Finally a SaaS management tool that doesn't upsell.",
    a: "CIO",
  },
  {
    q: "We discovered thousands of dollars in unused licenses.",
    a: "VP IT",
  },
  {
    q: "Exactly the visibility our procurement team needed.",
    a: "Procurement Director",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFBEF] text-slate-900 overflow-hidden">

      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-amber-300/30 blur-[120px] rounded-full"/>

      <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-violet-400/20 blur-[120px] rounded-full"/>

      {/* NAVBAR */}

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center">

            <span className="text-white font-bold text-lg">
              H
            </span>

          </div>

          <div>

            <h2 className="font-bold text-xl">
              HeadSaaS
            </h2>

            <p className="text-xs text-gray-500 uppercase">
              For IT Leaders
            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <Link
            href="/login"
            className="px-4 py-2"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="bg-black text-amber-300 px-5 py-2 rounded-xl"
          >
            Get Started
          </Link>

        </div>

      </nav>

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">

        <div className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-5 py-2 mb-8">

          <Sparkles size={15}/>

          Always Free

        </div>

        <h1 className="text-7xl font-light leading-tight">

          Stop bleeding money to

          <span className="italic text-violet-700">

            {" "}SaaS sprawl

          </span>

          <br/>

          Start leading with

          <span className="bg-gradient-to-r from-amber-500 to-violet-600 bg-clip-text text-transparent">

            {" "}clarity

          </span>

        </h1>

        <p className="text-xl mt-8 text-slate-600 max-w-3xl">

          HeadSaaS gives CIOs and IT leaders one trusted place to manage every application,
          license, renewal and vendor.

        </p>

        <div className="flex gap-4 mt-10">

          <Link
            href="/login"
            className="bg-black text-amber-300 px-8 py-4 rounded-xl flex items-center gap-2"
          >
            Login
            <ArrowRight size={18}/>
          </Link>

          <Link
            href="/register"
            className="border border-gray-400 px-8 py-4 rounded-xl"
          >
            Register
          </Link>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-4 gap-5 mt-20">

          {STATS.map((s)=>(
            <div
              key={s.l}
              className="bg-white rounded-2xl p-6 border"
            >
              <h2 className="text-4xl font-bold">
                {s.v}
              </h2>

              <p className="text-gray-500 mt-2">
                {s.l}
              </p>

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

              <div
                key={p.t}
                className="bg-white rounded-2xl p-8 border"
              >

                <Icon
                  className="text-violet-700 mb-4"
                  size={28}
                />

                <h3 className="font-bold text-xl">
                  {p.t}
                </h3>

                <p className="text-gray-600 mt-4">
                  {p.d}
                </p>

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

              <div
                key={f.t}
                className="bg-slate-900 rounded-3xl p-8 text-white"
              >

                <Icon
                  className="text-amber-400 mb-6"
                  size={30}
                />

                <h3 className="text-2xl font-bold">
                  {f.t}
                </h3>

                <p className="text-gray-400 mt-4">
                  {f.d}
                </p>

              </div>

            )

          })}

        </div>

      </section>

      {/* TESTIMONIALS */}

      <section className="max-w-6xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-3 gap-6">

          {QUOTES.map((q)=>(
            <div
              key={q.q}
              className="bg-white rounded-2xl p-8 border"
            >

              <div className="text-5xl text-violet-400">
                "
              </div>

              <p className="mt-4">
                {q.q}
              </p>

              <p className="mt-6 text-sm text-gray-500">
                {q.a}
              </p>

            </div>
          ))}

        </div>

      </section>

      {/* CTA */}

      <section className="max-w-5xl mx-auto px-6 pb-24">

        <div className="bg-gradient-to-r from-slate-900 via-violet-900 to-slate-900 rounded-3xl p-16 text-center text-white">

          <Award
            size={40}
            className="mx-auto text-amber-400 mb-5"
          />

          <h2 className="text-4xl font-light">

            Forever Free

          </h2>

          <p className="mt-6 text-gray-300">

            Unlimited Workspaces

            <br/>

            Unlimited Users

            <br/>

            Unlimited Applications

          </p>

          <Link
            href="/register"
            className="inline-flex mt-10 bg-amber-300 text-black px-8 py-4 rounded-xl"
          >
            Create Workspace
          </Link>

        </div>

      </section>

      <footer className="border-t py-8 text-center text-gray-500">

        © 2026 HeadSaaS

      </footer>

    </div>
  );
}
