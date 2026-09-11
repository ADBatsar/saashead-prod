"use client";

import { useState } from "react";
import { X, Send, MessageSquare } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "Contact" | "Feedback" | "Bug";
  workspaceId?: string; // Optional: Pass this if the user is logged into a workspace
}

export default function ContactModal({ isOpen, onClose, defaultType = "Contact", workspaceId }: ContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: defaultType,
    subject: "",
    message: "",
  });

  if (!isOpen) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workspaceId }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#FFFCF5] border-b border-amber-200/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            {defaultType === "Contact" ? "Contact Us" : "Send Feedback"}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-amber-50 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
              <p className="text-slate-500 mb-6">Thank you for reaching out. Our team will get back to you shortly.</p>
              <button onClick={onClose} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Name</label>
                  <input
                    type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Email</label>
                  <input
                    type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["Contact", "Feedback", "Bug"].map((type) => (
                  <button
                    key={type} type="button" onClick={() => setForm({ ...form, type: type as any })}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      form.type === type ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Subject</label>
                <input
                  type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Message</label>
                <textarea
                  required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Provide as much detail as possible..." rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition resize-none"
                />
              </div>

              {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}

              <button
                type="submit" disabled={loading}
                className="w-full bg-slate-900 text-amber-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition"
              >
                {loading ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
