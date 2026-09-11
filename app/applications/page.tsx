"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/workspace/Layout";
import { HealthDot } from "@/components/workspace/StatusChip";
import { Plus, Search, Pencil, Trash2, X, UploadCloud, Phone, Mail, User as UserIcon, Globe, AlertCircle } from "lucide-react";
import { currency, formatDate } from "@/lib/utils";

const CATEGORIES = ["Productivity", "Development", "Security", "Design", "HR", "Finance", "Marketing"];
const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Executive"];

const HEALTH_LABEL: Record<string, string> = {
  healthy: "Healthy",
  underutilized: "Underutilized",
  unused: "Unused",
  new: "Newly Added",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "healthy", label: "Healthy" },
  { key: "underutilized", label: "Underutilized" },
  { key: "unused", label: "Unused" },
  { key: "new", label: "Newly Added" },
];

interface Application {
  id: string;
  name: string;
  invoiceId: string;
  vendor: string;
  vendorId?: string;
  category: string;
  department: string;
  status: "active" | "inactive";
  seats_total: number;
  seats_used: number;
  monthly_cost: number;
  renewal_date: string;
  health: "healthy" | "underutilized" | "unused" | "new";
  billingCycle: string;
  cycle_cost: number;
  assignedTo: string[];
}

const EMPTY: Application = {
  id: "", name: "", invoiceId: "", vendor: "", vendorId: "",
  category: CATEGORIES[0], department: DEPARTMENTS[0], status: "active", seats_total: 1, seats_used: 0,
  monthly_cost: 0, renewal_date: "", health: "healthy", billingCycle: "monthly", cycle_cost: 0, assignedTo: []
};

const EMPTY_VENDOR = {
  name: "", website: "", contactName: "", contactEmail: "", contactPhone: "", status: "Active"
};

const Field = ({ label, name, type = "text", form, setForm, disabled, min, placeholder }: any) => (
  <div>
    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">{label}</label>
    <input
      type={type} min={min} value={form[name] || ""} placeholder={placeholder}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })} disabled={disabled}
      className={`w-full bg-white border border-amber-200/60 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-sm transition ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  </div>
);

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]); 
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Application | "new" | null>(null);
  const [form, setForm] = useState<Application>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [appRes, userRes, vendorRes] = await Promise.all([
        fetch("/api/licenses"), fetch("/api/users"), fetch("/api/vendors") 
      ]);
      const appJson = await appRes.json();
      const userJson = userRes.ok ? await userRes.json() : [];
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
        let health: "healthy" | "underutilized" | "unused" | "new" = "healthy";

        const createdDate = new Date(l.createdAt || new Date());
        const daysOld = (new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24);

        if (daysOld <= 7) {
          health = "new"; 
        } else if (pct < 0.4) {
          health = "unused"; 
        } else if (pct < 0.8) {
          health = "underutilized";
        }

        const cycle = l.billingCycle || "monthly";
        const cycleCost = l.costPerLicense || 0; 
        const monthlyCost = cycle === "yearly" ? (cycleCost / 12) : cycleCost;

        return {
          id: l._id, name: l.applicationName, invoiceId: l.invoiceId || "", vendor: l.vendorName || l.vendor, vendorId: l.vendorId || "",
          category: l.category || CATEGORIES[0], department: l.department || DEPARTMENTS[0],
          status: l.status || "active",
          seats_total: total, seats_used: used, monthly_cost: monthlyCost,
          renewal_date: l.renewalDate ? new Date(l.renewalDate).toISOString().split('T')[0] : "",
          health, billingCycle: cycle, cycle_cost: cycleCost, assignedTo: assignedArray
        };
      });
      setApps(mapped);
    } catch (err) { console.error(err); }
  }

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const okFilter = filter === "all" || a.health === filter;
      const q = query.toLowerCase();
      const okSearch = q === "" || a.name.toLowerCase().includes(q) || a.vendor?.toLowerCase().includes(q);
      return okFilter && okSearch;
    });
  }, [apps, filter, query]);

  function open(app?: Application) {
    if (app) {
      let vId = app.vendorId;
      if (!vId) {
        const match = vendors.find(v => v.name === app.vendor);
        if (match) vId = match._id;
      }
      setEditing(app);
      setForm({ ...app, vendorId: vId || "" });
    } else {
      setEditing("new");
      setForm({ ...EMPTY });
    }
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`/api/licenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadData(); 
    } catch (error: any) { alert(error.message); }
  }

  async function save() {
    setIsSubmitting(true);
    try {
      if (!form.vendorId) throw new Error("Please select or add a vendor.");
      const selectedVendor = vendors.find(v => v._id === form.vendorId);
      const finalVendorName = selectedVendor ? selectedVendor.name : form.vendor;

      const payload = {
        applicationName: form.name, invoiceId: form.invoiceId, vendor: finalVendorName, vendorName: finalVendorName, vendorId: form.vendorId,     
        category: form.category, department: form.department, status: form.status, licenseCount: Number(form.seats_total),
        assignedUsers: form.assignedTo.length, assignedTo: form.assignedTo,            
        costPerLicense: Number(form.cycle_cost), 
        billingCycle: form.billingCycle,
        renewalDate: form.renewal_date || new Date().toISOString()
      };

      const url = editing === "new" ? "/api/licenses" : `/api/licenses/${form.id}`;
      const res = await fetch(url, {
        method: editing === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      // Catch MongoDB Duplicate Key Error (11000) for Invoice ID
      if (!res.ok) {
        if (data.message?.includes("11000") || data.message?.includes("duplicate")) {
          throw new Error("This Invoice / Document ID has already been uploaded to another application. Duplicates are not allowed.");
        }
        throw new Error(data.message || "Failed to save application");
      }
      
      await loadData();
      setEditing(null);
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setIsSubmitting(false); 
    }
  }

  return (
    <Layout
      title="Applications"
      subtitle="All SaaS products in your stack"
      action={
        <button onClick={() => open()} className="bg-slate-900 hover:bg-black text-white text-sm px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition">
          <Plus className="w-4 h-4" /> Add Application
        </button>
      }
    >
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1 bg-[#FFFCF5] border border-amber-200/60 rounded-xl p-1 shadow-sm">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-1.5 text-xs rounded-lg transition-all ${
                filter === t.key ? "bg-violet-100/80 text-violet-700 font-bold border border-violet-200/50 shadow-sm" : "text-slate-500 font-medium hover:bg-amber-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#FFFCF5] border border-amber-200/60 rounded-xl px-4 py-2 w-80 shadow-sm focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps or vendors..."
            className="bg-transparent outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((a) => {
          const usagePct = a.seats_total > 0 ? Math.round((a.seats_used / a.seats_total) * 100) : 0;
          
          const healthColor = 
            a.health === "healthy" ? "bg-emerald-500" : 
            a.health === "underutilized" ? "bg-amber-500" : 
            a.health === "new" ? "bg-blue-500" : 
            "bg-rose-500"; 
            
          const totalMonthlyCost = a.seats_total * a.monthly_cost; 

          return (
            <div key={a.id} className="relative rounded-2xl border border-amber-200/60 bg-[#FFFCF5] shadow-sm hover:border-amber-300 transition-all group overflow-hidden p-6">
              <span className={`absolute top-6 right-6 w-2.5 h-2.5 rounded-full shadow-sm ${healthColor}`} />
              
              {a.status === "inactive" && (
                <div className="absolute top-5 right-12 bg-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Inactive
                </div>
              )}

              <div className="mb-6 pr-6">
                <div className="font-bold text-slate-900 text-xl truncate">{a.name}</div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">{a.vendor} · {a.category}</div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  <span>Seats used</span>
                  <span className="text-slate-900 tabular-nums">{a.seats_used} / {a.seats_total}</span>
                </div>
                <div className="h-2 bg-amber-100/50 rounded-full overflow-hidden border border-amber-200/30">
                  <div className={`h-full ${healthColor}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Total Monthly Cost</div>
                  <div className="text-slate-900 font-bold text-sm tabular-nums">{currency(totalMonthlyCost)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Renewal</div>
                  <div className="text-slate-900 font-bold text-sm">{formatDate(a.renewal_date)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Invoice ID</div>
                  <div className="text-slate-900 font-bold text-sm truncate">{a.invoiceId || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Status</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${healthColor}`} />
                    <span className="text-slate-900 font-bold text-sm">{HEALTH_LABEL[a.health]}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 pt-5 border-t border-amber-200/60">
                <button onClick={() => open(a)} className="flex-1 text-xs font-bold py-2.5 rounded-xl bg-white border border-amber-200/60 hover:bg-amber-50 text-slate-700 flex items-center justify-center gap-1.5 transition shadow-sm">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => remove(a.id)} className="p-2.5 rounded-xl border border-transparent text-slate-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-slate-500 font-medium text-sm py-12 col-span-full text-center">No applications found.</div>}
      </div>

      {editing && (
        <AppModal
          form={form}
          setForm={setForm}
          users={workspaceUsers}
          vendors={vendors}
          setVendors={setVendors}
          onClose={() => setEditing(null)}
          onSave={save}
          isNew={editing === "new"}
          isSubmitting={isSubmitting}
        />
      )}
    </Layout>
  );
}

function AppModal({ form, setForm, users, vendors, setVendors, onClose, onSave, isNew, isSubmitting = false }: any) {
  const [parsing, setParsing] = useState(false);
  const [vendorResolution, setVendorResolution] = useState<any>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState(EMPTY_VENDOR);
  const [isSavingVendor, setIsSavingVendor] = useState(false);

  const handleUserToggle = (userId: string) => {
    setForm((prev: any) => {
      const isSelected = prev.assignedTo.includes(userId);
      return { ...prev, assignedTo: isSelected ? prev.assignedTo.filter((id: string) => id !== userId) : [...prev.assignedTo, userId] };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/contracts/parse", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || "Failed to parse document");

      if (data.match && data.appDetails) {
        const parsedVendor = data.appDetails.vendorName || "";
        const existingVendor = vendors.find((v: any) => v.name.toLowerCase() === parsedVendor.toLowerCase());
        const uploadStatus = data.appDetails.isExpired ? "inactive" : "active";

        const updateStateObj = {
            name: data.appDetails.name || form.name,
            invoiceId: data.appDetails.invoiceId || form.invoiceId,
            billingCycle: data.appDetails.billingCycle || form.billingCycle,
            seats_total: data.appDetails.seats_total || form.seats_total,
            cycle_cost: data.appDetails.cost || form.cycle_cost,
            renewal_date: data.appDetails.renewalDate || form.renewal_date,
            status: uploadStatus
        };

        if (existingVendor) {
          setForm((prev: any) => ({
            ...prev,
            ...updateStateObj,
            vendorId: existingVendor._id,
            vendor: existingVendor.name
          }));
        } else if (parsedVendor) {
          setVendorResolution(data.appDetails);
          setForm((prev: any) => ({
            ...prev,
            ...updateStateObj
          }));
        } else {
           setForm((prev: any) => ({
            ...prev,
            ...updateStateObj
          }));
        }
      }
    } catch (err: any) {
      alert("Contract Rejected: " + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) {
      alert("Vendor name is required.");
      return;
    }

    setIsSavingVendor(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create vendor");

      const created = data.data;
      setVendors((prev: any[]) => [...prev, created]);
      setForm((prev: any) => ({
        ...prev,
        vendorId: created._id,
        vendor: created.name
      }));

      setShowVendorModal(false);
      setVendorForm(EMPTY_VENDOR);
    } catch (err: any) {
      alert("Error saving vendor: " + err.message);
    } finally {
      setIsSavingVendor(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={!isSubmitting ? onClose : undefined}>
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-[#FFFCF5] border border-amber-200/60 rounded-3xl shadow-2xl relative max-h-[90vh] flex flex-col">
          
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/60 rounded-3xl flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="text-violet-600 font-bold animate-pulse flex items-center gap-2">Saving Application...</div>
            </div>
          )}

          <div className="flex items-center justify-between p-6 border-b border-amber-200/60 bg-white/50 rounded-t-3xl">
            <h2 className="font-bold text-xl text-slate-900">{isNew ? "Add Application" : "Edit Application"}</h2>
            <button onClick={onClose} disabled={isSubmitting} className="p-2 rounded-xl hover:bg-amber-100/50 text-slate-400 hover:text-slate-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            <div className="bg-white border-2 border-dashed border-amber-200 rounded-2xl p-6 text-center hover:bg-amber-50/50 transition relative">
              <input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={parsing || isSubmitting} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <UploadCloud className={`w-8 h-8 mb-2 ${parsing ? 'text-violet-500 animate-bounce' : 'text-slate-400'}`} />
                <p className="text-sm font-bold text-slate-900">{parsing ? "Scanning Contract..." : "Upload existing PO/invoice"}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Auto-extract app name, cost, renewal date & vendor details</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Application Name" name="name" form={form} setForm={setForm} disabled={isSubmitting} />
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Vendor</label>
                  <button
                    type="button"
                    onClick={() => {
                      setVendorForm(EMPTY_VENDOR);
                      setShowVendorModal(true);
                    }}
                    disabled={isSubmitting}
                    className="text-[11px] font-bold text-violet-600 hover:text-violet-700 transition"
                  >
                    + Add New
                  </button>
                </div>

                <select
                  value={form.vendorId || ""}
                  onChange={(e) => {
                    if (e.target.value === "NEW") {
                      setVendorForm(EMPTY_VENDOR);
                      setShowVendorModal(true);
                    } else {
                      const selected = vendors.find((v: any) => v._id === e.target.value);
                      setForm({ ...form, vendorId: e.target.value, vendor: selected ? selected.name : "" });
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                >
                  <option value="" disabled>Select a vendor...</option>
                  {vendors.map((v: any) => <option key={v._id} value={v._id}>{v.name}</option>)}
                  <option value="NEW" className="font-bold text-violet-600">+ Add New Vendor (Pop-up)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} disabled={isSubmitting} className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Department</label>
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} disabled={isSubmitting} className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">App Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} disabled={isSubmitting} className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Billing & Term</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Billing Cycle</label>
                  <select value={form.billingCycle} onChange={e => setForm({...form, billingCycle: e.target.value})} disabled={isSubmitting} className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">
                    {form.billingCycle === 'yearly' ? 'Total Yearly Cost ($)' : 'Cost Per Month ($)'}
                  </label>
                  <input type="number" min="0" value={form.cycle_cost || ""} onChange={e => setForm({...form, cycle_cost: Number(e.target.value)})} disabled={isSubmitting} className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Invoice / Contract ID" name="invoiceId" placeholder="e.g. INV-2024-001" form={form} setForm={setForm} disabled={isSubmitting} />
                <Field label="Renewal Date" name="renewal_date" type="date" form={form} setForm={setForm} disabled={isSubmitting} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Assign Licenses ({form.assignedTo.length} of {form.seats_total} used)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold uppercase">Total Seats:</span>
                  <input type="number" min="1" value={form.seats_total} onChange={e => setForm({...form, seats_total: Number(e.target.value)})} className="bg-white border border-amber-200/60 shadow-sm rounded-lg px-2 py-1 text-sm font-bold text-slate-900 outline-none w-16 text-center focus:border-violet-500" />
                </div>
              </div>
              
              <div className="border border-amber-200/60 shadow-sm rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto custom-scrollbar">
                {users.length === 0 ? (
                  <div className="p-5 text-center text-sm font-medium text-slate-500">No workspace users available.</div>
                ) : (
                  users.map((user: any) => {
                    const uid = user._id || user.id;
                    const isAssigned = form.assignedTo.includes(uid);
                    const isFull = !isAssigned && form.assignedTo.length >= form.seats_total;
                    
                    return (
                      <label key={uid} className={`flex items-center gap-4 p-3.5 border-b border-amber-100/50 hover:bg-amber-50 cursor-pointer ${isFull ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}>
                        <input 
                          type="checkbox" checked={isAssigned} disabled={isFull || isSubmitting} onChange={() => handleUserToggle(uid)}
                          className="w-4 h-4 rounded border-amber-300 text-violet-600 focus:ring-violet-600 bg-white"
                        />
                        <div>
                          <div className="text-sm text-slate-900 font-bold">{user.name || user.phone}</div>
                          <div className="text-[11px] font-medium text-slate-500">{user.role}</div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-amber-200/60 flex justify-end gap-3 bg-amber-50/30 rounded-b-3xl">
            <button onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-white border border-amber-200/60 hover:bg-amber-50 text-slate-700 text-sm font-bold shadow-sm transition">Cancel</button>
            <button onClick={onSave} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black shadow-md text-white text-sm font-bold transition">
              {isSubmitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </div>
      </div>

      {/* NEW: VENDOR RESOLUTION MODAL (Appears if AI finds an unknown vendor) */}
      {vendorResolution && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
           <div className="bg-[#FFFCF5] p-7 rounded-3xl shadow-2xl max-w-md w-full border border-amber-200/60 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
                <h3 className="font-display font-bold text-xl text-slate-900">Unrecognized Vendor</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                 We found <strong className="text-slate-900">{vendorResolution.vendorName}</strong> on the invoice, but it doesn't match any vendor in your system. What would you like to do?
              </p>
              
              <div className="space-y-4">
                 <button onClick={() => {
                    setVendorForm({
                       name: vendorResolution.vendorName,
                       website: vendorResolution.website || "",
                       contactName: vendorResolution.contactName || "",
                       contactEmail: vendorResolution.contactEmail || "",
                       contactPhone: vendorResolution.contactPhone || "",
                       status: "Active"
                    });
                    setShowVendorModal(true);
                    setVendorResolution(null);
                 }} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md transition">
                    Create as New Vendor
                 </button>

                 <div className="relative flex items-center py-1">
                   <div className="flex-grow border-t border-amber-200/60"></div>
                   <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">OR MAP TO EXISTING</span>
                   <div className="flex-grow border-t border-amber-200/60"></div>
                 </div>

                 <div>
                    <select onChange={(e) => {
                       const selected = vendors.find(v => v._id === e.target.value);
                       setForm({ ...form, vendorId: selected._id, vendor: selected.name });
                       setVendorResolution(null);
                    }} className="w-full bg-white border border-amber-200/60 shadow-sm rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition" defaultValue="">
                       <option value="" disabled>Select an existing vendor...</option>
                       {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* POP-UP MODAL: Add New Vendor */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80] flex items-center justify-center p-4" onClick={() => !isSavingVendor && setShowVendorModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#FFFCF5] border border-amber-200/60 shadow-2xl rounded-3xl p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-slate-900">Add New Vendor</h3>
              <button onClick={() => setShowVendorModal(false)} disabled={isSavingVendor} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Vendor Name *</label>
                <input
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full bg-white border border-amber-200/60 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium outline-none focus:border-violet-500 transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Website</label>
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="url"
                    value={vendorForm.website}
                    onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                    placeholder="https://"
                    className="w-full bg-white border border-amber-200/60 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-900 font-medium outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Contact Name</label>
                  <div className="relative flex items-center">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                    <input
                      value={vendorForm.contactName}
                      onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-amber-200/60 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 font-medium outline-none focus:border-violet-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Contact Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                    <input
                      type="email"
                      value={vendorForm.contactEmail}
                      onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                      placeholder="jane@vendor.com"
                      className="w-full bg-white border border-amber-200/60 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 font-medium outline-none focus:border-violet-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Mobile / Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                  <input
                    type="tel"
                    value={vendorForm.contactPhone}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white border border-amber-200/60 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 font-medium outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-3 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  disabled={isSavingVendor}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-amber-200/60 hover:bg-amber-50 text-slate-700 font-bold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVendor}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  {isSavingVendor ? 'Saving Vendor...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
