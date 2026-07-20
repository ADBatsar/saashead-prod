"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/workspace/Layout";
import VendorBadge from "@/components/workspace/VendorBadge";
import { HealthDot } from "@/components/workspace/StatusChip";

import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { currency, formatDate } from "@/lib/utils";

// --- CONSTANTS ---
const CATEGORIES = ["Productivity", "Development", "Security", "Design", "HR", "Finance", "Marketing"];
const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Executive"];

const HEALTH_LABEL = {
  healthy: "Healthy",
  underutilized: "Underutilized",
  waste: "Waste",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "healthy", label: "Healthy" },
  { key: "underutilized", label: "Underutilized" },
  { key: "waste", label: "Waste" },
];

// --- INTERFACES ---
interface Application {
  id: string;
  name: string;
  vendor: string;
  vendorId?: string;            // Added for combo-box
  isAddingNewVendor?: boolean;  // Added for combo-box
  newVendorName?: string;       // Added for combo-box
  category: string;
  department: string;
  seats_total: number;
  seats_used: number;
  monthly_cost: number;
  renewal_date: string;
  health: "healthy" | "underutilized" | "waste";
  
  billingCycle: string;
  cycle_cost: number;
  assignedTo: string[];
}

const EMPTY: Application = {
  id: "",
  name: "",
  vendor: "",
  vendorId: "",
  isAddingNewVendor: false,
  newVendorName: "",
  category: CATEGORIES[0],
  department: DEPARTMENTS[0],
  seats_total: 1,
  seats_used: 0,
  monthly_cost: 0,
  renewal_date: "",
  health: "healthy",
  billingCycle: "monthly",
  cycle_cost: 0,
  assignedTo: []
};

// 1. Extracted Field component
const Field = ({ label, name, type = "text", form, setForm, disabled, min }: any) => (
  <div>
    <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">{label}</label>
    <input
      type={type}
      min={min}
      value={form[name] || ""} 
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      disabled={disabled}
      className={`w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60 transition ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  </div>
);

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]); // New Vendors state
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Application | "new" | null>(null);
  const [form, setForm] = useState<Application>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [appRes, userRes, vendorRes] = await Promise.all([
        fetch("/api/licenses"),
        fetch("/api/users"),
        fetch("/api/vendors") // Fetch vendors for dropdown
      ]);
      
      const appJson = await appRes.json();
      const userJson = await userRes.ok ? await userRes.json() : [];
      const vendorJson = await vendorRes.json().catch(() => ({}));
      
      const appRows = Array.isArray(appJson) ? appJson : appJson.data || appJson.licenses || [];
      const userRows = Array.isArray(userJson) ? userJson : userJson.users || [];
      const vendorRows = vendorJson.success ? vendorJson.data : [];
      
      setWorkspaceUsers(userRows);
      setVendors(vendorRows);

      const mapped: Application[] = appRows.map((l: any) => {
        const total = l.licenseCount || 1;
        const assignedArray = l.assignedTo || [];
        const used = assignedArray.length > 0 ? assignedArray.length : (l.assignedUsers || 0);
        
        const pct = total > 0 ? used / total : 0;
        let health: "healthy" | "underutilized" | "waste" = "healthy";

        if (pct < 0.4) health = "waste";
        else if (pct < 0.8) health = "underutilized";

        const cycle = l.billingCycle || "monthly";
        const cycleCost = cycle === "yearly" ? (l.costPerLicense * 12) : l.costPerLicense;

        return {
          id: l._id,
          name: l.applicationName,
          vendor: l.vendorName || l.vendor,
          vendorId: l.vendorId || "",
          category: l.category || CATEGORIES[0],
          department: l.department || DEPARTMENTS[0],
          seats_total: total,
          seats_used: used,
          monthly_cost: l.costPerLicense || 0,
          renewal_date: l.renewalDate ? new Date(l.renewalDate).toISOString().split('T')[0] : "",
          health,
          billingCycle: cycle,
          cycle_cost: cycleCost,
          assignedTo: assignedArray
        };
      });

      setApps(mapped);
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const okFilter = filter === "all" || a.health === filter;
      const q = query.toLowerCase();
      const okSearch = q === "" || a.name.toLowerCase().includes(q) || a.vendor.toLowerCase().includes(q);
      return okFilter && okSearch;
    });
  }, [apps, filter, query]);

  function open(app?: Application) {
    if (app) {
      // Find matching vendor ID if missing
      let vId = app.vendorId;
      if (!vId) {
        const match = vendors.find(v => v.name === app.vendor);
        if (match) vId = match._id;
      }
      setEditing(app);
      setForm({ ...app, vendorId: vId || "", isAddingNewVendor: false, newVendorName: "" });
    } else {
      setEditing("new");
      setForm({ ...EMPTY });
    }
  }

  async function remove(id: string) {
    if (!id || id === "undefined") {
      alert("Error: Invalid Application ID.");
      return;
    }

    if (!confirm("Are you sure you want to delete this application?")) return;
    
    try {
      const res = await fetch(`/api/licenses/${id}`, { method: "DELETE" });
      if (!res.ok) {
         const errData = await res.json().catch(() => ({}));
         throw new Error(errData.message || "Failed to delete");
      }
      await loadData(); 
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(error.message); 
    }
  }

  async function save() {
    setIsSubmitting(true);

    try {
      let finalVendorName = "";
      let finalVendorId = "";

      // 1. Resolve Combo-Box Vendor Selection
      if (form.isAddingNewVendor) {
        if (!form.newVendorName?.trim()) throw new Error("Please enter a name for the new vendor.");
        
        // Create the new vendor in the database first
        const vRes = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.newVendorName })
        });
        const vData = await vRes.json();
        
        if (!vRes.ok) throw new Error(vData.message || "Failed to create new vendor");
        
        finalVendorId = vData.data._id;
        finalVendorName = vData.data.name;
      } else {
        if (!form.vendorId) throw new Error("Please select a vendor from the list or add a new one.");
        
        const selected = vendors.find(v => v._id === form.vendorId);
        if (!selected) throw new Error("Selected vendor not found.");
        
        finalVendorId = selected._id;
        finalVendorName = selected.name;
      }

      // 2. Calculate costs
      const calculated_monthly_cost = form.billingCycle === "yearly" 
        ? Number(form.cycle_cost) / 12 
        : Number(form.cycle_cost);

      // 3. Build payload strictly satisfying Mongoose requirements
      const payload = {
        applicationName: form.name,
        vendor: finalVendorName,     
        vendorName: finalVendorName, // Solves the "Path `vendorName` is required" error
        vendorId: finalVendorId,     // The relational link
        category: form.category,
        department: form.department,
        licenseCount: Number(form.seats_total),
        assignedUsers: form.assignedTo.length, 
        assignedTo: form.assignedTo,            
        costPerLicense: calculated_monthly_cost, 
        billingCycle: form.billingCycle,
        renewalDate: form.renewal_date || new Date().toISOString()
      };

      // 4. Save the Application
      const url = editing === "new" ? "/api/licenses" : `/api/licenses/${form.id}`;
      const method = editing === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save application");
      }

      await loadData();
      setEditing(null);

    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Error saving application. Check terminal for details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout
      title="Applications"
      subtitle="All SaaS products in your stack"
      action={
        <button
          onClick={() => open()}
          className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-900/30"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      }
    >
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1 bg-[#0E1320] border border-slate-800 rounded-xl p-1">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                filter === t.key
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#0E1320] border border-slate-800 rounded-xl px-3 py-2 w-72">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600 flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((a) => {
          const usagePct = a.seats_total > 0 ? Math.round((a.seats_used / a.seats_total) * 100) : 0;
          const healthColor = a.health === "healthy" ? "bg-emerald-400" : a.health === "underutilized" ? "bg-amber-400" : "bg-rose-400";
          const totalMonthlyCost = a.seats_total * a.monthly_cost; 

          return (
            <div key={a.id} className="relative rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 hover:bg-[#101729] p-5 transition group overflow-hidden">
              <span className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full shadow-[0_0_10px] ${healthColor}`} />
              <div className="flex items-center gap-3">
                <VendorBadge name={a.vendor} size={42} />
                <div className="min-w-0">
                  <div className="font-display text-white text-base truncate">{a.name}</div>
                  <div className="text-[11px] text-slate-500">{a.vendor} · {a.category}</div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Seats used</span>
                  <span className="text-slate-300 tabular-nums">{a.seats_used} / {a.seats_total}</span>
                </div>
                <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${healthColor}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500">Total Monthly Cost</div>
                  <div className="text-white text-sm tabular-nums">{currency(totalMonthlyCost)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Renewal</div>
                  <div className="text-white text-sm">{formatDate(a.renewal_date)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Department</div>
                  <div className="text-slate-300 text-sm">{a.department}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="flex items-center gap-1.5">
                    <HealthDot health={a.health} />
                    <span className="text-slate-300 text-sm">{HEALTH_LABEL[a.health]}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button onClick={() => open(a)} className="flex-1 text-xs py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => remove(a.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-slate-500 text-sm py-12 col-span-full text-center">No applications found.</div>
        )}
      </div>

      {editing && (
        <AppModal
          form={form}
          setForm={setForm}
          users={workspaceUsers}
          vendors={vendors}
          onClose={() => setEditing(null)}
          onSave={save}
          isNew={editing === "new"}
          isSubmitting={isSubmitting}
        />
      )}
    </Layout>
  );
}

// --- MODAL COMPONENT ---

interface ModalProps {
  form: Application;
  setForm: React.Dispatch<React.SetStateAction<Application>>;
  users: any[];
  vendors: any[];
  onClose: () => void;
  onSave: () => void;
  isNew: boolean;
  isSubmitting?: boolean;
}

function AppModal({ form, setForm, users, vendors, onClose, onSave, isNew, isSubmitting = false }: ModalProps) {
  
  const handleUserToggle = (userId: string) => {
    setForm(prev => {
      const isSelected = prev.assignedTo.includes(userId);
      return {
        ...prev,
        assignedTo: isSelected 
          ? prev.assignedTo.filter(id => id !== userId)
          : [...prev.assignedTo, userId]
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={!isSubmitting ? onClose : undefined}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-[#0E1320] border border-slate-800 rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {isSubmitting && (
           <div className="absolute inset-0 bg-[#0E1320]/50 rounded-2xl flex items-center justify-center z-10 backdrop-blur-[2px]">
             <div className="text-blue-400 text-sm font-medium animate-pulse">Saving...</div>
           </div>
        )}

        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-display text-lg text-white">{isNew ? "Add Application" : "Edit Application"}</h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <Field label="Application Name" name="name" form={form} setForm={setForm} disabled={isSubmitting} />
            
            {/* Smart Combo-Box Vendor Field */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">Vendor</label>
              <select
                value={form.isAddingNewVendor ? "NEW" : (form.vendorId || "")}
                onChange={(e) => {
                  if (e.target.value === "NEW") {
                    setForm({ ...form, isAddingNewVendor: true, vendorId: "" });
                  } else {
                    setForm({ ...form, isAddingNewVendor: false, vendorId: e.target.value });
                  }
                }}
                disabled={isSubmitting}
                className="w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60 transition appearance-none"
              >
                <option value="" disabled>Select a vendor...</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>{v.name}</option>
                ))}
                <option value="NEW" className="font-bold text-blue-400">+ Add New Vendor</option>
              </select>

              {/* Conditional Input for New Vendor */}
              {form.isAddingNewVendor && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                  <input
                    type="text"
                    placeholder="Enter new vendor name"
                    value={form.newVendorName || ""}
                    onChange={(e) => setForm({ ...form, newVendorName: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full bg-[#070A11] border border-blue-500/60 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60 transition"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} disabled={isSubmitting} className="w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} disabled={isSubmitting} className="w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-[#070A11]/50 border border-slate-800/80 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Billing & Term</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">Billing Cycle</label>
                <select value={form.billingCycle} onChange={e => setForm({...form, billingCycle: e.target.value})} disabled={isSubmitting} className="w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">
                  {form.billingCycle === 'yearly' ? 'Total Yearly Cost ($)' : 'Cost Per Month ($)'}
                </label>
                <input type="number" min="0" value={form.cycle_cost || ""} onChange={e => setForm({...form, cycle_cost: Number(e.target.value)})} disabled={isSubmitting} className="w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60" />
              </div>
              <Field label="Renewal Date" name="renewal_date" type="date" form={form} setForm={setForm} disabled={isSubmitting} />
            </div>
            {form.billingCycle === "yearly" && form.cycle_cost > 0 && (
               <div className="mt-3 text-xs text-blue-400 text-right font-medium">
                 Monthly Dashboard Impact: {currency(form.cycle_cost / 12)} /mo
               </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] uppercase tracking-wider text-slate-500 block">
                Assign Licenses ({form.assignedTo.length} of {form.seats_total} used)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Total Seats:</span>
                <input type="number" min="1" value={form.seats_total} onChange={e => setForm({...form, seats_total: Number(e.target.value)})} className="bg-[#070A11] border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none w-16 text-center" />
              </div>
            </div>
            
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#070A11] max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No workspace users available to assign.</div>
              ) : (
                users.map(user => {
                  const uid = user._id || user.id;
                  const isAssigned = form.assignedTo.includes(uid);
                  const isFull = !isAssigned && form.assignedTo.length >= form.seats_total;
                  
                  return (
                    <label key={uid} className={`flex items-center gap-3 p-3 border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer ${isFull ? 'opacity-40 cursor-not-allowed' : ''} transition`}>
                      <input 
                        type="checkbox" 
                        checked={isAssigned}
                        disabled={isFull || isSubmitting}
                        onChange={() => handleUserToggle(uid)}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600 bg-[#0E1320]"
                      />
                      <div>
                        <div className="text-sm text-white font-medium">{user.name || user.email}</div>
                        <div className="text-[11px] text-slate-500">{user.role}</div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            {form.assignedTo.length >= form.seats_total && (
              <p className="text-xs text-amber-500 mt-2">All available seats have been assigned. Increase Total Seats to add more.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-[#0E1320] rounded-b-2xl">
          <button onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 shadow-lg shadow-blue-900/20 text-white text-sm font-medium transition disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
