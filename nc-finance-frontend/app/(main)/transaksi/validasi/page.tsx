"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/ui/FadeIn";
import { getPendingTransaksi, validateTransaksi } from "@/lib/api";
import type { Transaksi } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

export default function ValidasiTransaksiPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await getPendingTransaksi()); }
    catch { toast.error("Gagal memuat antrian validasi"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function decide(t: Transaksi, status: "approved" | "rejected") {
    const alasan = status === "rejected" ? window.prompt("Alasan penolakan") || "Ditolak manajer" : undefined;
    try {
      await validateTransaksi(t.id, status, alasan);
      setData((prev) => prev.filter((item) => item.id !== t.id));
      toast.success(status === "approved" ? "Transaksi disetujui" : "Transaksi ditolak");
    } catch {
      toast.error("Gagal memperbarui validasi");
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <FadeIn>
        <Card padding="md">
          {loading ? <div className="py-16 text-center text-sm text-[#787774]">Memuat antrian...</div> : data.length === 0 ? <div className="py-16 text-center text-sm text-[#787774]">Tidak ada transaksi pending.</div> : <div className="space-y-3">
            {data.map((t, index) => (
              <div key={t.id} className="border border-[#eaeaea] rounded-xl p-4 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0"><div className="flex items-center gap-2"><Badge className="bg-[#fbf3db] text-[#956400]">#{index + 1} Pending</Badge><p className="font-medium text-[#111111]">{t.siswaNama}</p></div><p className="font-mono text-xs text-[#787774] mt-1">{t.id} · {t.siswaNim} · {t.metode.toUpperCase()}</p>{t.catatan && <p className="text-xs text-[#787774] mt-1">{t.catatan}</p>}</div>
                <div className="flex flex-wrap items-center gap-2"><span className="font-mono font-semibold text-[#111111] mr-2">{formatRupiah(t.nominal)}</span>{t.buktiPath && <a href={t.buktiPath} target="_blank" rel="noreferrer" className="text-xs underline text-[#787774]">Lihat bukti</a>}<Button size="sm" onClick={() => decide(t, "approved")}><CheckCircle size={14} /> Setujui</Button><Button size="sm" variant="outline" onClick={() => decide(t, "rejected")}><XCircle size={14} /> Tolak</Button></div>
              </div>
            ))}
          </div>}
        </Card>
      </FadeIn>
    </div>
  );
}
