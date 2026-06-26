"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useEffect, useMemo, useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { MetodeBadge, StatusBadge } from "@/components/ui/Badge";
import { Users, Receipt, FileText, CurrencyCircleDollar } from "@phosphor-icons/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getPendaftaran, getTransaksi } from "@/lib/api";
import { PendaftaranPeserta, Transaksi } from "@/lib/types";

const COLORS = ["#edf3ec", "#e1f3fe", "#fbf3db"];
const TEXT_COLORS = ["#346538", "#1f6c9f", "#956400"];

export default function DashboardPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [pendaftaran, setPendaftaran] = useState<PendaftaranPeserta[]>([]);

  useEffect(() => {
    getTransaksi().then(setTransaksi);
    getPendaftaran().then(setPendaftaran);
  }, []);

const transaksiApproved = transaksi.filter((t) => t.statusValidasi === "approved");
const totalAll = transaksiApproved.reduce((s, t) => s + t.nominal, 0);
  const berkasBelum = pendaftaran.filter(p => !(p.dokKtp && p.dokKk && p.dokIjasah && p.dokFoto)).length;
  const latest5 = [...transaksi].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(d),
        total: transaksiApproved.filter(t => t.createdAt.startsWith(key)).reduce((s, t) => s + t.nominal, 0),
    };
  }), [transaksiApproved]);

  const metodeTotals = ["qris", "transfer", "tunai"].map(m => ({
    name: m.toUpperCase(),
    value: transaksi.filter(t => t.metode === m).reduce((s, t) => s + t.nominal, 0),
  }));

  const summaryCards = [
    { label: "Total Pembayaran", value: formatRupiah(totalAll), icon: CurrencyCircleDollar, accent: "text-[#346538]" },
    { label: "Transaksi Tercatat", value: transaksi.length.toString(), icon: Receipt, accent: "text-[#1f6c9f]" },
    { label: "Peserta Terdaftar", value: pendaftaran.length.toString(), icon: Users, accent: "text-[#956400]" },
    { label: "Berkas Belum Lengkap", value: berkasBelum.toString(), icon: FileText, accent: "text-[#9f2f2d]" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <FadeIn>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((c) => (
            <Card key={c.label} padding="md" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#787774] uppercase tracking-widest">{c.label}</span>
                <c.icon size={18} className={c.accent} weight="duotone" />
              </div>
              <p className="text-2xl font-semibold text-[#111111] tracking-tight">{c.value}</p>
            </Card>
          ))}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FadeIn delay={80} className="lg:col-span-2">
          <Card padding="md">
            <p className="text-xs text-[#787774] uppercase tracking-widest mb-4">Pembayaran 7 Hari Terakhir</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7} barSize={28}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#787774" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => [formatRupiah(Number(v)), "Total"]} contentStyle={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="total" fill="#111111" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>

        <FadeIn delay={160}>
          <Card padding="md" className="flex flex-col">
            <p className="text-xs text-[#787774] uppercase tracking-widest mb-4">Metode Pembayaran</p>
            {transaksi.length === 0 ? (
              <div className="h-[140px] flex items-center justify-center text-sm text-[#787774]">Belum ada pembayaran.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={metodeTotals} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {metodeTotals.map((_, i) => <Cell key={i} fill={COLORS[i]} stroke={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatRupiah(Number(v))} contentStyle={{ border: "1px solid #eaeaea", borderRadius: 6, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-center">
                  {metodeTotals.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: COLORS[i] }} />
                      <span style={{ color: TEXT_COLORS[i] }}>{m.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={240}>
        <Card padding="md">
          <p className="text-xs text-[#787774] uppercase tracking-widest mb-4">5 Pembayaran Terbaru</p>
          {latest5.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#787774]">Belum ada pembayaran tercatat.</div>
          ) : (
            <div className="divide-y divide-[#eaeaea]">
              {latest5.map(t => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{t.siswaNama}</p>
                    <p className="text-xs text-[#787774] font-mono">{t.id} · {formatTanggalPendek(t.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MetodeBadge metode={t.metode} />
                    <p className="text-sm font-semibold text-[#111111] font-mono">{formatRupiah(t.nominal)}</p>
                    <StatusBadge status={t.statusValidasi} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
