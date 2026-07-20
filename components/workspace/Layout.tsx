"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../app/Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export default function Layout({
  title,
  subtitle,
  action,
  children,
}: LayoutProps) {
  const router = useRouter();
  
  // State to hold the verified user and a loading lock
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Secure route protection: Fetch user on load
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        // Kick back to login if the cookie is missing or invalid
        router.push("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  // Secure logout handler
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/"); // Send back to landing page
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  // Prevent UI flash while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070A11] flex items-center justify-center text-slate-500 text-sm">
        <div className="animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-200">
      {/* Pass the dynamic user data and logout function down to the Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="ml-64 min-h-screen">
        {/* Pass the dynamic user data down to the Topbar */}
        <Topbar
          title={title}
          subtitle={subtitle}
          action={action}
          user={user}
        />

        <div className="p-8 animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
