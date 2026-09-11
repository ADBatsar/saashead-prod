"use client";

import React, { useState } from "react";
import Layout from "@/components/workspace/Layout";
import { Sparkles, Send } from "lucide-react";

const SUGGESTED = [
  "Show applications expiring in 60 days",
  "Find unused licenses",
  "How much are we spending on Engineering?",
  "Which vendor costs the most?",
];

export default function AiCopilotPage() {
  const [messages] = useState([
    { role: "assistant", text: "Hi! I'm your SaaS Copilot. Ask me anything about your stack, renewals, spend, or unused licenses." },
  ]);

  return (
    <Layout title="AI Copilot" subtitle="Natural language insights for your SaaS stack">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Chat Window */}
        <div className="lg:col-span-3 rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5]/80 flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-slate-900 font-bold" />
                  </div>
                )}
                <div className={`max-w-[80%] ${m.role === "user" ? "bg-blue-600 text-slate-900 font-bold" : "bg-white/5 text-slate-900 font-bold font-bold border border-amber-200/60 shadow-sm"} rounded-2xl px-4 py-3 text-sm`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-amber-200/60 shadow-sm flex gap-2">
            <input placeholder="Ask about renewals, spend, unused licenses…"
              className="flex-1 bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none" />
            <button className="px-5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-slate-900 font-bold text-sm font-medium flex items-center gap-2">
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-gradient-to-br from-blue-600/10 to-transparent p-5">
          <div className="font-display text-sm text-slate-900 font-bold mb-3">Try asking…</div>
          <div className="space-y-2">
            {SUGGESTED.map((s) => (
              <button key={s} className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-amber-200/60 shadow-sm bg-white/[0.02] hover:bg-amber-50 text-slate-600 font-medium transition">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
