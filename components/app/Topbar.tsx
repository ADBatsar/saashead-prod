"use client";

import { Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Topbar({
  title,
  subtitle,
  action,
}: TopbarProps) {
  const user = {
    name: "HeadSaaS Owner",
    email: "admin@headsaas.com",
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#070A11]/70 backdrop-blur-xl border-b border-slate-800/60 px-8 flex items-center justify-between">

      <div>
        <h1 className="text-2xl font-semibold text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">

        <div className="hidden lg:flex items-center gap-3 w-80 rounded-full border border-slate-800 bg-[#111520] px-4 py-2">

          <Search size={16} className="text-slate-500" />

          <input
            type="text"
            placeholder="Search applications, vendors..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
          />

        </div>

        {action}

        <button className="relative p-2 rounded-full hover:bg-white/5">

          <Bell className="text-slate-400" size={20} />

          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        <div className="border-l border-slate-800 pl-4 flex items-center gap-3">

          <div className="text-right hidden sm:block">

            <p className="text-sm text-white">
              {user.name}
            </p>

            <p className="text-xs text-slate-500">
              {user.email}
            </p>

          </div>

          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-white">

            H

          </div>

        </div>

      </div>
    </header>
  );
}
