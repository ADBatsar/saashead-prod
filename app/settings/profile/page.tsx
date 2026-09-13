"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/workspace/Layout";
import { useRouter } from "next/navigation";
import { User, Building, Phone, Mail, ShieldCheck } from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    companyName: "",
    companySize: "1-50", 
    department: "IT",
    role: "",
  });

  // Fetch user data on load
  useEffect(() => {
    fetch("/api/user/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const data = json.data || json.user || json;
        
        if (data && !data.error) {
          setForm({
            name: data.name || "",
            email: data.email || "",
            mobileNumber: data.mobileNumber || "",
            companyName: data.companyName || "",
            companySize: data.companySize || "1-50",
            department: data.department || "IT",
            role: data.role || "",
          });
        }
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setMessage({ type: "error", text: "Failed to load profile." });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          mobileNumber: form.mobileNumber,
          companyName: form.companyName,
          companySize: form.companySize,
          department: form.department,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || data.message || "Failed to update profile");

      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Profile Settings" subtitle="Manage your personal and workspace information">
        <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Loading profile data...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile Settings" subtitle="Manage your personal and workspace information">
      <div className="max-w-4xl space-y-6 pb-12 mt-6">
        
        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-bold border shadow-sm ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Information Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 text-slate-900 font-bold">
              <User className="w-4 h-4 text-blue-500" />
              Personal Information
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={form.email}
                    className="w-full bg-slate-50 border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-500 outline-none cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">System Role</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    disabled
                    value={form.role}
                    className="w-full bg-slate-50 border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-700 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 text-slate-900 font-bold">
              <Building className="w-4 h-4 text-blue-500" />
              Company Details
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Company Size</label>
                <select
                  value={form.companySize}
                  onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                  className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="1-50">1 - 50</option>
                  <option value="51-200">51 - 200</option>
                  <option value="201-500">201 - 500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="IT">IT / Eng</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-black text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </form>

      </div>
    </Layout>
  );
}
