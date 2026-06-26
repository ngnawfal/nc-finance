"use client";
// NC Finance Code Note: Badge status/metode pembayaran.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import type { ReactNode } from "react";
import type { MetodeBayar, StatusValidasi } from "@/lib/types";
import { cn } from "@/lib/utils";

const metodeStyles: Record<MetodeBayar, string> = {
  qris: "bg-[#edf3ec] text-[#346538]",
  transfer: "bg-[#e1f3fe] text-[#1f6c9f]",
  tunai: "bg-[#fbf3db] text-[#956400]",
};

const statusStyles: Record<StatusValidasi, string> = {
  approved: "bg-[#edf3ec] text-[#346538]",
  pending: "bg-[#fbf3db] text-[#956400]",
  rejected: "bg-[#fdebec] text-[#9f2f2d]",
};

const metodeLabel: Record<MetodeBayar, string> = { qris: "QRIS", transfer: "TRANSFER", tunai: "TUNAI" };
const statusLabel: Record<StatusValidasi, string> = { approved: "DISETUJUI", pending: "MENUNGGU", rejected: "DITOLAK" };
const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-widest uppercase";

export function MetodeBadge({ metode }: { metode: MetodeBayar }) {
  return <span className={cn(base, metodeStyles[metode])}>{metodeLabel[metode]}</span>;
}

export function StatusBadge({ status }: { status: StatusValidasi }) {
  return <span className={cn(base, statusStyles[status])}>{statusLabel[status]}</span>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(base, "bg-[#f7f6f3] text-[#787774]", className)}>{children}</span>;
}

export default Badge;
