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
  { icon: Eye, t: "Total Visibility", d: "Unified software tracking dashboard for every vendor, license agreement, active subscription, and contract renewal." },
];

const FEATURES = [
  { icon: TrendingDown, t: "Cut SaaS Spend", d: "Identify underutilized seats, detect inactive users, and automatically reduce SaaS waste to recover valuable IT budget." },
  { icon: Building2, t: "Proportional Costs", d: "Distribute and allocate exact software license and subscription costs proportionally to individual project budgets and department cost centers." },
  { icon: Zap, t: "Real-time Alerts", d: "Track contract timelines using an interactive renewals calendar with automated, real-time alerts for impending expirations or budget threshold breaches." },
];

const INTEGRATIONS = [
  { name: "Salesforce", desc: "Natively synchronize CRM accounts, seat metrics, and recurring licensing costs automatically." },
  { name: "SAP", desc: "Align enterprise SaaS governance with strict financial ledgers, corporate procurement, and ERP processes." },
  { name: "Microsoft 365", desc: "Directly audit active Microsoft 365 user licenses, identify duplicate seats, and reclaim inactive licenses instantly." },
  { name: "Google Workspace", desc: "Govern user directories, track application delegation, and secure third-party permissions across your organization." },
  { name: "Slack", desc: "Analyze workspace collaboration engagement, discover inactive channels, and eliminate duplicate guest user fees." },
  { name: "Jira", desc: "Track active Atlassian software development seats and allocate engineering licensing overhead to specific project cost centers." },
  { name: "Okta", desc: "Leverage single sign-on (SSO) context to map user accounts, secure authentication state, and automate employee offboarding." },
  { name: "ServiceNow", desc: "Integrate IT service management (ITSM) workflows with automatic license request audits and compliance trails." },
];

const PRICING_TIERS = [
  {
    name: "Free",
    seats: "1",
    members: "50",
    vendors: "50",
    apps: "25",
    price: "$0",
    period: "",
    sub: "Free forever"
  },
  {
    name: "Pro",
    seats: "3",
    members: "100",
    vendors: "100",
    apps: "100",
    price: "$10",
    period: "/ month",
    sub: "Billed monthly"
  },
  {
    name: "Team",
    seats: "4–9",
    members: "Unlimited",
    vendors: "Unlimited",
    apps: "Unlimited",
    price: "$90",
    period: "/ user / year",
    sub: "Billed annually"
  },
  {
    name: "Business",
    seats: "10–49",
    members: "Unlimited",
    vendors: "Unlimited",
    apps: "Unlimited",
    price: "$8",
    period: "/ user / month",
    sub: "Billed monthly or $80 / user / year (2 months free)"
  },
  {
    name: "Enterprise",
    seats: "50+",
    members: "Unlimited",
    vendors: "Unlimited",
    apps: "Custom",
    price: "Custom",
    period: "",
    sub: "Contact sales for pricing"
  }
];

const FAQS = [
  {
    q: "What is HeadSaaS?",
    a: "HeadSaaS is an enterprise-grade SaaS Management Platform (SMP). It helps organizations discover shadow IT, optimize seat licenses, automate employee offboarding, track contract renewals, and cut software spend instantly."
  },
  {
    q: "Does HeadSaaS support Salesforce and SAP integration?",
    a: "Yes. HeadSaaS integrates natively with Salesforce and SAP to automatically align SaaS governance and software usage with procurement, finance, and CRM workflows."
  },
  {
    q: "Can I automatically discover Shadow IT?",
    a: "Absolutely. HeadSaaS runs non-invasive, read-only audit scans across your organization to automatically identify unauthorized, unmanaged, or duplicate SaaS applications, giving your IT team full visibility."
  },
  {
    q: "How does the renewals tracker work?",
    a: "HeadSaaS features a centralized software renewals calendar with automated, real-time alerts. It proactively notifies you about upcoming expiration dates and contract terms, preventing accidental auto-renewals."
  },
  {
    q: "Is there a completely free option?",
    a: "Yes. Our Free tier includes 1 seat, and supports up to 50 members, 50 vendors, and 25 applications with full visibility. You can smoothly upgrade to our Pro or Enterprise plans as your workspace grows."
  }
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
          <a href="#how-it-works" className="text-sm font-medium hover:text-violet-600 transition hidden lg:block mr-2">
            How It Works
          </a>
          <a href="#solutions" className="text-sm font-medium hover:text-violet-600 transition hidden lg:block mr-2">
            Solutions
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-violet-600 transition hidden sm:block mr-2">
            Pricing
          </a>
          <a href="#integrations" className="text-sm font-medium hover:text-violet-600 transition hidden sm:block mr-2">
            Integrations
          </a>
          <a href="#faq" className="text-sm font-medium hover:text-violet-600 transition hidden sm:block mr-2">
            FAQ
          </a>
          {/* NEW CONTACT US BUTTON */}
          <button 
            onClick={() => setIsContactOpen(true)} 
            className="text-sm font-medium hover:text-violet-600 transition hidden sm:block mr-4 cursor-pointer text-left bg-transparent border-0 font-sans"
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
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-5 py-2 mb-8 text-sm font-medium">
          <Sparkles size={15}/> Start for Free
        </div>

        <h1 className="text-7xl font-light leading-tight">
          Bring balance to your
          <span className="italic text-violet-700">{" "}software footprint</span>
          <br/>
          Start leading with
          <span className="bg-gradient-to-r from-amber-500 to-violet-600 bg-clip-text text-transparent">{" "}absolute clarity</span>
        </h1>

        <p className="text-xl mt-8 text-slate-600 max-w-3xl">
          HeadSaaS is a next-generation SaaS Management Platform (SMP) that empowers CIOs, IT leaders, and procurement managers to discover shadow IT, optimize software license utilization, track renewals, and cut waste automatically.
        </p>

        <div className="flex gap-4 mt-10">
          <Link href="/login" className="bg-black text-amber-300 px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition">
            Login <ArrowRight size={18}/>
          </Link>
          <Link href="/register" className="border border-gray-400 px-8 py-4 rounded-xl hover:bg-black/5 transition">
            Register
          </Link>
        </div>

        {/* STATS (Optimized Semantic HTML - Replaced h2 with div) */}
        <div className="grid md:grid-cols-4 gap-5 mt-20">
          {STATS.map((s)=>(
            <div key={s.l} className="bg-white rounded-2xl p-6 border border-amber-200/60 shadow-sm">
              <div className="text-4xl font-bold text-slate-900">{s.v}</div>
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

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-amber-200/40">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-700 px-5 py-2 mb-4 font-medium text-sm">
            Implementation Journey
          </div>
          <h2 className="text-5xl font-light text-slate-900 leading-tight">
            SaaS Spend Optimization in <span className="italic text-violet-700">Four Simple Steps</span>
          </h2>
          <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
            Getting full visibility and control over your enterprise software footprint takes less than fifteen minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-amber-200/60 shadow-sm flex flex-col justify-between hover:border-violet-300 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl mb-6 font-mono">1</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Secure Connection</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Natively connect your core SSO, identity providers (Okta, Google Workspace), and cloud financial suites via secure, read-only APIs in just a few clicks.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-amber-200/60 shadow-sm flex flex-col justify-between hover:border-violet-300 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl mb-6 font-mono">2</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Discovery</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Our passive discovery scanning engines automatically map every software license, shadow IT subscription, and duplicate user account in real-time.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-amber-200/60 shadow-sm flex flex-col justify-between hover:border-violet-300 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl mb-6 font-mono">3</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Deep Optimization</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Identify underutilized seat licenses, track exact application engagement, and allocate license costs proportionally to departments or active project budgets.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-amber-200/60 shadow-sm flex flex-col justify-between hover:border-violet-300 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl mb-6 font-mono">4</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Proactive Control</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Configure a centralized renewals calendar, set automated expiration alerts, and execute zero-friction offboarding to immediately reclaim active user seats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-amber-200/40">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-200 text-amber-800 px-5 py-2 mb-4 font-medium text-sm">
            Tailored Solutions
          </div>
          <h2 className="text-5xl font-light text-slate-900 leading-tight">
            Empowering Every <span className="italic text-violet-700">Enterprise Stakeholder</span>
          </h2>
          <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
            HeadSaaS bridges the gap between IT operations, financial governance, and procurement teams to drive maximum software value.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For IT Leaders & CIOs</h3>
              <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                Govern your entire software ecosystem from a single pane of glass. Eliminate security vulnerabilities from rogue shadow IT, enforce strict identity policies, and support audits with detailed license request history.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 border-t border-slate-800 pt-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Automated Shadow IT Discovery
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                SOC 2 & MFA Access Controls
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Instant Deprovisioning Workflows
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 mb-6">
                <TrendingDown size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For Finance & CFOs</h3>
              <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                Take complete charge of SaaS cash-outflow and budget predictability. Automatically detect unused licenses to stop billing leaks, and allocate exact subscription costs dynamically to correct departments or client projects.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 border-t border-slate-800 pt-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Proportional Cost Allocation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Detailed ROI & Spend Analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Monthly Financial Snapshots
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white mb-6">
                <Building2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For Procurement & Sourcing</h3>
              <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                Approach software contract negotiations with raw usage data. Track expiration parameters across SAP, Salesforce, and other key suites, ensuring zero accidental auto-renewals and optimized contractual volumes.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 border-t border-slate-800 pt-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Dynamic Software Renewals Tracker
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                AI PDF Contract Term Extraction
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Vendor Concentration Indexing
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS SECTION */}
      <section id="integrations" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-amber-200/40">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-700 px-5 py-2 mb-4 font-medium text-sm">
            Enterprise Integrations
          </div>
          <h2 className="text-5xl font-light text-slate-900 leading-tight">
            Connect your entire <span className="italic text-violet-700">software ecosystem</span>
          </h2>
          <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
            HeadSaaS integrates seamlessly with your critical identity, CRM, ERP, and collaboration suites.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-3xl p-8 border border-amber-200/60 shadow-sm hover:border-violet-300 hover:shadow-md transition duration-300"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 relative z-10 border-t border-amber-200/40">
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
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-xl text-slate-900 group-hover:text-violet-700 transition-colors">
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-xs text-slate-500 font-medium">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    {tier.sub && (
                      <div className="text-xs text-slate-400 mt-1 font-medium leading-tight">
                        {tier.sub}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 relative z-10 border-t border-amber-200/40">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-5 py-2 mb-4 font-medium text-sm">
            Got Questions?
          </div>
          <h2 className="text-5xl font-light text-slate-900">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-600 mt-4 text-center">
            Everything you need to know about our best-in-class SaaS management capabilities.
          </p>
        </div>

        <div className="space-y-6">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-2xl p-8 border border-amber-200/60 shadow-sm hover:border-amber-300 transition duration-300"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {faq.q}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
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
          <button onClick={() => setIsContactOpen(true)} className="hover:text-violet-600 transition bg-transparent border-0 cursor-pointer">Contact Support</button>
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