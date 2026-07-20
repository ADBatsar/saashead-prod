"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  KeyRound,
  CalendarClock,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  UserCircle2,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Licenses",
      href: "/licenses",
      icon: KeyRound,
    },
    {
      name: "Renewals",
      href: "/renewals",
      icon: CalendarClock,
    },
    {
      name: "Vendors",
      href: "/vendors",
      icon: Building2,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className="
      w-72
      min-h-screen
      flex
      flex-col
      glass
      p-8
      border-r
      border-white/10
      "
    >

    <div className="mb-12">

  <div className="flex items-center gap-3">

    <div
      className="
      h-12
      w-12
      rounded-2xl
      bg-gradient-to-br
      from-purple-500
      to-indigo-600
      flex
      items-center
      justify-center
      text-2xl
      font-bold
      shadow-lg
      shadow-purple-500/40
      "
    >
      S
    </div>

    <div>

      <h1
        className="
        text-3xl
        font-bold
        leading-none
        "
      >
        HeadSaaS
      </h1>

      <p
        className="
        text-xs
        text-gray-400
        mt-1
        "
      >
        Enterprise License Manager
      </p>

    </div>

  </div>

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
      duration-300

      ${
        pathname === item.href
          ? "bg-purple-600 text-white shadow-lg"
          : "hover:bg-white/10 hover:translate-x-1"
      }
    `}
  >
    <item.icon size={20} />

    <span>{item.name}</span>
  </Link>
))}
      
      
      </nav>

     <div
  className="
  mt-auto
  pt-8
  border-t
  border-white/10
  "
>

  <div className="flex items-center gap-3">

    <div
      className="
      w-12
      h-12
      rounded-full
      bg-gradient-to-r
      from-purple-600
      to-indigo-600
      flex
      items-center
      justify-center
      font-bold
      text-lg
      "
    >
      A
    </div>

    <div>

      <p className="font-semibold">
        Anand Batsar
      </p>

      <p
        className="
        text-sm
        text-gray-400
        "
      >
        Administrator
      </p>

    </div>

  </div>

  <div
    className="
    flex
    items-center
    gap-2
    text-green-400
    text-sm
    mt-4
    "
  >

    <div
      className="
      w-2
      h-2
      rounded-full
      bg-green-500
      "
    />

    Online

  </div>

  <button
    className="
    mt-6
    flex
    items-center
    gap-2
    text-red-400
    hover:text-red-300
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
