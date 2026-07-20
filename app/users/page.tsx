"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/workspace/Layout";
import { Plus, X, Trash2, Search, Shield, Mail, Lock, User as UserIcon } from "lucide-react";
import { formatDate } from "@/lib/utils"; // Assuming you have this helper

const RBAC_ROLES = [
  "Workspace Chief",
  "Workspace Operator",
  "Workspace Viewer",
  "Workspace License Holder"
];

const EMPTY_FORM = { name: "", email: "", password: "", role: "Workspace License Holder" };

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  // 1. Fetch real users from the database on load
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) setUsers(json.users);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }

  // 2. Filter users based on search query
  const filtered = useMemo(() => users.filter((u: any) =>
    query === "" || 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase())
  ), [users, query]);

  // 3. Handle User Creation
  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create user");

      await loadUsers(); // Refresh the grid
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openModal() {
    setError("");
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  }

  return (
    <Layout title="Users" subtitle="Manage your team and role-based access control.">
      
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-[#0E1320] border border-slate-800 rounded-xl px-3 py-2 w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search users by name or email…"
            className="bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600 flex-1" 
          />
        </div>

        <button 
          onClick={openModal} 
          className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white text-sm px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((u: any) => (
          <div key={u._id} className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 p-5 group hover:border-slate-700 transition">
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-semibold text-white uppercase shadow-inner">
                {u.name ? u.name.charAt(0) : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-base truncate font-medium">{u.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
              </div>
            </div>

            <div className="mt-5 bg-[#070A11] border border-slate-800/60 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${
                  u.role === "Workspace Chief" ? "text-amber-400" : 
                  u.role === "Workspace License Holder" ? "text-slate-500" : "text-blue-400"
                }`} />
                <span className={`text-xs font-medium ${u.role === "Workspace Chief" ? "text-amber-100" : "text-slate-300"}`}>
                  {u.role}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-4">
              <div className="text-[10px] text-slate-500">
                Added {u.createdAt ? formatDate(u.createdAt) : "Recently"}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Note: Delete functionality requires a DELETE endpoint in your API to fully work */}
                <button title="Remove User" className="p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-[#0E1320]/50 rounded-2xl border border-dashed border-slate-800">
            No users found in this workspace.
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E1320] border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg text-white font-medium">Add Team Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#070A11] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition" placeholder="Jane Doe" />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#070A11] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition" placeholder="jane@company.com" />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1.5">Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-[#070A11] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1.5">Workspace Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-[#070A11] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer">
                    {RBAC_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">{error}</div>}

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
