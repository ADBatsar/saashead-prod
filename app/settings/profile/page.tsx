"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/workspace/Layout";
import { useRouter } from "next/navigation";
import { User, Building, Phone, Mail, ShieldCheck, PauseCircle, Trash2, ShieldAlert } from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account? You will be logged out immediately, and your profile will be marked as inactive until restored by an Admin.")) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/account", { method: "PUT" });
      if (!res.ok) throw new Error("Failed to deactivate account");
      
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Error deactivating account" });
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("CRITICAL WARNING: Are you sure you want to PERMANENTLY delete your account? If you are the Chief, this will wipe all workspace data. This action CANNOT be undone. Type 'DELETE' to confirm.")) return;
    
    const verify = prompt("Type 'DELETE' to confirm permanent deletion:");
    if (verify !== "DELETE") {
      alert("Deletion cancelled.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Error deleting account" });
      setIsProcessing(false);
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
          <div className="bg-[#FFFCF5] border border-amber-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-amber-200/60 bg-white/50 flex items-center gap-2 text-slate-900 font-bold">
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
                    className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
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
                    className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">System Role</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    disabled
                    value={form.role}
                    className="w-full bg-emerald-50/50 border border-emerald-100 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-emerald-700 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="bg-[#FFFCF5] border border-amber-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-amber-200/60 bg-white/50 flex items-center gap-2 text-slate-900 font-bold">
              <Building className="w-4 h-4 text-violet-500" />
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
                  className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Company Size</label>
                <select
                  value={form.companySize}
                  onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                  className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition cursor-pointer"
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
                  className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition cursor-pointer"
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
              disabled={saving || isProcessing}
              className="bg-slate-900 hover:bg-black text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </form>

        {/* Danger Zone Section */}
        <div className="border border-rose-200 bg-rose-50/50 rounded-2xl overflow-hidden shadow-sm mt-12">
          <div className="px-6 py-4 border-b border-rose-200 bg-rose-100/50 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-rose-700 uppercase tracking-wider text-sm">Danger Zone</h3>
          </div>
          
          <div className="p-6 space-y-6">
            
            {/* Deactivate Option */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-slate-900 font-bold mb-1">Deactivate Account</h4>
                <p className="text-sm font-medium text-slate-500">
                  Temporarily disable your account. You will be logged out, and your seat will be freed up.
                </p>
              </div>
              <button
                onClick={handleDeactivate}
                disabled={isProcessing || saving}
                className="shrink-0 px-5 py-2.5 bg-white border border-amber-300 text-amber-600 hover:bg-amber-50 text-sm font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <PauseCircle className="w-4 h-4" />
                Deactivate
              </button>
            </div>

            <hr className="border-rose-200/60" />

            {/* Delete Option */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-slate-900 font-bold mb-1">Delete Account</h4>
                <p className="text-sm font-medium text-slate-500">
                  Permanently remove your account and data. <strong className="text-rose-600">If you are the Chief, this wipes the entire workspace.</strong>
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={isProcessing || saving}
                className="shrink-0 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}
