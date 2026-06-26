"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useEffect, useState } from "react";
import { FileText } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FadeIn from "@/components/ui/FadeIn";
import { createPendaftaran, getKursus, type PengaturanKursus } from "@/lib/api";

const inputClass =
  "w-full px-4 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] text-[#111111] focus:outline-none focus:border-[#111111] transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="text-xs text-[#787774] uppercase tracking-widest block mb-1.5">{label}</span>
      {children}
    </div>
  );
}

function readText(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayInputValue() {
  return formatDateInput(new Date());
}

function addWeeksToDate(dateValue: string, weeks: number) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + weeks * 7);
  return formatDateInput(date);
}

export default function PendaftaranPage() {
  const [kursus, setKursus] = useState<PengaturanKursus[]>([]);
  const [kodeKursus, setKodeKursus] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedKursus = kursus.find((item) => item.kode === kodeKursus);
  const tanggalSelesai = selectedKursus && tanggalMulai ? addWeeksToDate(tanggalMulai, selectedKursus.durasiMinggu) : "";

  useEffect(() => {
    getKursus().then(setKursus).catch(() => toast.error("Gagal memuat daftar program"));
    setTanggalMulai(todayInputValue());
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const kodeKursus = readText(fd, "kodeKursus");
    const selectedKursus = kursus.find((item) => item.kode === kodeKursus);

    if (!selectedKursus) {
      toast.error("Pilih program pelatihan terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      await createPendaftaran({
        namaLengkap: readText(fd, "namaLengkap"),
        noKtp: readText(fd, "noKtp"),
        tempatLahir: readText(fd, "tempatLahir"),
        tanggalLahir: readText(fd, "tanggalLahir"),
        jenisKelamin: readText(fd, "jenisKelamin") === "Perempuan" ? "Perempuan" : "Laki-laki",
        alamatLengkap: readText(fd, "alamatLengkap"),
        noTelpWa: readText(fd, "noTelpWa"),
        agama: readText(fd, "agama"),
        asalInstansi: readText(fd, "asalInstansi"),
        kejuruanPelatihan: selectedKursus.nama,
        kodeKursus,
        statusPendaftaran: readText(fd, "statusPendaftaran") === "draft" ? "draft" : "terdaftar",
        namaAyah: readText(fd, "namaAyah"),
        namaIbu: readText(fd, "namaIbu"),
        alamatOrangTua: readText(fd, "alamatOrangTua"),
        dokKtp: false,
        dokKk: false,
        dokIjasah: false,
        dokFoto: false,
        tempatTtd: readText(fd, "tempatTtd") || "Kudus",
        tanggalTtd: readText(fd, "tanggalTtd"),
        namaTerang: readText(fd, "namaTerang"),
        tanggalMulai: readText(fd, "tanggalMulai"),
        tanggalSelesai: readText(fd, "tanggalSelesai"),
      });
      toast.success("Formulir pendaftaran tersimpan ke backend");
      form.reset();
      setKodeKursus("");
      setTanggalMulai(todayInputValue());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan pendaftaran";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <FadeIn>
        <form onSubmit={submit} className="space-y-5">
          <Card padding="lg">
            <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">Data Peserta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Field label="1. Nama Lengkap"><input name="namaLengkap" required className={inputClass} placeholder="Nama calon peserta" /></Field>
              <Field label="2. KTP"><input name="noKtp" required className={`${inputClass} font-mono`} placeholder="3319xxxxxxxxxxxx" /></Field>
              <Field label="3. Telp / WA"><input name="noTelpWa" required className={`${inputClass} font-mono`} placeholder="08xxxxxxxxxx" /></Field>
              <Field label="4. Tempat Lahir"><input name="tempatLahir" required className={inputClass} placeholder="Tempat lahir" /></Field>
              <Field label="5. Tanggal Lahir"><input type="date" name="tanggalLahir" required className={inputClass} /></Field>
              <Field label="6. Jenis Kelamin">
                <select name="jenisKelamin" className={inputClass} defaultValue="Laki-laki">
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </Field>
              <Field label="7. Agama"><input name="agama" className={inputClass} placeholder="Agama" /></Field>
              <Field label="8. Asal Instansi"><input name="asalInstansi" className={inputClass} placeholder="Sekolah / Instansi / Umum" /></Field>
              <div className="md:col-span-2 xl:col-span-3">
                <Field label="Alamat Lengkap"><textarea name="alamatLengkap" required className={`${inputClass} resize-none`} rows={2} placeholder="Alamat lengkap calon peserta" /></Field>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">Program Pelatihan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Field label="Kejuruan Pelatihan">
                  <select name="kodeKursus" required className={inputClass} value={kodeKursus} onChange={(event) => setKodeKursus(event.target.value)} disabled={kursus.length === 0}>
                    <option value="" disabled>{kursus.length === 0 ? "Tambahkan program di Pengaturan dulu" : "Pilih program pelatihan"}</option>
                    {kursus.map((item) => (
                      <option key={item.kode} value={item.kode}>{item.nama} - {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.biaya)}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Mulai"><input type="date" name="tanggalMulai" value={tanggalMulai} onChange={(event) => setTanggalMulai(event.target.value)} className={inputClass} /></Field>
              <Field label="Selesai"><input type="date" name="tanggalSelesai" value={tanggalSelesai} readOnly className={`${inputClass} cursor-not-allowed text-[#787774]`} /></Field>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">Data Orang Tua</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nama Ayah"><input name="namaAyah" className={inputClass} placeholder="Nama ayah" /></Field>
              <Field label="Nama Ibu"><input name="namaIbu" className={inputClass} placeholder="Nama ibu" /></Field>
              <div className="md:col-span-2">
                <Field label="Alamat Orang Tua"><textarea name="alamatOrangTua" className={`${inputClass} resize-none`} rows={2} placeholder="Alamat orang tua / wali" /></Field>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">Tanda Tangan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Tempat"><input name="tempatTtd" defaultValue="Kudus" className={inputClass} /></Field>
              <Field label="Tanggal"><input name="tanggalTtd" type="date" className={inputClass} /></Field>
              <Field label="Nama Terang"><input name="namaTerang" className={inputClass} placeholder="Nama penanda tangan" /></Field>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center">
            <p className="text-xs text-[#787774] flex items-start gap-2">
              <FileText size={14} className="mt-0.5" /> Draft dan pendaftaran aktif sama-sama tersimpan di database.
            </p>
            <Button variant="outline" type="submit" name="statusPendaftaran" value="draft" disabled={submitting}>Simpan Draft</Button>
            <Button type="submit" name="statusPendaftaran" value="terdaftar" disabled={submitting}>Simpan Pendaftaran</Button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
