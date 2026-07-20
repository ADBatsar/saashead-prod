"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function Layout({
  title,
  subtitle,
  action,
  children,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#070A11] text-slate-200">

      <Sidebar />

      <main className="ml-64 min-h-screen">

        <Topbar
          title={title}
          subtitle={subtitle}
          action={action}
        />

        <div className="p-8">

          {children}

        </div>

      </main>

    </div>
  );
}
