"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useCallback, useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, MapPin, Phone, Plus, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FadeIn from "@/components/ui/FadeIn";
import { MetodeBadge, StatusBadge } from "@/components/ui/Badge";
import {
  createSiswa,
  deletePendaftaran,
  deleteSiswa,
  getKursus,
  getPendaftaran,
  getSiswa,
  getTransaksi,
  updateSiswa,
  type PengaturanKursus,
} from "@/lib/api";
import type { PendaftaranPeserta, Siswa, Transaksi } from "@/lib/types";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";

const inputClass =
  "w-full px-3 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] focus:outline-none focus:border-[#111111] transition-colors";

type SiswaForm = {
  nim: string;
  nama: string;
  kategoriKursus: string;
  noHp: string;
  alamat: string;
  tanggalMulai: string;
  tanggalSelesai: string;
};

const emptyForm: SiswaForm = {
  nim: "",
  nama: "",
  kategoriKursus: "",
  noHp: "",
  alamat: "",
  tanggalMulai: "",
  tanggalSelesai: "",
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs text-[#787774] uppercase tracking-widest block mb-1">{label}</span>
      {children}
    </div>
  );
}

export default function SiswaPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Siswa | null>(null);
  const [selectedPendaftaran, setSelectedPendaftaran] = useState<PendaftaranPeserta | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SiswaForm>(emptyForm);
  const [siswaData, setSiswaData] = useState<Siswa[]>([]);
  const [transaksiData, setTransaksiData] = useState<Transaksi[]>([]);
  const [pendaftaranData, setPendaftaranData] = useState<PendaftaranPeserta[]>([]);
  const [kursusData, setKursusData] = useState<PengaturanKursus[]>([]);

  const reloadData = useCallback(async () => {
    const [siswa, transaksi, pendaftaran, kursus] = await Promise.all([getSiswa(), getTransaksi(), getPendaftaran(), getKursus()]);
    setSiswaData(siswa);
    setTransaksiData(transaksi);
    setPendaftaranData(pendaftaran);
    setKursusData(kursus);
  }, []);

  useEffect(() => {
    reloadData().catch(() => toast.error("Gagal memuat data siswa"));
  }, [reloadData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return siswaData.filter((siswa) => siswa.nama.toLowerCase().includes(q) || siswa.nim.toLowerCase().includes(q));
  }, [search, siswaData]);

  const filteredPendaftaran = useMemo(() => {
    const q = search.toLowerCase();
    return pendaftaranData.filter(
      (item) =>
        item.namaLengkap.toLowerCase().includes(q) ||
        item.nomorPendaftaran.toLowerCase().includes(q) ||
        item.noKtp.toLowerCase().includes(q),
    );
  }, [pendaftaranData, search]);

  const detail = selected
    ? transaksiData.filter((transaksi) => transaksi.siswaId === selected.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  function openAdd() {
    setForm({ ...emptyForm, kategoriKursus: kursusData[0]?.nama ?? "" });
    setShowAdd(true);
  }

  async function submitSiswa(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.nama.trim() || !form.kategoriKursus.trim()) {
      toast.error("Nama dan kursus wajib diisi");
      return;
    }

    setSaving(true);
    try {
      await createSiswa({
        nim: form.nim.trim(),
        nama: form.nama.trim(),
        kategoriKursus: form.kategoriKursus.trim(),
        noHp: form.noHp.trim(),
        alamat: form.alamat.trim(),
        tanggalMulai: form.tanggalMulai || null,
        tanggalSelesai: form.tanggalSelesai || null,
      });
      toast.success("Siswa tersimpan ke backend");
      setShowAdd(false);
      setForm(emptyForm);
      await reloadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan siswa");
    } finally {
      setSaving(false);
    }
  }

  async function editSiswaLangsung(siswa: Siswa) {
    const nama = prompt("Nama peserta", siswa.nama);
    if (nama === null) return;
    const noHp = prompt("No. HP", siswa.noHp);
    if (noHp === null) return;
    const alamat = prompt("Alamat", siswa.alamat);
    if (alamat === null) return;
    const tanggalMulai = prompt("Tanggal mulai pelatihan (YYYY-MM-DD)", siswa.tanggalMulai ?? "");
    if (tanggalMulai === null) return;
    const tanggalSelesai = prompt("Tanggal selesai pelatihan (YYYY-MM-DD)", siswa.tanggalSelesai ?? "");
    if (tanggalSelesai === null) return;

    try {
      const updated = await updateSiswa(siswa.nim, { ...siswa, nama, noHp, alamat, tanggalMulai, tanggalSelesai });
      if (selected?.nim === siswa.nim) setSelected(updated);
      await reloadData();
      toast.success("Data siswa diperbarui");
    } catch {
      toast.error("Gagal memperbarui peserta");
    }
  }

  async function hapusSiswaLangsung(siswa: Siswa) {
    if (!confirm(`Hapus peserta ${siswa.nama} (${siswa.nim})?`)) return;
    try {
      await deleteSiswa(siswa.nim);
      if (selected?.nim === siswa.nim) setSelected(null);
      await reloadData();
      toast.success("Siswa dihapus");
    } catch {
      toast.error("Gagal menghapus peserta");
    }
  }

  async function hapusPendaftaranLangsung(pendaftaran: PendaftaranPeserta) {
    if (!confirm(`Hapus pendaftaran ${pendaftaran.namaLengkap} (${pendaftaran.nomorPendaftaran})?`)) return;
    try {
      await deletePendaftaran(pendaftaran.nomorPendaftaran);
      await reloadData();
      toast.success("Pendaftaran dihapus");
    } catch {
      toast.error("Gagal menghapus pendaftaran");
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <FadeIn>
        <div className="flex gap-3 items-center">
          <label className="relative flex-1 max-w-xs">
            <span className="sr-only">Cari nama, NIM, atau pendaftaran</span>
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau NIM…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#eaeaea] rounded-lg bg-white focus:outline-none focus:border-[#111111] transition-colors"
            />
          </label>
          <Button size="sm" onClick={openAdd}><Plus size={14} /> Tambah Siswa</Button>
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPendaftaran.map((pendaftaran) => (
            <Card key={pendaftaran.nomorPendaftaran} padding="md" className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-[#edf3ec] rounded-lg flex items-center justify-center text-sm font-medium text-[#346538]">
                  {initials(pendaftaran.namaLengkap)}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-medium bg-[#edf3ec] text-[#346538]">
                  {pendaftaran.statusPendaftaran}
                </span>
              </div>
              <p className="font-medium text-sm text-[#111111]">{pendaftaran.namaLengkap}</p>
              <p className="font-mono text-xs text-[#787774] mt-0.5">{pendaftaran.nomorPendaftaran}</p>
              <p className="text-xs text-[#787774] mt-2">{pendaftaran.kejuruanPelatihan}</p>
              <div className="mt-3 pt-3 border-t border-[#eaeaea] flex items-center justify-between">
                <span className="text-xs text-[#787774]">No KTP</span>
                <span className="text-xs font-mono text-[#111111]">{pendaftaran.noKtp}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#eaeaea] flex gap-2 text-xs">
                <button type="button" onClick={() => setSelectedPendaftaran(pendaftaran)} className="flex-1 px-2 py-1.5 rounded-lg border border-[#eaeaea] text-[#111111] hover:bg-[#f7f6f3]">Detail</button>
                <button type="button" onClick={() => hapusPendaftaranLangsung(pendaftaran)} className="flex-1 px-2 py-1.5 rounded-lg border border-[#fdebec] text-[#9f2f2d] hover:bg-[#fdebec]">Hapus</button>
              </div>
            </Card>
          ))}

          {filteredPendaftaran.length === 0 && filtered.map((siswa) => (
            <Card key={siswa.id} padding="md" className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-[#f7f6f3] rounded-full flex items-center justify-center text-sm font-medium text-[#787774]">
                  {initials(siswa.nama)}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-medium ${siswa.status === "aktif" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#f7f6f3] text-[#787774]"}`}>
                  {siswa.status}
                </span>
              </div>
              <p className="font-medium text-sm text-[#111111]">{siswa.nama}</p>
              <p className="font-mono text-xs text-[#787774] mt-0.5">{siswa.nim}</p>
              <p className="text-xs text-[#787774] mt-2">{siswa.kategoriKursus}</p>
              <div className="mt-3 pt-3 border-t border-[#eaeaea] flex items-center justify-between">
                <span className="text-xs text-[#787774]">Total biaya</span>
                <span className="text-sm font-semibold font-mono text-[#111111]">{formatRupiah(siswa.totalBiaya)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#eaeaea] flex gap-2 text-xs">
                <button type="button" onClick={() => setSelected(siswa)} className="flex-1 px-2 py-1.5 rounded-lg border border-[#eaeaea] text-[#111111] hover:bg-[#f7f6f3]">Detail</button>
                <button type="button" onClick={() => editSiswaLangsung(siswa)} className="flex-1 px-2 py-1.5 rounded-lg border border-[#eaeaea] text-[#111111] hover:bg-[#f7f6f3]">Edit</button>
                <button type="button" onClick={() => hapusSiswaLangsung(siswa)} className="flex-1 px-2 py-1.5 rounded-lg border border-[#fdebec] text-[#9f2f2d] hover:bg-[#fdebec]">Hapus</button>
              </div>
            </Card>
          ))}

          {filteredPendaftaran.length === 0 && filtered.length === 0 && (
            <div className="lg:col-span-3 text-center py-16 text-sm text-[#787774]">Siswa tidak ditemukan</div>
          )}
        </div>
      </FadeIn>

      {selectedPendaftaran && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="pendaftaran-title" className="bg-white border border-[#eaeaea] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaeaea]">
              <h2 id="pendaftaran-title" className="font-semibold text-[#111111]">{selectedPendaftaran.namaLengkap}</h2>
              <button type="button" aria-label="Tutup detail pendaftaran" onClick={() => setSelectedPendaftaran(null)} className="text-[#787774] hover:text-[#111111]"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-[#787774]">No Pendaftaran</p><p className="font-mono text-[#111111]">{selectedPendaftaran.nomorPendaftaran}</p></div>
                <div><p className="text-xs text-[#787774]">No KTP</p><p className="font-mono text-[#111111]">{selectedPendaftaran.noKtp}</p></div>
                <div><p className="text-xs text-[#787774]">Tempat/Tgl Lahir</p><p className="text-[#111111]">{selectedPendaftaran.tempatLahir}, {selectedPendaftaran.tanggalLahir}</p></div>
                <div><p className="text-xs text-[#787774]">Jenis Kelamin</p><p className="text-[#111111]">{selectedPendaftaran.jenisKelamin}</p></div>
                <div><p className="text-xs text-[#787774]">No Telp/WA</p><p className="text-[#111111]">{selectedPendaftaran.noTelpWa}</p></div>
                <div><p className="text-xs text-[#787774]">Agama</p><p className="text-[#111111]">{selectedPendaftaran.agama || "-"}</p></div>
                <div><p className="text-xs text-[#787774]">Asal Instansi</p><p className="text-[#111111]">{selectedPendaftaran.asalInstansi || "-"}</p></div>
                <div><p className="text-xs text-[#787774]">Kejuruan</p><p className="text-[#111111]">{selectedPendaftaran.kejuruanPelatihan}</p></div>
                <div className="col-span-2"><p className="text-xs text-[#787774]">Alamat Lengkap</p><p className="text-[#111111]">{selectedPendaftaran.alamatLengkap}</p></div>
              </div>
              <div className="pt-4 border-t border-[#eaeaea] grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-[#787774]">Nama Ayah</p><p>{selectedPendaftaran.namaAyah || "-"}</p></div>
                <div><p className="text-xs text-[#787774]">Nama Ibu</p><p>{selectedPendaftaran.namaIbu || "-"}</p></div>
                <div className="col-span-2"><p className="text-xs text-[#787774]">Alamat Orang Tua</p><p>{selectedPendaftaran.alamatOrangTua || "-"}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="siswa-title" className="bg-white border border-[#eaeaea] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaeaea]">
              <h2 id="siswa-title" className="font-semibold text-[#111111]">{selected.nama}</h2>
              <button type="button" aria-label="Tutup detail siswa" onClick={() => setSelected(null)} className="text-[#787774] hover:text-[#111111]"><X size={18} /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-[#787774]">NIM</p><p className="font-mono text-[#111111]">{selected.nim}</p></div>
                <div><p className="text-xs text-[#787774]">Kursus</p><p className="text-[#111111]">{selected.kategoriKursus}</p></div>
                <div><p className="text-xs text-[#787774]"><Phone size={11} className="inline mr-1" />No. HP</p><p className="text-[#111111]">{selected.noHp || "-"}</p></div>
                <div><p className="text-xs text-[#787774]">Tanggal Daftar</p><p className="text-[#111111]">{formatTanggalPendek(selected.tanggalDaftar)}</p></div>
                <div><p className="text-xs text-[#787774]">Mulai Pelatihan</p><p className="text-[#111111]">{selected.tanggalMulai ? formatTanggalPendek(selected.tanggalMulai) : "Belum diisi"}</p></div>
                <div><p className="text-xs text-[#787774]">Selesai Pelatihan</p><p className="text-[#111111]">{selected.tanggalSelesai ? formatTanggalPendek(selected.tanggalSelesai) : "Belum diisi"}</p></div>
                <div className="col-span-2"><p className="text-xs text-[#787774]"><MapPin size={11} className="inline mr-1" />Alamat</p><p className="text-[#111111]">{selected.alamat || "-"}</p></div>
              </div>
              <div className="pt-3 border-t border-[#eaeaea]">
                <p className="text-xs text-[#787774] uppercase tracking-widest mb-3">Riwayat Pembayaran</p>
                {detail.length === 0 ? (
                  <p className="text-sm text-[#787774]">Belum ada transaksi</p>
                ) : (
                  <div className="space-y-2">
                    {detail.map((transaksi) => (
                      <div key={transaksi.id} className="flex items-center justify-between py-2.5 border-b border-[#eaeaea] last:border-0">
                        <div>
                          <p className="text-xs font-mono text-[#787774]">{transaksi.id}</p>
                          <p className="text-xs text-[#787774] mt-0.5">{formatTanggalPendek(transaksi.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <MetodeBadge metode={transaksi.metode} />
                          <span className="text-sm font-semibold font-mono text-[#111111]">{formatRupiah(transaksi.nominal)}</span>
                          <StatusBadge status={transaksi.statusValidasi} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <form role="dialog" aria-modal="true" aria-labelledby="add-siswa-title" className="bg-white border border-[#eaeaea] rounded-2xl w-full max-w-md p-6" onSubmit={submitSiswa}>
            <div className="flex items-center justify-between mb-5">
              <h2 id="add-siswa-title" className="font-semibold text-[#111111]">Tambah Siswa</h2>
              <button type="button" aria-label="Tutup form tambah siswa" onClick={() => setShowAdd(false)}><X size={18} className="text-[#787774]" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Nama Lengkap"><input value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} required className={inputClass} placeholder="Nama siswa" /></Field>
              <Field label="NIM"><input value={form.nim} onChange={(event) => setForm({ ...form, nim: event.target.value })} className={`${inputClass} font-mono`} placeholder="Kosongkan untuk generate otomatis" /></Field>
              <Field label="Kursus">
                <select value={form.kategoriKursus} onChange={(event) => setForm({ ...form, kategoriKursus: event.target.value })} required className={inputClass}>
                  <option value="" disabled>Pilih kursus</option>
                  {kursusData.map((kursus) => <option key={kursus.kode} value={kursus.nama}>{kursus.nama}</option>)}
                </select>
              </Field>
              <Field label="No. HP"><input value={form.noHp} onChange={(event) => setForm({ ...form, noHp: event.target.value })} className={inputClass} placeholder="08xxxxxxxxxx" /></Field>
              <Field label="Alamat"><textarea value={form.alamat} onChange={(event) => setForm({ ...form, alamat: event.target.value })} className={`${inputClass} resize-none`} rows={2} placeholder="Alamat siswa" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mulai"><input type="date" value={form.tanggalMulai} onChange={(event) => setForm({ ...form, tanggalMulai: event.target.value })} className={inputClass} /></Field>
                <Field label="Selesai"><input type="date" value={form.tanggalSelesai} onChange={(event) => setForm({ ...form, tanggalSelesai: event.target.value })} className={inputClass} /></Field>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={saving}>Simpan</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
