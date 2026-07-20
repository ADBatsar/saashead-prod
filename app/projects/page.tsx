"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/workspace/Layout";
import { Plus, X, Pencil, Trash2, FolderKanban, Users as UsersIcon, Package } from "lucide-react";
import { formatDate, currency } from "@/lib/utils";

const EMPTY_PROJECT = {
  name: "", description: "", status: "Active", 
  startDate: new Date().toISOString().split('T')[0], 
  endDate: "", assignedUsers: []
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_PROJECT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [projRes, usersRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/users") // Fetches available team members
      ]);
      const projJson = await projRes.json();
      const usersJson = await usersRes.json();
      
      if (projJson.success) setProjects(projJson.data);
      if (usersJson.success) setWorkspaceUsers(usersJson.users);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  }

  function openModal(project?: any) {
    if (project) {
      setForm({ ...project, startDate: project.startDate?.split('T')[0], endDate: project.endDate?.split('T')[0] || "" });
      setEditing(project);
    } else {
      setForm(EMPTY_PROJECT);
      setEditing("new");
    }
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editing === "new" ? "/api/projects" : `/api/projects/${editing._id}`;
      const method = editing === "new" ? "POST" : "PUT";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error("Failed to save");
      await loadData();
      setEditing(null);
    } catch (error) {
      alert("Error saving project");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      await loadData();
    } catch (error) {
      console.error(error);
    }
  }

  // Calculate High-Level Stats
  const activeCount = projects.filter(p => p.status === "Active").length;
  const totalAllocatedCost = projects.reduce((acc, p) => acc + (p.allocatedCost || 0), 0);
  const uniqueUsersInProjects = new Set(projects.flatMap(p => p.assignedUsers)).size;

  return (
    <Layout title="Projects" subtitle="Allocate licenses to projects & split costs fairly"
      action={<button onClick={() => openModal()} className="bg-gradient-to-r from-amber-400 to-violet-500 hover:from-amber-300 hover:to-violet-400 text-white text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition"><Plus className="w-4 h-4" /> New Project</button>}>

      {/* Stat Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Active Projects" value={activeCount} icon={FolderKanban} />
        <Stat label="Allocated Cost" value={currency(totalAllocatedCost)} icon={Package} accent="amber" />
        <Stat label="Members in Projects" value={uniqueUsersInProjects} icon={UsersIcon} accent="violet" />
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div key={p._id} className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 p-5 group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg text-white font-medium">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description || "No description provided."}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                  p.status === "Active" ? "bg-emerald-500/10 text-emerald-400" :
                  p.status === "Completed" ? "bg-blue-500/10 text-blue-400" : "bg-slate-500/10 text-slate-400"
                }`}>
                  {p.status}
                </span>
              </div>
              
              <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500">Proportional Cost</div>
                  <div className="text-white text-base mt-0.5">{currency(p.allocatedCost || 0)} <span className="text-[10px] text-slate-500">/mo</span></div>
                </div>
                <div>
                  <div className="text-slate-500">Timeline</div>
                  <div className="text-slate-300 mt-0.5">{formatDate(p.startDate)} {p.endDate && `→ ${formatDate(p.endDate)}`}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5" />
                {p.assignedUsers?.length || 0} Members
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openModal(p)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteProject(p._id)} className="p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/New Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0E1320] border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg text-white">{editing === "new" ? "Create Project" : "Edit Project"}</h2>
              <button onClick={() => setEditing(null)} disabled={isSubmitting} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={saveProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500">Project Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition" />
                </div>
                
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition resize-none h-20" />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-500">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition appearance-none">
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-slate-500">Start Date</label>
                    <input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-slate-500">End Date</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="mt-1 w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition" />
                  </div>
                </div>
              </div>

              {/* User Assignment Checklist */}
              <div className="mt-4">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex justify-between">
                  <span>Assign Team Members</span>
                  <span className="text-amber-400">{form.assignedUsers.length} Selected</span>
                </label>
                <div className="max-h-40 overflow-y-auto bg-[#070A11] border border-slate-800 rounded-xl p-2 space-y-1">
                  {workspaceUsers.length === 0 && <div className="text-xs text-slate-500 p-2">No users found.</div>}
                  {workspaceUsers.map((u: any) => (
                    <label key={u._id} className="flex items-center gap-3 text-sm text-slate-300 p-2 hover:bg-slate-800 rounded-lg cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={form.assignedUsers.includes(u._id)} 
                        onChange={(e) => {
                          const updated = e.target.checked 
                            ? [...form.assignedUsers, u._id] 
                            : form.assignedUsers.filter((id: string) => id !== u._id);
                          setForm({...form, assignedUsers: updated});
                        }}
                        className="accent-amber-500 w-4 h-4 rounded"
                      />
                      <span>{u.name} <span className="text-slate-500 text-[10px] ml-1">({u.role})</span></span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">License costs for selected users will be proportionally distributed across their active projects.</p>
              </div>

              <div className="mt-6 flex gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setEditing(null)} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold transition disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Stat({ label, value, icon: Icon, accent = "blue" }: any) {
  const accents: any = { blue: "text-blue-300", amber: "text-amber-300", violet: "text-violet-300" };
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 p-5 flex items-center justify-between shadow-lg">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
        <div className={`font-display text-2xl font-light mt-1 tabular-nums ${accents[accent]}`}>{value}</div>
      </div>
      <Icon className="w-7 h-7 text-slate-500 opacity-50" />
    </div>
  );
}
