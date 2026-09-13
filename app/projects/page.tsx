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
    <Layout 
      title="Projects" 
      subtitle="Allocate licenses to projects & split costs fairly"
      action={
        <button 
          onClick={() => openModal()} 
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      }
    >
      {/* Stat Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Active Projects" value={activeCount} icon={FolderKanban} accent="slate" />
        <Stat label="Allocated Cost" value={currency(totalAllocatedCost)} icon={Package} accent="emerald" />
        <Stat label="Members in Projects" value={uniqueUsersInProjects} icon={UsersIcon} accent="blue" />
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div key={p._id} className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5 group flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description || "No description provided."}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${
                  p.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  p.status === "Completed" ? "bg-blue-50 text-blue-700 border-blue-100" : 
                  "bg-slate-50 text-slate-600 border-slate-200"
                }`}>
                  {p.status}
                </span>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Proportional Cost</div>
                  <div className="text-slate-900 font-bold text-sm">{currency(p.allocatedCost || 0)} <span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Timeline</div>
                  <div className="text-slate-900 font-bold text-sm truncate">{formatDate(p.startDate)} {p.endDate && `→ ${formatDate(p.endDate)}`}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <UsersIcon className="w-4 h-4 text-slate-400" />
                {p.assignedUsers?.length || 0} Members
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openModal(p)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition shadow-sm">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteProject(p._id)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition shadow-sm">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200 shadow-sm">
            No projects found. Add a new project to allocate costs.
          </div>
        )}
      </div>

      {/* Edit/New Modal */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {isSubmitting && (
               <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-sm rounded-3xl">
                 <div className="text-blue-600 font-bold animate-pulse">Saving Project...</div>
               </div>
            )}

            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl text-slate-900 font-bold">{editing === "new" ? "Create Project" : "Edit Project"}</h2>
              <button onClick={() => setEditing(null)} disabled={isSubmitting} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={saveProject} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Project Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none h-24 custom-scrollbar" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Start Date</label>
                    <input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">End Date</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                  </div>
                </div>
              </div>

              {/* User Assignment Checklist */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Assign Team Members
                  </label>
                  <span className="text-xs font-bold text-blue-600">{form.assignedUsers.length} Selected</span>
                </div>
                
                <div className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto custom-scrollbar">
                  {workspaceUsers.length === 0 && <div className="text-xs text-slate-500 p-5 text-center font-medium">No users found.</div>}
                  {workspaceUsers.map((u: any) => (
                    <label key={u._id} className="flex items-center gap-4 p-3.5 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={form.assignedUsers.includes(u._id)} 
                        onChange={(e) => {
                          const updated = e.target.checked 
                            ? [...form.assignedUsers, u._id] 
                            : form.assignedUsers.filter((id: string) => id !== u._id);
                          setForm({...form, assignedUsers: updated});
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 bg-white"
                      />
                      <div>
                        <div className="text-sm text-slate-900 font-bold">{u.name}</div>
                        <div className="text-[11px] font-medium text-slate-500">{u.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] font-medium text-slate-500 mt-2">License costs for selected users will be proportionally distributed across their active projects.</p>
              </div>

              <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditing(null)} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50">
                  {isSubmitting ? 'Saving Project...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Stat({ label, value, icon: Icon, accent = "slate" }: any) {
  const accents: any = { 
    slate: "text-slate-900", 
    emerald: "text-emerald-600", 
    blue: "text-blue-600" 
  };
  
  return (
    <div className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5 flex items-center justify-between hover:shadow-md transition">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
        <div className={`font-display text-2xl font-black mt-1 tabular-nums ${accents[accent]}`}>{value}</div>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
    </div>
  );
}
