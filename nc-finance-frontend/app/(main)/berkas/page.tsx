"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getPendaftaran, updatePendaftaranBerkas } from "@/lib/api";
import { PendaftaranPeserta } from "@/lib/types";
import { CheckCircle, FileText, UploadSimple, WarningCircle, XCircle, X, DownloadSimple } from "@phosphor-icons/react";

function kelengkapan(p: PendaftaranPeserta) {
  const items = [p.dokKtp, p.dokKk, p.dokIjasah, p.dokFoto];
  return items.filter(Boolean).length;
}

export default function BerkasPage() {
  const [data, setData] = useState<PendaftaranPeserta[]>([]);
  const [filter, setFilter] = useState<"semua" | "lengkap" | "belum">("semua");
  const [preview, setPreview] = useState<{ url: string; name: string; label: string; pesertaName: string } | null>(null);

  useEffect(() => { getPendaftaran().then(setData); }, []);

  // ESC tutup modal
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreview(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadBerkas(p: PendaftaranPeserta, kind: "Ktp" | "Kk" | "Ijasah" | "Foto", file: File) {
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      alert("File harus JPG, PNG, atau PDF");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2 MB");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    const updated = await updatePendaftaranBerkas(p.nomorPendaftaran, {
      dokKtp: p.dokKtp || kind === "Ktp",
      dokKk: p.dokKk || kind === "Kk",
      dokIjasah: p.dokIjasah || kind === "Ijasah",
      dokFoto: p.dokFoto || kind === "Foto",
      [`dok${kind}File`]: dataUrl,
      [`dok${kind}Name`]: file.name,
    });
    setData(prev => prev.map(item => item.nomorPendaftaran === updated.nomorPendaftaran ? updated : item));
  }

  function previewBerkas(p: PendaftaranPeserta, label: string, file?: string | null, name?: string | null) {
    if (!file) return;
    setPreview({ url: file, name: name ?? `${label}`, label, pesertaName: p.namaLengkap });
  }

  const filtered = useMemo(() => data.filter(p => {
    const lengkap = kelengkapan(p) === 4;
    if (filter === "lengkap") return lengkap;
    if (filter === "belum") return !lengkap;
    return true;
  }), [data, filter]);

  const lengkapCount = data.filter(p => kelengkapan(p) === 4).length;
  const belumCount = data.length - lengkapCount;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="md"><p className="text-xs text-[#787774] uppercase tracking-widest">Total Pendaftar</p><p className="text-3xl font-semibold mt-2">{data.length}</p></Card>
          <Card padding="md"><p className="text-xs text-[#787774] uppercase tracking-widest">Berkas Lengkap</p><p className="text-3xl font-semibold mt-2 text-[#346538]">{lengkapCount}</p></Card>
          <Card padding="md"><p className="text-xs text-[#787774] uppercase tracking-widest">Perlu Dilengkapi</p><p className="text-3xl font-semibold mt-2 text-[#956400]">{belumCount}</p></Card>
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#eaeaea]">
            <div>
              <p className="text-xs text-[#787774] uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Monitoring Berkas</p>
            </div>
            <div className="flex gap-2">
              {(["semua", "lengkap", "belum"] as const).map(f => (
                <Button key={f} size="sm" variant={filter === f ? "primary" : "outline"} onClick={() => setFilter(f)}>
                  {f === "semua" ? "Semua" : f === "lengkap" ? "Lengkap" : "Belum"}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filtered.map(p => {
              const count = kelengkapan(p);
              const complete = count === 4;
              return (
                <div key={p.id} className="border border-[#eaeaea] rounded-xl p-4 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#111111]">{p.namaLengkap}</p>
                      {complete ? <Badge className="bg-[#edf3ec] text-[#346538]">Lengkap</Badge> : <Badge className="bg-[#fbf3db] text-[#956400]">Kurang {4 - count}</Badge>}
                    </div>
                    <p className="font-mono text-xs text-[#787774] mt-1">{p.nomorPendaftaran} · {p.noKtp}</p>
                    <p className="text-xs text-[#787774] mt-1">{p.kejuruanPelatihan}</p>
                  </div>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs min-w-[360px]">
                  {[
                    { label: "KTP", kind: "Ktp", ok: p.dokKtp, file: p.dokKtpFile, name: p.dokKtpName },
                    { label: "KK", kind: "Kk", ok: p.dokKk, file: p.dokKkFile, name: p.dokKkName },
                    { label: "Ijasah", kind: "Ijasah", ok: p.dokIjasah, file: p.dokIjasahFile, name: p.dokIjasahName },
                    { label: "Foto 3x4", kind: "Foto", ok: p.dokFoto, file: p.dokFotoFile, name: p.dokFotoName },
                  ].map((doc) => (
                    <div key={doc.label} className={`px-2 py-2 rounded-lg border ${doc.ok ? "bg-[#edf3ec] text-[#346538] border-[#edf3ec]" : "bg-[#fdebec] text-[#9f2f2d] border-[#fdebec]"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {doc.ok ? <CheckCircle size={12} weight="fill" /> : <XCircle size={12} weight="fill" />}
                        <span>{doc.label}</span>
                      </div>
                      <p className="truncate text-[10px] opacity-80 mb-1">{doc.name || "Belum upload"}</p>
                      <div className="flex gap-1">
                        <label className="flex-1 px-2 py-1 rounded bg-white/70 text-center cursor-pointer hover:bg-white">
                          <UploadSimple size={11} className="inline mr-1" />Upload
                      <input type="file" className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadBerkas(p, doc.kind as "Ktp" | "Kk" | "Ijasah" | "Foto", file); }} />
                        </label>
                        <button type="button" disabled={!doc.file} onClick={() => previewBerkas(p, doc.label, doc.file, doc.name)} className="flex-1 px-2 py-1 rounded bg-white/70 disabled:opacity-40 hover:bg-white">Preview</button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-[#787774]">
                <WarningCircle size={28} className="mx-auto mb-2" />
                Data belum tersedia.
              </div>
            )}
          </div>
        </Card>
      </FadeIn>

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#eaeaea] bg-[#f9f9f8]">
              <div className="min-w-0">
                <p className="text-xs text-[#787774] uppercase tracking-widest">{preview.label} · {preview.pesertaName}</p>
                <p className="text-sm font-medium text-[#111111] truncate">{preview.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={preview.url}
                  download={preview.name}
                  className="w-9 h-9 rounded-lg bg-white border border-[#eaeaea] hover:bg-[#f7f6f3] flex items-center justify-center text-[#787774]"
                  aria-label="Download"
                >
                  <DownloadSimple size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="w-9 h-9 rounded-lg bg-white border border-[#eaeaea] hover:bg-[#f7f6f3] flex items-center justify-center text-[#787774]"
                  aria-label="Tutup"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-[#0d0f14] flex items-center justify-center min-h-[400px]">
              {preview.url.startsWith("data:application/pdf") ? (
                <iframe src={preview.url} title={preview.name} className="w-full h-[70vh] bg-white" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt={preview.name} className="max-w-full max-h-[80vh] object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
