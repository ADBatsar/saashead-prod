"use client";

import React, { useState } from "react";
import Layout from "@/components/workspace/Layout";
import { Mail, MessageSquare, Phone, Smartphone, Bell, ShieldCheck, KeyRound } from "lucide-react";

const CHANNELS = [
  { k: "email", label: "Email", icon: Mail, desc: "Daily/weekly summary email" },
  { k: "slack", label: "Slack", icon: MessageSquare, desc: "Post to a Slack channel via webhook" },
  { k: "pagerduty", label: "PagerDuty", icon: Bell, desc: "Page on-call when license risk is critical" },
  { k: "whatsapp", label: "WhatsApp", icon: Phone, desc: "WhatsApp via Twilio" },
  { k: "sms", label: "SMS", icon: Smartphone, desc: "SMS via Twilio" },
];

export default function NotificationsPage() {
  const [mfaEnabled] = useState(false);

  return (
    <Layout title="Notifications & Security" subtitle="Choose how & where you want SaaS alerts">
      {/* Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {CHANNELS.map((c) => (
          <div key={c.k} className="rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5]/80 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border bg-white/5 border-amber-200/60 shadow-sm flex items-center justify-center">
                  <c.icon className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="font-display text-sm text-slate-900 font-bold">{c.label}</div>
                  <div className="text-[11px] text-slate-500">{c.desc}</div>
                </div>
              </div>
              <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5]/80 p-5">
          <div className="font-display text-sm text-slate-900 font-bold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-300" /> Summary schedule</div>
          <div className="text-sm text-slate-500 italic">Configuration form pending integration...</div>
        </div>

        <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-gradient-to-br from-amber-500/5 to-violet-500/5 p-5">
          <div className="font-display text-sm text-slate-900 font-bold mb-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-violet-300" /> Multi-Factor Authentication</div>
          <div className="text-[11px] text-slate-600 mb-4">Add an extra layer of security with any authenticator app.</div>
          {!mfaEnabled && (
            <button className="text-xs px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-200 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5" /> Set up MFA
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
