"use client";

import React from "react";
import Layout from "@/components/workspace/Layout";
import { Shield, Plug, Bell, Users, Settings as SettingsIcon } from "lucide-react";

const SECTIONS = [
  { icon: SettingsIcon, title: "Workspace", desc: "Workspace name, branding, region & billing" },
  { icon: Plug, title: "Integrations", desc: "Connect SSO, Okta, Google Workspace, Azure AD" },
  { icon: Users, title: "RBAC & Teams", desc: "Define roles: Admin, Finance, IT, Procurement, Viewer" },
  { icon: Bell, title: "Notifications", desc: "Slack/email alerts for renewals, anomalies, savings" },
  { icon: Shield, title: "Security", desc: "Audit logs, MFA, IP allowlist, data residency" },
];

export default function AdministrationPage() {
  // Placeholder user state for design-only mode
  const user = { name: "Workspace Admin", email: "admin@headsaas.com", role: "Administrator" };

  return (
    <Layout title="Administration" subtitle="Settings, integrations & access control">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 p-6 lg:col-span-1">
          <div className="font-display text-base text-white mb-4">Your Profile</div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-lg text-white font-display font-semibold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white font-medium truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
              <div className="text-[10px] uppercase tracking-wider text-blue-300 mt-1">{user.role}</div>
            </div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:col-span-2">
          {SECTIONS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 p-5 hover:bg-[#101729] transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-blue-300" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-sm text-white">{s.title}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</div>
                </div>
              </div>
              <button className="mt-4 text-xs text-blue-400 hover:text-blue-300">Configure →</button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
