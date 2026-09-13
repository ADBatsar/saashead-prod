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
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 shadow-sm bg-white flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[80%] ${m.role === "user" ? "bg-blue-600 text-white font-medium" : "bg-slate-50 text-slate-800 font-medium border border-slate-200 shadow-sm"} rounded-2xl px-4 py-3 text-sm`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50 rounded-b-2xl">
            <input 
              placeholder="Ask about renewals, spend, unused licenses…"
              className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
            />
            <button className="px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2">
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5 h-fit">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Try asking…</div>
          <div className="space-y-2">
            {SUGGESTED.map((s) => (
              <button key={s} className="w-full text-left text-xs px-4 py-3 rounded-xl border border-slate-200 shadow-sm bg-slate-50 hover:bg-white hover:border-blue-300 hover:text-blue-600 text-slate-600 font-bold transition">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
