"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronDown, 
  DownloadCloud, 
  UploadCloud, 
  PauseCircle, 
  Trash2,
  X,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Topbar({
  title,
  subtitle,
  action,
  user,
}: Props) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Safely close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // --- DATA MANAGEMENT FUNCTIONS ---

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate export file. Check your permissions.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "saashead-backup.json";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsProfileOpen(false);
    } catch (e: any) {
      alert(`Export Error: ${e.message}`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("WARNING: Importing data will overwrite your current workspace. Are you sure you want to proceed?")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Import failed");
      
      alert("Workspace data successfully restored! Reloading dashboard...");
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Error importing data");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsProfileOpen(false);
    }
  };

  // --- ACCOUNT MANAGEMENT EXECUTORS ---

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      router.push("/");
    }
  };

  const userName = user?.name || "User";
  const userEmail = user?.email || "Loading...";
  const userRole = user?.role || "Loading...";
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <header className="h-20 border-b border-slate-800/60 bg-[#070A11]/70 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
          <div className="font-display text-xl font-medium text-white tracking-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-500 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[#111520]/80 border border-slate-800 rounded-full px-4 py-2 w-80 focus-within:border-blue-500/50 transition">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              placeholder="Search apps, vendors, users…"
              className="bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600 flex-1"
            />
            <kbd className="text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>

          {action}

          <button className="relative p-2 rounded-full hover:bg-white/5 transition" title="Notifications">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          </button>

          {/* Profile Dropdown Container */}
          <div className="relative pl-4 border-l border-slate-800" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 hover:opacity-80 transition text-left outline-none"
            >
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-white">{userRole}</div>
                <div className="text-[10px] text-slate-500">{userEmail}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-display font-semibold text-white uppercase">
                {userInitial}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#111520] border border-slate-800 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-800/60 mb-2 sm:hidden">
                  <div className="text-sm font-medium text-white">{userName}</div>
                  <div className="text-xs text-slate-500 truncate">{userEmail}</div>
                </div>
                
                <button 
                  onClick={() => { setIsProfileOpen(false); router.push("/settings/profile"); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition outline-none"
                >
                  <Settings className="w-4 h-4" />
                  My Profile
                </button>

                <hr className="border-slate-800/60 my-2" />

                <button 
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition outline-none"
                >
                  <DownloadCloud className="w-4 h-4" />
                  Export Data
                </button>

                <button 
                  onClick={() => { setIsProfileOpen(false); fileInputRef.current?.click(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition outline-none"
                >
                  <UploadCloud className="w-4 h-4" />
                  Import Data
                </button>

                <hr className="border-slate-800/60 my-2" />

                <button 
                  onClick={() => { setIsProfileOpen(false); setShowDeactivateModal(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition outline-none"
                >
                  <PauseCircle className="w-4 h-4" />
                  Deactivate Account
                </button>

                <button 
                  onClick={() => { setIsProfileOpen(false); setShowDeleteModal(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>

                <hr className="border-slate-800/60 my-2" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- DEACTIVATE MODAL --- */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111520] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Deactivate Account</h3>
              <p className="text-sm text-slate-400">
                Are you sure you want to deactivate your account? You will be logged out immediately, and your profile will be marked as inactive until restored by an Admin.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowDeactivateModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeactivate}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-2"
              >
                {isProcessing ? "Processing..." : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111520] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Warning Header */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-700" />
            
            <button 
              onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
                <h3 className="text-xl font-bold text-white">Delete Account</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                This action <strong className="text-rose-400">cannot be undone</strong>. This will permanently delete your account, active sessions, and personal data. If you are the Workspace Owner, your entire organization's data will be wiped.
              </p>
              
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 mb-6">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Type <span className="text-rose-400 select-all">DELETE</span> to confirm
                </label>
                <input 
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#070A11] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-rose-500 outline-none transition"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={isProcessing || deleteInput !== "DELETE"}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-500 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isProcessing ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
