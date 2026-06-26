"use client";
// NC Finance Code Note: Layout halaman dan wrapper route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { getMe } from "@/lib/api";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function verifySession() {
      const token = localStorage.getItem("nc_token");
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const user = await getMe();
        if (!active) return;
        localStorage.setItem("nc_user", JSON.stringify(user));
        setSidebarCollapsed(localStorage.getItem("nc_sidebar_collapsed") === "1");
        setReady(true);
      } catch {
        localStorage.removeItem("nc_token");
        localStorage.removeItem("nc_user");
        router.replace("/login");
      }
    }
    verifySession();
    return () => { active = false; };
  }, [router]);

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("nc_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center text-sm text-[#787774]">Memeriksa sesi...</div>;
  }

  return (
    <div className="flex h-full min-h-screen bg-[#f7f6f3]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onToggleCollapsed={toggleSidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
