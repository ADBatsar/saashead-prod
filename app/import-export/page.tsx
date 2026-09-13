"use client";

import { useState, useRef } from "react";
import Layout from "@/components/workspace/Layout";
import { DownloadCloud, UploadCloud, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DataManagementPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'error' | 'success' | null, msg: string }>({ type: null, msg: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export");
      
      if (!res.ok) {
        const rawText = await res.text();
        let errorMsg = `HTTP Error ${res.status}`;
        try {
           const json = JSON.parse(rawText);
           errorMsg = `Status: ${res.status}\nReason: ${json.message || json.error || JSON.stringify(json)}`;
        } catch(e) {
           errorMsg = `Server returned HTML instead of JSON.\nStatus: ${res.status}\nSnippet: ${rawText.substring(0, 150)}...`;
        }
        alert(`🚨 EXPORT FAILED - SERVER DEBUG INFO 🚨\n\n${errorMsg}`);
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "saashead-workspace-backup.json";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Export Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("CRITICAL WARNING: Importing data will wipe and replace your current applications, projects, and vendors. This cannot be undone. Do you wish to proceed?")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsImporting(true);
    setImportStatus({ type: null, msg: '' });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to import workspace. Check your permissions.");
      }

      setImportStatus({ type: 'success', msg: 'Workspace data restored successfully. Please refresh the page to see your changes.' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error("Import Error:", error);
      setImportStatus({ type: 'error', msg: error.message || "Import failed. Please ensure you are using a valid HeadSaaS backup file." });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Layout
      title="Data Management"
      subtitle="Securely backup or restore your workspace architecture"
    >
      <div className="max-w-4xl mt-6 space-y-6">
        
        {/* Status Banners */}
        {importStatus.type === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700 shadow-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{importStatus.msg}</p>
          </div>
        )}

        {importStatus.type === 'error' && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 shadow-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{importStatus.msg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* EXPORT CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-blue-300 transition group">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition">
              <DownloadCloud className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Export Workspace</h2>
            <p className="text-sm font-medium text-slate-500 mb-8 flex-1">
              Download a complete JSON snapshot of your current applications, vendors, licenses, and projects. Keep this file safe as a backup.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? "Generating Backup..." : "Download Backup File"}
            </button>
          </div>

          {/* IMPORT CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-violet-300 transition group relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6 group-hover:bg-violet-100 transition">
              <UploadCloud className="w-8 h-8 text-violet-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Restore Workspace</h2>
            <p className="text-sm font-medium text-slate-500 mb-6 flex-1">
              Upload a previously exported JSON backup file to instantly restore your workspace configuration and data.
            </p>
            
            <div className="w-full bg-rose-50 border border-rose-200 rounded-lg p-3 mb-6 flex items-start gap-2 text-left shadow-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                <strong className="text-rose-600">Warning:</strong> Importing will overwrite your existing data. Ensure your backup is up to date.
              </p>
            </div>

            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport} 
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? "Restoring Data..." : "Select Backup File to Upload"}
            </button>
          </div>

        </div>

      </div>
    </Layout>
  );
}
