"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, AppWindow, Key, Users, 
  FolderKanban, CalendarSync, Building2, TrendingDown, 
  Sparkles, Bell, FileText, Settings, LogOut, ChevronDown, Database, MessageSquare,
  Shield, Search, HelpCircle, AlertTriangle
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

  // Reference to the sidebar scroll container to prevent jumping
  const navRef = useRef<HTMLElement>(null);

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

    // Restore the sidebar scroll position instantly on mount
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScroll, 10);
    }
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
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#1e293b] text-slate-300 flex flex-col h-full shrink-0 shadow-xl z-20">
        
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-700/50 hover:bg-slate-800 transition cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-inner">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">HeadSaaS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Know · Control · Optimize</p>
          </div>
        </div>

        <div className="p-4 border-b border-slate-700/50">
          <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${pathname === "/dashboard" ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
        </div>

        <nav 
          ref={navRef}
          onScroll={(e) => sessionStorage.setItem("sidebar-scroll", e.currentTarget.scrollTop.toString())}
          className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar"
        >
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

          <div>
            <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Activity & System</h4>
            <div className="space-y-1">
              <SidebarLinkItem href="/notifications" icon={Bell} label="Notifications" />
            </div>
          </div>

        </nav>

        <div className="p-4 border-t border-slate-700/50 bg-[#1e293b]">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-bold transition border border-slate-700"
          >
            <MessageSquare className="w-4 h-4" /> Help & Support
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
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
                      <Link onClick={() => setDropdownOpen(false)} href="/settings/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                        <Settings className="w-4 h-4 text-slate-400" /> Workspace Settings
                      </Link>

                      <Link onClick={() => setDropdownOpen(false)} href="/settings/danger-zone" className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition">
                        <AlertTriangle className="w-4 h-4 text-rose-500" /> Pause / Delete Workspace
                      </Link>

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

        {(title !== "Overview" && title !== "Dashboard") && (
          <div className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      <ContactModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        defaultType="Feedback" 
        workspaceId={user.workspaceId} 
      />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
