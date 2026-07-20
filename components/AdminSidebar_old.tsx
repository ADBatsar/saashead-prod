"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Package,
  Users,
  FileText,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const handleLogout = () => {
  localStorage.removeItem("token");
  sessionStorage.clear();

  window.location.href = "/login";
};

  const menu = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Companies",
      href: "/admin/companies",
      icon: Building2,
    },
    {
      name: "Subscriptions",
      href: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      name: "Plans",
      href: "/admin/plans",
      icon: Package,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Audit Logs",
      href: "/admin/audit",
      icon: FileText,
    },
    {
      name: "Platform Health",
      href: "/admin/health",
      icon: Activity,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className="
      w-72
      min-h-screen
      glass
      border-r
      border-white/10
      p-8
      flex
      flex-col
      "
    >
      <div className="mb-12">
        <h1 className="text-3xl font-bold">
          HeadSaaS
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Platform Control Center
        </p>
      </div>

      <nav className="space-y-3">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              transition-all

              ${
                pathname === item.href
                  ? "bg-purple-600 text-white"
                  : "hover:bg-white/10"
              }
            `}
          >
            <item.icon size={20} />

            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

	<div className="mt-auto pt-8 border-t border-white/10">

  <p className="font-semibold">
    HeadSaaS Owner
  </p>

  <p className="text-sm text-gray-400 mb-6">
    Super Administrator
  </p>

  <button
    onClick={handleLogout}
    className="
      w-full
      flex
      items-center
      justify-center
      gap-3
      px-4
      py-3
      rounded-xl
      bg-red-600
      hover:bg-red-700
      transition
    "
  >
    <LogOut size={18} />
    Logout
  </button>

</div>	

    </aside>
  );
}
