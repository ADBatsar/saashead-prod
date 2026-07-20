"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, LogOut, ChevronDown } from "lucide-react";
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

  // Bulletproof fallbacks matching your working version
  const userName = user?.name || "User";
  const userEmail = user?.email || "Loading...";
  const userRole = user?.role || "Loading...";
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="h-20 border-b border-slate-800/60 bg-[#070A11]/70 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
      <div>
        <div
          className="font-display text-xl font-medium text-white tracking-tight"
          data-testid="page-title"
        >
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
            data-testid="global-search"
            placeholder="Search apps, vendors, users…"
            className="bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600 flex-1"
          />
          <kbd className="text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>

        {action}

        <button
          className="relative p-2 rounded-full hover:bg-white/5 transition"
          title="Notifications"
          data-testid="notifications-btn"
        >
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
              <div className="text-sm font-medium text-white">
                {userRole}
              </div>
              <div className="text-[10px] text-slate-500">
                {userEmail}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-display font-semibold text-white uppercase">
              {userInitial}
            </div>
            
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-[#111520] border border-slate-800 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-800/60 mb-2 sm:hidden">
                <div className="text-sm font-medium text-white">{userName}</div>
                <div className="text-xs text-slate-500 truncate">{userEmail}</div>
              </div>
              
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push("/settings/profile");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition outline-none"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
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
  );
}
