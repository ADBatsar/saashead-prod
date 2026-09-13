"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/workspace/Layout";
import { AlertTriangle, ShieldAlert, PauseCircle, Trash2, X } from "lucide-react";

export default function DangerZonePage() {
  const router = useRouter();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const executeDeactivate = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/account", { method: "PUT" });
      if (!res.ok) throw new Error("Failed to deactivate account");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    } catch (e: any) {
      alert(e.message || "Error deactivating account");
      setIsProcessing(false);
      setShowDeactivateModal(false);
    }
  };

  const executeDelete = async () => {
    if (deleteInput !== "DELETE") return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    } catch (e: any) {
      alert(e.message || "Error deleting account");
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Layout title="Danger Zone" subtitle="Manage workspace suspension and permanent deletion.">
      <div className="max-w-3xl mt-6">
        
        <div className="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-rose-100 bg-rose-50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-rose-100 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-rose-700">Danger Zone</h2>
              <p className="text-xs font-medium text-rose-600/80 mt-0.5">Destructive actions for your workspace. Proceed with absolute caution.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            
            {/* Pause Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <PauseCircle className="w-4 h-4 text-amber-500" /> Pause Workspace
                </h4>
                <p className="text-sm font-medium text-slate-500 mt-1">Temporarily freeze all alerts, syncs, and user access. You will be logged out immediately.</p>
              </div>
              <button 
                onClick={() => setShowDeactivateModal(true)}
                className="shrink-0 px-5 py-2.5 bg-white border border-amber-200 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-50 transition shadow-sm flex items-center gap-2"
              >
                Pause Workspace
              </button>
            </div>
            
            <hr className="border-slate-100" />
            
            {/* Delete Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" /> Delete Workspace
                </h4>
                <p className="text-sm font-medium text-slate-500 mt-1">Permanently wipe all projects, vendors, and cost data. <strong className="text-rose-600">This cannot be undone.</strong></p>
              </div>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition shadow-md flex items-center gap-2"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* --- PAUSE WORKSPACE MODAL --- */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-5 border border-amber-100 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pause Workspace?</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Are you sure you want to pause your workspace? You will be logged out immediately, and all background syncs and notifications will be halted.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowDeactivateModal(false)} disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeactivate} disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Yes, Pause Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE WORKSPACE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 pt-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-5 border border-rose-100 shadow-sm">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Workspace?</h3>
              <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                This action <strong className="text-rose-600">cannot be undone</strong>. This will permanently delete your workspace, all uploaded contracts, and historical spend data.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Type <span className="text-rose-600 select-all">DELETE</span> to confirm
                </label>
                <input 
                  type="text" 
                  value={deleteInput} 
                  onChange={(e) => setDeleteInput(e.target.value)} 
                  placeholder="DELETE"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition shadow-sm"
                />
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }} disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} disabled={isProcessing || deleteInput !== "DELETE"}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isProcessing ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
