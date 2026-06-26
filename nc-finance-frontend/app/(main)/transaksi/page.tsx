"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowCounterClockwise, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import type { MetodeBayar, Transaksi } from "@/lib/types";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetodeBadge, StatusBadge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/ui/FadeIn";
import { deleteTransaksi, getTransaksi, restoreTransaksi, undoTransaksi, updateTransaksi } from "@/lib/api";
import { openHtmlDocument } from "@/lib/safePrint";

export default function TransaksiPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [undoStack, setUndoStack] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState("");
  const [metodeFilter, setMetodeFilter] = useState<MetodeBayar | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Transaksi | null>(null);
  const [deleting, setDeleting] = useState<Transaksi | null>(null);
  const PAGE_SIZE = 8;

  const load = useCallback(async () => { setData(await getTransaksi()); }, []);
  useEffect(() => { load().catch(() => toast.error("Gagal memuat transaksi")); }, [load]);

  const filtered = useMemo(() => data.filter((t) => (search === "" || t.siswaNama.toLowerCase().includes(search.toLowerCase()) || t.siswaNim.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())) && (metodeFilter === "" || t.metode === metodeFilter)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [data, search, metodeFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleUndo() {
    try {
      const undone = await undoTransaksi();
      setUndoStack((prev) => [...prev, undone]);
      setData((prev) => prev.filter((t) => t.id !== undone.id));
      toast.success(`Transaksi ${undone.id} dihapus (undo tersedia)`);
    } catch { toast.error("Tidak ada transaksi yang dapat di-undo atau akses ditolak"); }
  }

  async function handleRestore() {
    const top = undoStack[undoStack.length - 1];
    if (!top) { toast.error("Tidak ada transaksi yang dapat dipulihkan"); return; }
    try {
      const restored = await restoreTransaksi(top);
      setUndoStack((prev) => prev.slice(0, -1));
      setData((prev) => [restored, ...prev]);
      toast.success(`Transaksi ${restored.id} dipulihkan`);
    } catch { toast.error("Gagal memulihkan transaksi"); }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateTransaksi(editing.id, { nominal: Number(fd.get("nominal")), metode: String(fd.get("metode")) as MetodeBayar, catatan: String(fd.get("catatan") || "") });
      setEditing(null); await load(); toast.success("Transaksi diperbarui");
    } catch { toast.error("Gagal memperbarui transaksi"); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try { await deleteTransaksi(deleting.id); setData((prev) => prev.filter((item) => item.id !== deleting.id)); setDeleting(null); toast.success("Transaksi dihapus"); }
    catch { toast.error("Gagal menghapus transaksi"); }
  }

  function printNota(t: Transaksi) {
    const html = `<!doctype html><html><head><title>Nota ${t.id}</title><style>body{font-family:Arial,sans-serif;color:#111;margin:32px}.nota{max-width:520px;margin:auto;border:1px solid #111;padding:28px}.row{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:10px 0}.muted{color:#666;font-size:12px}.value{font-weight:700}.total{font-size:22px}.no-print{margin-bottom:16px}@media print{body{margin:0}.no-print{display:none}.nota{border:0}}</style></head><body><div class="nota"><button class="no-print" onclick="window.print()">Cetak / Simpan PDF</button><h2>N.C Finance</h2><p class="muted">LPK Nida Course Kudus · ${t.id}</p><div class="row"><span>Peserta</span><span class="value">${t.siswaNama}</span></div><div class="row"><span>NIM</span><span class="value">${t.siswaNim}</span></div><div class="row"><span>Tanggal</span><span class="value">${new Date(t.createdAt).toLocaleDateString("id-ID")}</span></div><div class="row"><span>Status</span><span class="value">${t.statusValidasi}</span></div><div class="row"><span>Total Bayar</span><span class="value total">${formatRupiah(t.nominal)}</span></div></div><script>window.print()</script></body></html>`;
    openHtmlDocument(html);
  }

  return <div className="max-w-7xl mx-auto space-y-5">
    <FadeIn><div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"><div className="flex gap-2 flex-1"><div className="relative flex-1 max-w-xs"><MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama, NIM, ID…" className="w-full pl-9 pr-4 py-2 text-sm border border-[#eaeaea] rounded-lg bg-white focus:outline-none focus:border-[#111111] transition-colors" /></div><select value={metodeFilter} onChange={(e) => { setMetodeFilter(e.target.value as MetodeBayar | ""); setPage(1); }} className="px-3 py-2 text-sm border border-[#eaeaea] rounded-lg bg-white text-[#787774] focus:outline-none focus:border-[#111111] transition-colors"><option value="">Semua Metode</option><option value="qris">QRIS</option><option value="transfer">Transfer</option><option value="tunai">Tunai</option></select></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={handleUndo} disabled={data.length === 0} title="Undo transaksi terbaru (Stack LIFO)"><ArrowCounterClockwise size={14} /> Undo</Button>{undoStack.length > 0 && <Button variant="ghost" size="sm" onClick={handleRestore}>Pulihkan ({undoStack.length})</Button>}<Link href="/transaksi/input"><Button size="sm"><Plus size={14} /> Catat</Button></Link></div></div></FadeIn>
    {undoStack.length > 0 && <div className="bg-[#fbf3db] border border-[#eaeaea] rounded-lg px-4 py-2.5 text-xs text-[#956400] flex items-center gap-2"><ArrowCounterClockwise size={13} /><span>Stack LIFO {undoStack.length} transaksi siap dipulihkan.</span></div>}
    <FadeIn delay={80}><Card padding="sm"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[#eaeaea]">{["ID Transaksi", "Nama Siswa", "NIM", "Nominal", "Metode", "Status", "Tanggal", "Aksi"].map((h) => <th key={h} className="text-left px-3 py-3 text-xs text-[#787774] uppercase tracking-widest font-medium">{h}</th>)}</tr></thead><tbody>{paginated.map((t) => <tr key={t.id} className="border-b border-[#eaeaea] hover:bg-[#f9f9f8] transition-colors"><td className="px-3 py-3 font-mono text-xs text-[#787774]">{t.id}</td><td className="px-3 py-3 font-medium text-[#111111]">{t.siswaNama}</td><td className="px-3 py-3 font-mono text-xs text-[#787774]">{t.siswaNim}</td><td className="px-3 py-3 font-mono text-sm font-semibold text-[#111111]">{formatRupiah(t.nominal)}</td><td className="px-3 py-3"><MetodeBadge metode={t.metode} /></td><td className="px-3 py-3"><StatusBadge status={t.statusValidasi} /></td><td className="px-3 py-3 text-xs text-[#787774]">{formatTanggalPendek(t.createdAt)}</td><td className="px-3 py-3"><div className="flex gap-2 text-xs"><button type="button" onClick={() => setEditing(t)} className="text-[#111111] hover:underline">Edit</button><button type="button" onClick={() => setDeleting(t)} className="text-[#9f2f2d] hover:underline">Hapus</button><button type="button" onClick={() => printNota(t)} className="text-[#346538] hover:underline">Cetak</button></div></td></tr>)}{paginated.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-sm text-[#787774]">Tidak ada data transaksi</td></tr>}</tbody></table></div>{totalPages > 1 && <div className="flex items-center justify-between px-3 pt-4 border-t border-[#eaeaea] mt-2"><p className="text-xs text-[#787774]">{filtered.length} transaksi ditemukan</p><div className="flex gap-1">{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => <button type="button" key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded ${p === page ? "bg-[#111111] text-white" : "text-[#787774] hover:bg-[#f7f6f3]"}`}>{p}</button>)}</div></div>}</Card></FadeIn>
    {editing && <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true"><form onSubmit={saveEdit} className="bg-white border border-[#eaeaea] rounded-2xl w-full max-w-md p-6 space-y-3"><h2 className="font-semibold text-[#111111]">Edit transaksi {editing.id}</h2><input name="nominal" type="number" defaultValue={editing.nominal} className="w-full px-4 py-2.5 border border-[#eaeaea] rounded-lg" /><select name="metode" defaultValue={editing.metode} className="w-full px-4 py-2.5 border border-[#eaeaea] rounded-lg"><option value="qris">QRIS</option><option value="transfer">Transfer</option><option value="tunai">Tunai</option></select><textarea name="catatan" defaultValue={editing.catatan || ""} className="w-full px-4 py-2.5 border border-[#eaeaea] rounded-lg" /><div className="flex gap-2 justify-end"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Batal</Button><Button>Simpan</Button></div></form></div>}
    {deleting && <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true"><div className="bg-white border border-[#eaeaea] rounded-2xl w-full max-w-md p-6"><h2 className="font-semibold text-[#111111]">Hapus transaksi?</h2><p className="text-sm text-[#787774] mt-2">Transaksi {deleting.id} akan dihapus dari database.</p><div className="flex gap-2 justify-end mt-5"><Button type="button" variant="outline" onClick={() => setDeleting(null)}>Batal</Button><Button type="button" onClick={confirmDelete}>Hapus</Button></div></div></div>}
  </div>;
}
