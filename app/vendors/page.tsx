"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/workspace/Layout";
import { Plus, X, Pencil, Trash2, Mail, User as UserIcon, Globe, ShieldAlert, Phone } from "lucide-react";
import { currency } from "@/lib/utils";

const EMPTY = { name: "", website: "", contactName: "", contactEmail: "", contactPhone: "", status: "Active" };

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [venRes, licRes] = await Promise.all([
        fetch("/api/vendors"),
        fetch("/api/licenses")
      ]);
      const venJson = await venRes.json();
      const licJson = await licRes.json();
      
      if (venJson.success) setVendors(venJson.data);
      if (licJson.success || Array.isArray(licJson.data)) {
        setLicenses(Array.isArray(licJson.data) ? licJson.data : licJson);
      }
    } catch (error) {
      console.error("Failed to load vendor data", error);
    }
  }

  // Calculate dynamic metrics for each vendor
  const enrichedVendors = vendors.map(v => {
    // Fallback to name matching if vendorId isn't perfectly migrated yet
    const vendorApps = licenses.filter(l => l.vendorId === v._id || l.vendor?.toLowerCase() === v.name.toLowerCase());
    
    const annualSpend = vendorApps.reduce((acc, app) => {
      const cost = (app.costPerLicense || 0) * (app.licenseCount || 0);
      return acc + (app.billingCycle === "yearly" ? cost : cost * 12);
    }, 0);

    return {
      ...v,
      apps_count: vendorApps.length,
      annual_cost: annualSpend,
      apps: vendorApps // Store the actual apps for the details pane
    };
  });

  const open = (v: any) => { 
    if (v) { 
      setEditing(v); 
      setForm({ ...v }); 
    } else { 
      setEditing("new"); 
      setForm(EMPTY); 
    } 
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editing === "new" ? "/api/vendors" : `/api/vendors/${editing._id}`;
      const method = editing === "new" ? "POST" : "PUT";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error("Failed to save vendor");
      
      await loadData();
      setEditing(null);
      // Update selected state if we were editing the currently viewed vendor
      if (editing !== "new" && selected?._id === editing._id) {
        setSelected({ ...selected, ...form });
      }
    } catch (error) {
      alert("Error saving vendor");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function remove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this vendor? This will not delete the applications attached to it.")) return;
    try {
      await fetch(`/api/vendors/${id}`, { method: "DELETE" });
      if (selected?._id === id) setSelected(null);
      await loadData();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  }

  return (
    <Layout title="Vendors" subtitle="Procurement view of contracts & vendor relationships"
      action={<button onClick={() => open(null)} className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition shadow-lg shadow-blue-900/20"><Plus className="w-4 h-4" /> Add Vendor</button>}>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* LEFT PANE: Vendor Table */}
        <div className="lg:col-span-2 rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5]/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111728] border-b border-amber-200/60 shadow-sm">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium">Annual Spend</th>
                  <th className="px-6 py-4 font-medium">Active Apps</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {enrichedVendors.map((v: any) => (
                  <tr key={v._id} onClick={() => setSelected(v)} className={`hover:bg-amber-50 cursor-pointer transition ${selected?._id === v._id ? "bg-blue-500/10" : ""}`}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div>
                        <span className="text-slate-900 font-bold font-medium block">{v.name}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${v.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>{v.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium font-medium">{currency(v.annual_cost)}</td>
                    <td className="px-6 py-4 text-slate-600">{v.apps_count} Apps</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); open(v); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-600 font-medium transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => remove(v._id, e)} className="p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {enrichedVendors.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No vendors added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANE: Vendor Details */}
        <div className="rounded-2xl border border-amber-200/60 shadow-sm bg-[#FFFCF5]/80 p-6 shadow-xl h-fit sticky top-24">
          {selected ? (
             <div className="animate-fade-up">
               <div className="flex items-center gap-4 mb-6">
                 <div>
                   <h2 className="font-display text-xl text-slate-900 font-bold font-medium">{selected.name}</h2>
                   <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                     <Globe className="w-3.5 h-3.5" /> {selected.website || "No website added"}
                   </div>
                 </div>
               </div>

               <div className="space-y-4 mb-6">
                 <div className="bg-[#FFFCF5] border border-slate-800/60 rounded-xl p-4">
                   <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total Annual Spend</div>
                   <div className="text-2xl text-slate-900 font-bold font-display font-light">{currency(selected.annual_cost)}</div>
                 </div>

                 <div className="bg-[#FFFCF5] border border-slate-800/60 rounded-xl p-4 space-y-3">
                   <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 border-b border-amber-200/60 shadow-sm pb-2">Primary Contact</div>
                   <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                     <UserIcon className="w-4 h-4 text-slate-500" /> {selected.contactName || "Unassigned"}
                   </div>
                   <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                     <Mail className="w-4 h-4 text-slate-500" /> {selected.contactEmail || "Unassigned"}
                   </div>
                   <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                     <Phone className="w-4 h-4 text-slate-500" /> {selected.contactPhone || "Unassigned"}
                   </div>
                 </div>
               </div>

               <div>
                 <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3 pl-1">Associated Applications ({selected.apps_count})</div>
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                   {selected.apps?.length > 0 ? selected.apps.map((app: any) => (
                     <div key={app._id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-slate-800/40">
                       <span className="text-sm text-slate-900 font-bold">{app.applicationName}</span>
                       <span className="text-xs text-slate-500">{app.licenseCount} Seats</span>
                     </div>
                   )) : (
                     <div className="text-xs text-slate-500 flex items-center gap-2 p-3"><ShieldAlert className="w-4 h-4"/> No applications currently linked.</div>
                   )}
                 </div>
               </div>
             </div>
          ) : (
            <div className="text-sm text-slate-500 py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              </div>
              Select a vendor from the list to view their procurement details.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg text-slate-900 font-bold">{editing === "new" ? "Add Vendor" : "Edit Vendor"}</h2>
              <button onClick={() => setEditing(null)} disabled={isSubmitting} className="text-slate-600 hover:text-slate-900 font-bold transition"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Vendor Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500 transition" placeholder="e.g. Amazon Web Services" />
              </div>
              
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Website</label>
                <input type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="w-full bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500 transition" placeholder="https://" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Contact Name</label>
                  <input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500 transition" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Contact Email</label>
                  <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500 transition" placeholder="jane@vendor.com" />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Contact Phone</label>
                <input type="tel" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500 transition" placeholder="+1 (555) 000-0000" />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-[#FFFCF5] border border-amber-200/60 shadow-sm rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500 transition appearance-none">
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div className="mt-6 flex gap-3 pt-4 border-t border-amber-200/60 shadow-sm">
                <button type="button" onClick={() => setEditing(null)} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-600 font-medium text-sm transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-sm font-medium transition disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
