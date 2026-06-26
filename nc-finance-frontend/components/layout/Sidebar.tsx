"use client";
// NC Finance Code Note: Navigasi utama aplikasi.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretRight, ChartBar, CheckSquare, GearSix, Graph, House, Receipt, UserPlus, Users } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { logout as logoutApi } from "@/lib/api";
import type { User } from "@/lib/types";

const navGroups = [
  { title: "Administrasi", items: [
    { href: "/dashboard", label: "Ringkasan", icon: House },
    { href: "/pendaftaran", label: "Form Pendaftaran", icon: UserPlus },
    { href: "/transaksi", label: "Pembayaran", icon: Receipt },
    { href: "/transaksi/validasi", label: "Validasi Pembayaran", icon: CheckSquare, role: "manajer" as const },
    { href: "/berkas", label: "Kelengkapan Berkas", icon: CheckSquare },
  ] },
  { title: "Data Laporan", items: [
    { href: "/siswa", label: "Data Peserta", icon: Users },
    { href: "/siswa/graph", label: "Relasi Pelatihan", icon: Graph },
    { href: "/laporan", label: "Laporan Bayar", icon: ChartBar },
    { href: "/pengaturan", label: "Pengaturan", icon: GearSix, role: "manajer" as const },
  ] },
];

interface SidebarProps { open: boolean; onClose: () => void; collapsed: boolean; onToggleCollapsed: () => void; }

export function Sidebar({ open, onClose, collapsed, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("nc_user");
    if (raw) {
      try { setUser(JSON.parse(raw) as User); } catch { setUser(null); }
    }
  }, []);

  const initials = useMemo(() => (user?.nama || "NC").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join(""), [user?.nama]);

  async function logout() {
    try { await logoutApi(); } catch {}
    localStorage.removeItem("nc_token");
    localStorage.removeItem("nc_user");
    router.replace("/login");
  }

  return (
    <>
      {open && <button type="button" aria-label="Tutup menu" className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn("fixed top-0 left-0 h-full w-72 bg-[#fbfbfa] border-r border-[#eaeaea] z-40 flex flex-col transition-transform duration-300", "lg:translate-x-0 lg:static lg:z-auto lg:transition-[width] lg:duration-300", collapsed ? "lg:w-20" : "lg:w-72", open ? "translate-x-0" : "-translate-x-full")}>
        <div className={cn("flex items-center justify-between px-5 py-5 border-b border-[#eaeaea]", collapsed && "lg:px-3 lg:justify-center")}>
          <div className="min-w-0">
            <span className={cn("font-serif text-xl font-semibold text-[#111111] tracking-tight", collapsed && "lg:text-lg")}>{collapsed ? "N.C" : "N.C Admin"}</span>
            {!collapsed && <p className="text-[10px] text-[#787774] tracking-widest uppercase mt-0.5">Pendaftaran Pembayaran</p>}
          </div>
          <button type="button" onClick={onToggleCollapsed} className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-[#787774] hover:text-[#111111]" aria-label={collapsed ? "Perbesar sidebar" : "Minimize sidebar"}>
            {collapsed ? <CaretRight size={15} /> : <CaretLeft size={15} />}
          </button>
          <button type="button" onClick={onClose} className="lg:hidden text-[#787774] hover:text-[#111111]" aria-label="Tutup sidebar"><CaretLeft size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className={cn("px-3 mb-2 text-[10px] font-medium text-[#787774] uppercase tracking-[0.16em]", collapsed && "lg:hidden")}>{group.title}</p>
              <div className="space-y-1">
                {group.items.filter((item) => !item.role || item.role === user?.role).map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/dashboard" && href !== "/siswa" && pathname.startsWith(`${href}/`));
                  return (
                    <Link key={href} href={href} onClick={onClose} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors border", collapsed && "lg:justify-center lg:px-2", active ? "bg-white border-[#111111] text-[#111111]" : "border-transparent text-[#787774] hover:bg-white hover:border-[#eaeaea] hover:text-[#111111]")}>
                      <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center border border-[#eaeaea]", active ? "bg-[#111111] text-white" : "bg-[#f7f6f3] text-[#787774]")}><Icon size={15} weight={active ? "fill" : "regular"} /></span>
                      {!collapsed && <span className="font-medium">{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn("px-4 py-4 border-t border-[#eaeaea]", collapsed && "lg:px-2")}>
          <div className={cn("rounded-xl bg-white border border-[#eaeaea] p-3 flex items-center gap-3", collapsed && "lg:justify-center lg:px-2")}>
            <div className="w-8 h-8 rounded-lg bg-[#f7f6f3] flex items-center justify-center text-xs font-medium text-[#787774]">{initials || "NC"}</div>
            {!collapsed && <div className="min-w-0"><p className="text-xs font-medium text-[#111111] truncate">{user?.nama || "Pengguna"}</p><p className="text-[10px] text-[#787774] uppercase tracking-wider">{user?.role || "-"}</p></div>}
            {!collapsed && <button type="button" onClick={logout} aria-label="Keluar dari sistem" className="ml-auto text-[10px] text-[#9f2f2d] uppercase tracking-widest hover:underline">Keluar</button>}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
