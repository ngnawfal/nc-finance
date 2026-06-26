"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Siswa } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { MagnifyingGlass, UploadSimple, CheckCircle, X, User as UserIcon, Receipt } from "@phosphor-icons/react";
import { formatRupiah } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createTransaksi, getSiswa } from "@/lib/api";

const schema = z.object({
  nim: z.string().min(1, "Pilih siswa dulu"),
  nominal: z.number({ error: "Nominal harus angka" }).min(1000, "Minimal Rp 1.000"),
  metode: z.enum(["qris", "transfer", "tunai"]),
  catatan: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const fmt = new Intl.NumberFormat("id-ID");

export default function InputTransaksiPage() {
  const router = useRouter();
  const [searchNim, setSearchNim] = useState("");
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [siswaData, setSiswaData] = useState<Siswa[]>([]);
  const [nominalDisplay, setNominalDisplay] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { getSiswa().then(setSiswaData); }, []);

  const { handleSubmit, setValue, watch, register, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { metode: "qris" },
  });

  const nominal = watch("nominal") || 0;
  const metode = watch("metode");

  const siswaResults = useMemo(() => {
    if (searchNim.length < 2) return [];
    const q = searchNim.toLowerCase();
    return siswaData.filter(s => s.nim.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q)).slice(0, 8);
  }, [searchNim, siswaData]);

  function selectSiswa(s: Siswa) {
    setSelectedSiswa(s);
    setValue("nim", s.nim, { shouldValidate: true });
    setSearchNim("");
  }

  function clearSiswa() {
    setSelectedSiswa(null);
    setValue("nim", "");
  }

  function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = e => setFilePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
await createTransaksi({ nim: data.nim, nominal: data.nominal, metode: data.metode, catatan: data.catatan, buktiPath: filePreview });
      setSubmitted(true);
      toast.success("Transaksi berhasil dicatat");
      setTimeout(() => router.push("/transaksi"), 1200);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error
        ?? (err as { message?: string })?.message
        ?? "Gagal menyimpan transaksi";
      toast.error(msg);
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <CheckCircle size={56} className="text-[#346538] mx-auto mb-4" weight="duotone" />
        <h2 className="text-xl font-semibold text-[#111111]">Transaksi Dicatat</h2>
        <p className="text-sm text-[#787774] mt-2">Pembayaran tercatat sebagai transaksi diterima</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FadeIn>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-serif text-2xl tracking-tight text-[#111111]">Catat Transaksi</h1>
              <p className="text-sm text-[#787774] mt-0.5">Rekam pembayaran peserta ke ledger keuangan</p>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
          {/* LEFT: form */}
          <div className="space-y-5">
            <FadeIn>
              <Card padding="lg">
                <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">1 — Data Siswa</h2>

                {!selectedSiswa ? (
                  <div className="relative">
                    <label htmlFor="siswa-search" className="text-xs font-medium text-[#787774] uppercase tracking-widest block mb-1.5">Cari Siswa (NIM / Nama)</label>
                    <div className="relative">
                      <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" />
                      <input
                        id="siswa-search"
                        value={searchNim}
                        onChange={e => setSearchNim(e.target.value)}
                        placeholder="Ketik minimal 2 karakter…"
                        autoComplete="off"
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] focus:outline-none focus:border-[#111111] transition-colors"
                      />
                    </div>
                    {searchNim.length >= 2 && siswaResults.length === 0 && (
                      <p className="text-xs text-[#787774] mt-2">Tidak ada siswa cocok dengan &quot;{searchNim}&quot;</p>
                    )}
                    {siswaResults.length > 0 && (
                      <div className="mt-2 border border-[#eaeaea] rounded-lg overflow-hidden max-h-[280px] overflow-y-auto">
                        {siswaResults.map(s => (
                          <button key={s.id} type="button" onClick={() => selectSiswa(s)} className="w-full px-4 py-3 text-left hover:bg-[#f7f6f3] transition-colors border-b border-[#eaeaea] last:border-0 flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#f7f6f3] rounded-lg flex items-center justify-center shrink-0">
                              <UserIcon size={14} className="text-[#787774]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#111111] truncate">{s.nama}</p>
                              <p className="text-xs text-[#787774] font-mono mt-0.5 truncate">{s.nim} · {s.kategoriKursus}</p>
                            </div>
                            <span className="text-xs text-[#787774] font-mono shrink-0">{formatRupiah(s.totalBiaya)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.nim && <p className="text-xs text-[#9f2f2d] mt-2">{errors.nim.message}</p>}
                  </div>
                ) : (
                  <div className="bg-[#f7f6f3] border border-[#eaeaea] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-[#eaeaea] rounded-lg flex items-center justify-center">
                          <UserIcon size={18} className="text-[#787774]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">{selectedSiswa.nama}</p>
                          <p className="text-xs text-[#787774] font-mono mt-0.5">{selectedSiswa.nim}</p>
                        </div>
                      </div>
                      <button type="button" onClick={clearSiswa} className="text-[#787774] hover:text-[#111111]" aria-label="Ganti siswa">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-[#eaeaea]">
                      <div><p className="text-xs text-[#787774] mb-0.5">Kursus</p><p className="text-[#111111]">{selectedSiswa.kategoriKursus}</p></div>
                      <div><p className="text-xs text-[#787774] mb-0.5">Total Biaya</p><p className="font-semibold text-[#111111]">{formatRupiah(selectedSiswa.totalBiaya)}</p></div>
                    </div>
                  </div>
                )}
              </Card>
            </FadeIn>

            <FadeIn delay={60}>
              <Card padding="lg">
                <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">2 — Rincian Pembayaran</h2>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="nominal" className="text-xs font-medium text-[#787774] uppercase tracking-widest block mb-1.5">Nominal</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#787774] pointer-events-none">Rp</span>
                      <input
                        id="nominal"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={nominalDisplay}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setNominalDisplay(digits ? fmt.format(Number(digits)) : "");
                          setValue("nominal", digits ? Number(digits) : 0, { shouldValidate: true });
                        }}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] focus:outline-none focus:border-[#111111] transition-colors font-mono text-base"
                      />
                    </div>
                    {selectedSiswa && nominal > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[selectedSiswa.totalBiaya, Math.round(selectedSiswa.totalBiaya / 2), Math.round(selectedSiswa.totalBiaya / 3)].map(v => (
                          <button key={v} type="button" onClick={() => { setNominalDisplay(fmt.format(v)); setValue("nominal", v, { shouldValidate: true }); }} className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#f7f6f3] hover:bg-[#eaeaea] text-[#787774] transition-colors">
                            {formatRupiah(v)}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.nominal && <p className="text-xs text-[#9f2f2d] mt-2">{errors.nominal.message}</p>}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#787774] uppercase tracking-widest block mb-2">Metode Pembayaran</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "qris", label: "QRIS", style: "bg-[#edf3ec] text-[#346538] border-[#346538]" },
                        { value: "transfer", label: "Transfer", style: "bg-[#e1f3fe] text-[#1f6c9f] border-[#1f6c9f]" },
                        { value: "tunai", label: "Tunai", style: "bg-[#fbf3db] text-[#956400] border-[#956400]" },
                      ].map(m => (
                        <label key={m.value} className={`flex items-center justify-center py-3 rounded-lg border text-xs font-medium tracking-widest uppercase cursor-pointer transition-all ${metode === m.value ? m.style : "border-[#eaeaea] text-[#787774] bg-white hover:bg-[#f9f9f8]"}`}>
                          <input type="radio" value={m.value} {...register("metode")} className="sr-only" />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="catatan" className="text-xs font-medium text-[#787774] uppercase tracking-widest block mb-1.5">Catatan (opsional)</label>
                    <textarea
                      id="catatan"
                      {...register("catatan")}
                      rows={2}
                      placeholder="Cicilan ke-1, pelunasan, dll."
                      className="w-full px-4 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] focus:outline-none focus:border-[#111111] transition-colors resize-none"
                    />
                  </div>
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={120}>
              <Card padding="lg">
                <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">3 — Bukti Pembayaran (opsional)</h2>
<div
role="button"
tabIndex={0}
aria-label="Unggah bukti pembayaran"
onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.preventDefault(); }}
onClick={() => {}}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? "border-[#111111] bg-[#f7f6f3]" : "border-[#eaeaea]"}`}
                >
                  {filePreview ? (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={filePreview} alt="Bukti pembayaran" className="h-32 mx-auto rounded-lg object-cover mb-3" />
                      <button type="button" onClick={() => setFilePreview(null)} className="text-xs text-[#9f2f2d] hover:underline">Hapus</button>
                    </div>
                  ) : (
                    <div>
                      <UploadSimple size={32} className="text-[#787774] mx-auto mb-3" />
                      <p className="text-sm text-[#787774]">Seret file ke sini atau</p>
                      <label className="mt-2 inline-block">
                        <span className="text-xs font-medium text-[#111111] underline cursor-pointer">pilih dari perangkat</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                      </label>
                      <p className="text-xs text-[#787774] mt-2">JPG, PNG — maks. 5 MB</p>
                    </div>
                  )}
                </div>
              </Card>
            </FadeIn>
          </div>

          {/* RIGHT: sticky summary */}
          <FadeIn delay={40}>
            <aside className="lg:sticky lg:top-20 space-y-4">
              <Card padding="lg">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#eaeaea]">
                  <Receipt size={16} className="text-[#787774]" />
                  <h2 className="text-xs text-[#787774] uppercase tracking-widest">Ringkasan</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#787774]">Siswa</span>
                    <span className="text-[#111111] text-right truncate max-w-[60%]">{selectedSiswa?.nama ?? "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#787774]">NIM</span>
                    <span className="text-[#111111] font-mono">{selectedSiswa?.nim ?? "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#787774]">Metode</span>
                    <span className="text-[#111111] uppercase tracking-widest text-xs">{metode}</span>
                  </div>
                  <div className="border-t border-[#eaeaea] pt-3 flex justify-between gap-3">
                    <span className="text-[#787774]">Nominal</span>
                    <span className="text-[#111111] font-semibold font-mono">{nominal > 0 ? formatRupiah(nominal) : "—"}</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={saving || !selectedSiswa || nominal < 1000}>
                  {saving ? "Menyimpan…" : "Simpan Transaksi"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">Batal</Button>
              </div>
            </aside>
          </FadeIn>
        </div>
      </form>
    </div>
  );
}
