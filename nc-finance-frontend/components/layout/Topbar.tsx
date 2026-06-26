"use client";
// NC Finance Code Note: Judul halaman dan ringkasan kecil di bagian atas.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, List } from "@phosphor-icons/react";
import { getPendaftaran, getTransaksi } from "@/lib/api";

const titles: Record<string, string> = {
  "/dashboard": "Ringkasan Administrasi",
  "/pendaftaran": "Form Pendaftaran Peserta",
  "/transaksi": "Administrasi Pembayaran",
  "/transaksi/input": "Catat Transaksi",
  "/transaksi/validasi": "Validasi Pembayaran",
  "/berkas": "Kelengkapan Berkas Pendaftaran",
  "/siswa": "Data Peserta",
  "/siswa/graph": "Relasi Peserta dan Pelatihan",
  "/laporan": "Laporan Pembayaran",
  "/pengaturan": "Pengaturan",
};

interface TopbarProps { onMenuClick: () => void; }

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const title = titles[pathname] || "N.C Finance";
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({ berkas: 0, transaksi: 0 });

  useEffect(() => {
    let active = true;
    Promise.all([getPendaftaran(), getTransaksi()])
      .then(([pendaftaran, transaksi]) => {
        if (!active) return;
        setStats({
          berkas: pendaftaran.filter((p) => !(p.dokKtp && p.dokKk && p.dokIjasah && p.dokFoto)).length,
          transaksi: transaksi.filter((t) => t.statusValidasi === "pending").length,
        });
      })
      .catch(() => setStats({ berkas: 0, transaksi: 0 }));
    return () => { active = false; };
  }, []);

  const total = stats.berkas + stats.transaksi;

  return (
    <header className="h-14 border-b border-[#eaeaea] bg-white flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onMenuClick} className="lg:hidden text-[#787774] hover:text-[#111111]" aria-label="Buka menu"><List size={20} /></button>
        <h1 className="text-sm font-semibold text-[#111111]">{title}</h1>
      </div>
      <div className="relative flex items-center gap-3">
        <button type="button" onClick={() => setOpen((v) => !v)} className="relative text-[#787774] hover:text-[#111111] transition-colors" aria-label="Buka notifikasi" aria-expanded={open} aria-haspopup="menu">
          <Bell size={18} />
          {total > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#9f2f2d] rounded-full" />}
        </button>
        {open && (
          <div role="menu" className="absolute right-0 top-9 w-80 rounded-2xl border border-[#eaeaea] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)] p-3 z-50">
            <p className="text-xs uppercase tracking-widest text-[#787774] px-2 pb-2 border-b border-[#eaeaea]">Notifikasi</p>
            <div className="py-2 space-y-1">
              <Link href="/berkas" className="block rounded-xl px-3 py-2 hover:bg-[#f7f6f3]" onClick={() => setOpen(false)}><p className="text-sm font-medium text-[#111111]">Berkas belum lengkap</p><p className="text-xs text-[#787774] mt-0.5">{stats.berkas} pendaftaran perlu dilengkapi.</p></Link>
              <Link href="/transaksi/validasi" className="block rounded-xl px-3 py-2 hover:bg-[#f7f6f3]" onClick={() => setOpen(false)}><p className="text-sm font-medium text-[#111111]">Transaksi pending</p><p className="text-xs text-[#787774] mt-0.5">{stats.transaksi} transaksi menunggu pengecekan.</p></Link>
              {total === 0 && <p className="px-3 py-4 text-sm text-[#787774]">Tidak ada notifikasi baru.</p>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
