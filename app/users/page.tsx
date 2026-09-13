"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/workspace/Layout";
import { Plus, X, Trash2, Search, Shield, Mail, Phone, User as UserIcon } from "lucide-react";
import { formatDate } from "@/lib/utils"; 

const RBAC_ROLES = [
  "Workspace Chief",
  "Workspace Operator",
  "Workspace Viewer",
  "Workspace License Holder"
];

// Swapped password for phone
const EMPTY_FORM = { name: "", email: "", phone: "", role: "Workspace License Holder" };

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

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

  const filtered = useMemo(() => users.filter((u: any) =>
    query === "" || 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    (u.phone && u.phone.includes(query))
  ), [users, query]);

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

      await loadUsers();
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to delete user");
      
      await loadUsers(); // Refresh the grid!
    } catch (error: any) {
      alert(error.message); // If RBAC blocks it, it will alert here!
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
        <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 w-full max-w-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search users by name or email…"
            className="bg-transparent outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400 flex-1" 
          />
        </div>

        <button 
          onClick={openModal} 
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((u: any) => {
          // Determine Role Styling
          const isChief = u.role === "Workspace Chief";
          const isOperator = u.role === "Workspace Operator";
          
          return (
            <div key={u._id} className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5 group hover:border-blue-300 hover:shadow-md transition">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 shadow-sm shrink-0">
                  {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 font-bold text-base truncate group-hover:text-blue-600 transition">{u.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{u.email}</div>
                  {u.phone && <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{u.phone}</div>}
                </div>
              </div>

              <div className="mt-5 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${
                    isChief ? "text-blue-600" : 
                    isOperator ? "text-emerald-500" : 
                    "text-slate-400"
                  }`} />
                  <span className={`text-xs font-bold ${
                    isChief ? "text-blue-700" : 
                    isOperator ? "text-emerald-700" : 
                    "text-slate-600"
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Added {u.createdAt ? formatDate(u.createdAt) : "Recently"}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDeleteUser(u._id)} 
                    title="Remove User" 
                    className="p-2 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 hover:border-rose-200 border border-transparent transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200 shadow-sm">
            No users found in this workspace.
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 relative animate-in fade-in zoom-in-95">
            
            {isSubmitting && (
               <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-sm rounded-3xl">
                 <div className="text-blue-600 font-bold animate-pulse">Sending Invite...</div>
               </div>
            )}

            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl text-slate-900 font-bold">Add Team Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" placeholder="Jane Doe" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Email Address (For Invite)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" placeholder="jane@company.com" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Phone Number (For OTP Login)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Workspace Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3.5 h-4 w-4 text-blue-500" />
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition appearance-none cursor-pointer">
                    {RBAC_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 rounded-lg p-3">{error}</div>}

              <div className="mt-8 pt-4 flex gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
