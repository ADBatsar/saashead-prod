"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, AppWindow, Key, Users, 
  FolderKanban, CalendarSync, Building2, TrendingDown, 
  Sparkles, Bell, FileText, Settings, LogOut, ChevronDown, Database, MessageSquare,
  PauseCircle, Trash2, ShieldAlert, AlertTriangle, X, Shield, Search, HelpCircle, Network
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
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [user, setUser] = useState({ name: "Workspace Admin", role: "Workspace Chief", workspaceId: "" });

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

  const handleLogout = async () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.log("No backend logout route, proceeding with local clear.");
    }
    router.push("/login");
  };

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

  // Helper for Sidebar links based on the screenshot grouping
  const SidebarLinkItem = ({ href, icon: Icon, label }: any) => {
    const active = pathname.includes(href) || (href === "/dashboard" && pathname === "/dashboard");
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition ${active ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
        <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : ''}`} /> {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* --- NEW DARK SIDEBAR --- */}
      <aside className="w-[260px] bg-[#1e293b] text-slate-300 flex flex-col h-full shrink-0 shadow-xl z-20">
        
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-700/50 hover:bg-slate-800 transition cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-inner">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">HeadSaaS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Know · Control · Optimize</p>
          </div>
        </div>

        {/* Global Overview Button */}
        <div className="p-4 border-b border-slate-700/50">
          <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${pathname === "/dashboard" ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div>
            <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Portfolio</h4>
            <div className="space-y-1">
              <SidebarLinkItem href="/applications" icon={AppWindow} label="Applications" />
              <SidebarLinkItem href="/licenses" icon={Key} label="Licenses & Users" />
              <SidebarLinkItem href="/users" icon={Users} label="Workspace Users" />
            </div>
          </div>
          
          <div>
            <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Vendors</h4>
            <div className="space-y-1">
              <SidebarLinkItem href="/vendors" icon={Building2} label="Vendors" />
              <SidebarLinkItem href="/projects" icon={FolderKanban} label="Vendor Projects" />
            </div>
          </div>

          <div>
            <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Financial</h4>
            <div className="space-y-1">
              <SidebarLinkItem href="/cost-optimization" icon={TrendingDown} label="Cost Optimization" />
              <SidebarLinkItem href="/renewals" icon={CalendarSync} label="Renewals" />
              <div className="flex items-center justify-between px-3 py-2 text-sm text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800 transition">
                <div className="flex items-center gap-3"><FileText className="w-4 h-4" /> IT Budgeting</div>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-bold">Soon</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Intelligence & Data</h4>
            <div className="space-y-1">
              <SidebarLinkItem href="/ai-copilot" icon={Sparkles} label="AI Insights" />
              <SidebarLinkItem href="/reports" icon={FileText} label="Reports" />
              <SidebarLinkItem href="/import-export" icon={Database} label="Data Management" />
            </div>
          </div>
        </nav>

        {/* Support Button (Bottom) */}
        <div className="p-4 border-t border-slate-700/50 bg-[#1e293b]">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-bold transition border border-slate-700"
          >
            <MessageSquare className="w-4 h-4" /> Help & Support
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* NEW MODERN HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
          
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search applications, vendors, or users..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
          </div>
          
          <div className="flex items-center gap-5 pl-6">
            <Link href="/notifications" className="relative group cursor-pointer" title="Notifications">
              <Bell className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">3</span>
            </Link>
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-blue-600 transition cursor-pointer" onClick={() => setIsFeedbackOpen(true)} title="Help" />
            
            {/* User Dropdown Trigger */}
            <div className="relative border-l border-slate-200 pl-5">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer outline-none"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-slate-700 leading-none">{user.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">HeadSaaS Admin</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Role</p>
                      <p className="text-xs font-bold text-blue-700 bg-blue-50 inline-block px-2.5 py-1 rounded-md border border-blue-100 shadow-sm">
                        {user.role}
                      </p>
                    </div>
                    
                    <div className="py-1.5">
                      <Link onClick={() => setDropdownOpen(false)} href="/settings" className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                        <Settings className="w-4 h-4 text-slate-400" /> Workspace Settings
                      </Link>
                      
                      <hr className="border-slate-100 my-1" />

                      <button 
                        onClick={() => { setDropdownOpen(false); setShowDeactivateModal(true); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition"
                      >
                        <PauseCircle className="w-4 h-4 text-amber-500" /> Pause Workspace
                      </button>

                      <button 
                        onClick={() => { setDropdownOpen(false); setShowDeleteModal(true); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" /> Delete Workspace
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

        {/* Dynamic Page Content Header (Only shows if Title/Action is passed) */}
        {(title !== "Overview" && title !== "Dashboard") && (
          <div className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}

        {/* Scrollable Children Container */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* --- MODALS (Unchanged functionality, updated styling to match) --- */}
      <ContactModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        defaultType="Feedback" 
        workspaceId={user.workspaceId} 
      />

      {showDeactivateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 border border-amber-100">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pause Workspace</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Are you sure you want to pause your workspace? You will be logged out immediately, and all alerts and tracking will be paused.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowDeactivateModal(false)}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition border border-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeactivate}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 shadow-sm transition flex items-center gap-2"
              >
                {isProcessing ? "Processing..." : "Yes, Pause"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-2xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 pt-8">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4 border border-rose-100">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Workspace</h3>
              <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                This action <strong className="text-rose-600">cannot be undone</strong>. This will permanently delete your workspace, all uploaded contracts, and historical spend data.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-2 shadow-inner">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Type <span className="text-rose-600 select-all">DELETE</span> to confirm
                </label>
                <input 
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition shadow-sm"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={isProcessing || deleteInput !== "DELETE"}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isProcessing ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scrollbar styling injected globally for the layout */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
