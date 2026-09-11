"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { getSessionData } from "@/lib/auth-utils";
import {
  LayoutDashboard, Package, Ticket, Users, RefreshCcw, Building2,
  PiggyBank, Sparkles, BarChart3, Settings, LogOut, FolderKanban, Bell, Database,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/applications", icon: Package, label: "Applications" },
  { href: "/licenses", icon: Ticket, label: "Licenses" },
  { href: "/users", icon: Users, label: "Users" },
  { href: "/projects", icon: FolderKanban, label: "Projects", badge: "New" },
  { href: "/renewals", icon: RefreshCcw, label: "Renewals" },
  { href: "/vendors", icon: Building2, label: "Vendors" },
  { href: "/cost-optimization", icon: PiggyBank, label: "Cost Optimization" },
  { href: "/ai-copilot", icon: Sparkles, label: "AI Copilot" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/import-export", icon: Database, label: "Data Management" },
  { href: "/administration", icon: Settings, label: "Administration" },
];

export default function Sidebar({ user, onLogout }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      const session = getSessionData(token as string);
      setRole(session?.role || null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    // Also clear cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#070A11] border-r border-slate-800/80 backdrop-blur-xl flex flex-col z-40">
      {/* Header */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">H</span>
        </div>
        <div>
          <h1 className="font-bold text-white">HeadSaaS</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Spend Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map((item) => {
          
          // 1. RBAC: Hide management tabs for License Holders (Using resolved 'role' state)
          if (role === "Workspace License Holder" && 
             ["Users", "Vendors", "Cost Optimization", "Dashboard"].includes(item.label)) {
            return null; 
          }

          // 2. RBAC: Hide Administration if not the Platform Owner (Using resolved 'role' state)
          if (item.label === "Administration" && role !== "Platform Owner") {
            return null;
          }

          const Icon = item.icon;
          const active = pathname === item.href;

          // This is the actual code that renders your link
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                active 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "H"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{user?.name || "..."}</p>
            {/* Displaying the actual RBAC role here */}
            <p className="text-[11px] text-blue-400 font-medium truncate">{role || user?.role || "..."}</p>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-500 hover:text-rose-400 transition shrink-0">  
            <LogOut size={18} className="text-red-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
