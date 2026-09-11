"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, AppWindow, Key, Users, 
  FolderKanban, CalendarSync, Building2, TrendingDown, 
  Sparkles, Bell, FileText, Settings, LogOut, ChevronDown, Database, MessageSquare,
  PauseCircle, Trash2, ShieldAlert, AlertTriangle, X
} from "lucide-react";
import ContactModal from "@/components/ContactModal";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Layout({ children, title, subtitle, action }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // States
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [user, setUser] = useState({ name: "Workspace Admin", role: "Workspace Chief", workspaceId: "" });

  // Account Danger Zone States
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const json = await res.json();
        if (json.success) {
          setUser({ 
            name: json.data.name || "Workspace User", 
            role: json.data.role || "Unknown Role",
            workspaceId: json.data.workspaceId || ""
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }
    loadProfile();
  }, []);

  const nav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Applications", href: "/applications", icon: AppWindow },
    { name: "Licenses", href: "/licenses", icon: Key },
    { name: "Users", href: "/users", icon: Users },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Renewals", href: "/renewals", icon: CalendarSync },
    { name: "Vendors", href: "/vendors", icon: Building2 },
    { name: "Cost Optimization", href: "/cost-optimization", icon: TrendingDown },
    { name: "AI Insights", href: "/ai-copilot", icon: Sparkles },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Data Management", href: "/import-export", icon: Database },
  ];

  const handleLogout = async () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.log("No backend logout route, proceeding with local clear.");
    }
    router.push("/login");
  };

  // --- ACCOUNT ACTION EXECUTORS ---
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
    <div className="min-h-screen bg-[#FFFBEF] text-slate-900 flex font-sans relative">
      
      <aside className="w-64 bg-[#FFFCF5] border-r border-amber-200/60 flex flex-col fixed h-full z-20 shadow-sm">
        <Link href="/dashboard" className="h-16 flex items-center px-6 border-b border-amber-200/60 hover:opacity-75 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center mr-3 shadow-sm">
            <span className="font-bold text-white text-sm">H</span>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">HeadSaaS</span>
        </Link>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {nav.map((item) => {
            const active = pathname.includes(item.href) || (item.href === "/dashboard" && pathname === "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active 
                    ? "bg-violet-100/50 text-violet-700 shadow-sm border border-violet-200/50" 
                    : "text-slate-600 hover:bg-amber-100/30 hover:text-slate-900 border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${active ? "text-violet-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-amber-200/60 bg-[#FFFCF5]">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-amber-100/50 hover:bg-amber-200/50 text-amber-700 py-2.5 rounded-xl text-sm font-bold transition border border-amber-200"
          >
            <MessageSquare className="w-4 h-4" /> Support & Feedback
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-[#FFFCF5]/90 backdrop-blur-md border-b border-amber-200/60 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-4">
            {action}
            
            <div className="relative border-l border-amber-200/60 pl-4">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:bg-amber-50/80 p-1.5 rounded-xl transition cursor-pointer outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    {user.name} <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-amber-200/60 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Role</p>
                      <p className="text-xs font-bold text-violet-700 bg-violet-100/80 inline-block px-2.5 py-1 rounded-md border border-violet-200/50 shadow-sm">
                        {user.role}
                      </p>
                    </div>
                    
                    <div className="py-1.5">
                      <Link onClick={() => setDropdownOpen(false)} href="/settings/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-slate-900 transition">
                        <Settings className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>
                      
                      <hr className="border-slate-100 my-1" />

                      <button 
                        onClick={() => { setDropdownOpen(false); setShowDeactivateModal(true); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition"
                      >
                        <PauseCircle className="w-4 h-4 text-amber-500" /> Deactivate Account
                      </button>

                      <button 
                        onClick={() => { setDropdownOpen(false); setShowDeleteModal(true); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" /> Delete Account
                      </button>

                      <hr className="border-slate-100 my-1" />
                      
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        <LogOut className="w-4 h-4 text-slate-400" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>

      <ContactModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        defaultType="Feedback" 
        workspaceId={user.workspaceId} 
      />

      {/* --- DEACTIVATE MODAL --- */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FFFCF5] border border-amber-200/60 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4 border border-amber-200">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Deactivate Account</h3>
              <p className="text-sm font-medium text-slate-500">
                Are you sure you want to deactivate your account? You will be logged out immediately, and your profile will be marked as inactive until restored by an Admin.
              </p>
            </div>
            <div className="p-4 bg-amber-50/50 border-t border-amber-200/60 flex justify-end gap-3">
              <button 
                onClick={() => setShowDeactivateModal(false)}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white border border-transparent hover:border-amber-200 hover:shadow-sm transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeactivate}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-amber-600 border border-amber-300 hover:bg-amber-50 shadow-sm transition flex items-center gap-2"
              >
                {isProcessing ? "Processing..." : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FFFCF5] border border-rose-200 rounded-3xl shadow-2xl overflow-hidden relative">
            
            <button 
              onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-rose-50 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 pt-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-4 border border-rose-200">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Account</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">
                This action <strong className="text-rose-600">cannot be undone</strong>. This will permanently delete your account, active sessions, and personal data. If you are the Workspace Owner, your entire organization's data will be wiped.
              </p>
              
              <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-4 mb-2 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Type <span className="text-rose-600 select-all">DELETE</span> to confirm
                </label>
                <input 
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition shadow-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-rose-50/50 border-t border-rose-100 flex justify-end gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white border border-transparent hover:border-rose-200 hover:shadow-sm transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={isProcessing || deleteInput !== "DELETE"}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isProcessing ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
