"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useEffect, useMemo, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { getSiswa, getTransaksi } from "@/lib/api";
import { Siswa, Transaksi } from "@/lib/types";
import { escapeHtml, openHtmlDocument } from "@/lib/safePrint";

function buildMonthlyData(transaksi: Transaksi[]) {
  const months: Record<string, { label: string; total: number; count: number }> = {};
  for (const t of transaksi) {
    const key = t.createdAt.slice(0, 7);
    if (!months[key]) months[key] = { label: key, total: 0, count: 0 };
    months[key].total += t.nominal;
    months[key].count++;
  }
  return Object.values(months).sort((a, b) => a.label.localeCompare(b.label)).map(m => ({
    ...m,
    label: new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(new Date(m.label + "-01")),
  }));
}

export default function LaporanPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  useEffect(() => { getTransaksi().then(setTransaksi); getSiswa().then(setSiswa); }, []);

const transaksiApproved = transaksi.filter((t) => t.statusValidasi === "approved");
const monthlyData = useMemo(() => buildMonthlyData(transaksiApproved), [transaksiApproved]);
const totalPenerimaan = transaksiApproved.reduce((s, t) => s + t.nominal, 0);
const totalDisetujui = totalPenerimaan;
const rataPerTrx = transaksiApproved.length === 0 ? 0 : totalPenerimaan / transaksiApproved.length;
  const metodeData = ["qris", "transfer", "tunai"].map(m => ({
    name: m.toUpperCase(),
    jumlah: transaksiApproved.filter((t) => t.metode === m).length,
    total: transaksiApproved.filter((t) => t.metode === m).reduce((s, t) => s + t.nominal, 0),
  }));

  function printOwnerReport() {
    const rows = transaksi.map((t, i) => `
      <tr><td>${i + 1}</td><td>${escapeHtml(t.id)}</td><td>${escapeHtml(t.siswaNama)}</td><td>${escapeHtml(t.siswaNim)}</td><td>${escapeHtml(t.metode.toUpperCase())}</td><td>${formatRupiah(t.nominal)}</td><td>${escapeHtml(t.statusValidasi)}</td><td>${new Date(t.createdAt).toLocaleDateString("id-ID")}</td></tr>
    `).join("");
    const byMethod = metodeData.map(m => `<tr><td>${m.name}</td><td>${m.jumlah}</td><td>${formatRupiah(m.total)}</td></tr>`).join("");
    const html = `<!doctype html><html><head><title>Rekap Owner N.C Admin</title><style>
      body{font-family:Arial,sans-serif;color:#111;margin:32px} .head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:22px}.brand{font-family:Georgia,serif;font-size:28px;font-weight:700}.muted{color:#666;font-size:12px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.card{border:1px solid #ddd;padding:12px}.label{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#666}.value{font-size:18px;font-weight:700;margin-top:6px}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2;text-transform:uppercase;font-size:10px;letter-spacing:.08em}.section{margin-top:24px} @media print{body{margin:18mm}.no-print{display:none}}
    </style></head><body><button class="no-print" onclick="window.print()">Cetak / Simpan PDF</button><div class="head"><div><div class="brand">N.C Admin</div><div class="muted">LPK Nida Course — Rekap Pengelolaan Owner</div></div><div class="muted">Tanggal cetak<br/><b>${new Date().toLocaleString("id-ID")}</b></div></div><div class="grid"><div class="card"><div class="label">Total Penerimaan</div><div class="value">${formatRupiah(totalPenerimaan)}</div></div><div class="card"><div class="label">Diterima</div><div class="value">${formatRupiah(totalDisetujui)}</div></div><div class="card"><div class="label">Transaksi</div><div class="value">${transaksi.length}</div></div><div class="card"><div class="label">Peserta</div><div class="value">${siswa.length}</div></div></div><div class="section"><h3>Ringkasan Metode Pembayaran</h3><table><thead><tr><th>Metode</th><th>Jumlah Transaksi</th><th>Total</th></tr></thead><tbody>${byMethod}</tbody></table></div><div class="section"><h3>Detail Transaksi</h3><table><thead><tr><th>No</th><th>ID</th><th>Peserta</th><th>NIM</th><th>Metode</th><th>Nominal</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>${rows || "<tr><td colspan='8'>Belum ada transaksi</td></tr>"}</tbody></table></div><script>window.print()</script></body></html>`;
    openHtmlDocument(html);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
          <div>
            <p className="text-xs text-[#787774] uppercase tracking-widest">Output Owner</p>
            <h2 className="text-xl font-serif text-[#111111] mt-1">Rekap Pengelolaan</h2>
          </div>
          <Button onClick={printOwnerReport}>Cetak Rekap Owner</Button>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Pembayaran", value: formatRupiah(totalPenerimaan) },
            { label: "Pembayaran Diterima", value: formatRupiah(totalDisetujui) },
            { label: "Rata-rata per Transaksi", value: formatRupiah(rataPerTrx) },
          ].map(c => (
            <Card key={c.label} padding="md">
              <p className="text-xs text-[#787774] uppercase tracking-widest">{c.label}</p>
              <p className="text-2xl font-semibold text-[#111111] font-mono mt-2">{c.value}</p>
            </Card>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <Card padding="md">
          <p className="text-xs text-[#787774] uppercase tracking-widest mb-5">Penerimaan Bulanan</p>
          {monthlyData.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#787774]">Belum ada pembayaran tercatat.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#787774" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(Number(v) / 1000000).toFixed(1)}jt`} tick={{ fontSize: 11, fill: "#787774" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [formatRupiah(Number(v)), "Penerimaan"]} contentStyle={{ border: "1px solid #eaeaea", borderRadius: 6, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="#111111" strokeWidth={2} fill="rgba(17,17,17,0.05)" dot={{ r: 3, fill: "#111111" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={120}>
        <Card padding="md">
          <p className="text-xs text-[#787774] uppercase tracking-widest mb-4">Breakdown Metode Pembayaran</p>
          {transaksi.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#787774]">Belum ada data metode pembayaran.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metodeData} barSize={32}>
                <CartesianGrid vertical={false} stroke="#eaeaea" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#787774" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#787774" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, name) => [name === "total" ? formatRupiah(Number(v)) : v, name === "total" ? "Nominal" : "Jumlah"]} contentStyle={{ border: "1px solid #eaeaea", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="jumlah" fill="#eaeaea" radius={[3, 3, 0, 0]} />
                <Bar dataKey="total" fill="#111111" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
