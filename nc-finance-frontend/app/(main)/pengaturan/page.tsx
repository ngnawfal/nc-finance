"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useEffect, useState, type FormEvent } from "react";
import { BookOpen, PencilSimple, Plus, Trash, User, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FadeIn from "@/components/ui/FadeIn";
import {
  createKursus,
  createUser,
  deleteKursus,
  deleteUser,
  getKursus,
  getProfil,
  getUsers,
  type PengaturanKursus,
  type PengaturanUser,
  type ProfilLembaga,
  updateKursus,
  updateProfil,
  updateUser,
} from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

const inputClass =
  "w-full px-4 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] focus:outline-none focus:border-[#111111] transition-colors";

function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function safeRole(value: string): "staf" | "manajer" {
  return value === "manajer" ? "manajer" : "staf";
}

export default function PengaturanPage() {
  const [users, setUsers] = useState<PengaturanUser[]>([]);
  const [kursus, setKursus] = useState<PengaturanKursus[]>([]);
  const [profil, setProfil] = useState<ProfilLembaga | null>(null);
  const [showUser, setShowUser] = useState(false);
  const [showKursus, setShowKursus] = useState(false);
  const [editingKursus, setEditingKursus] = useState<PengaturanKursus | null>(null);
  const [editingUser, setEditingUser] = useState<PengaturanUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "user" | "kursus"; id: string; label: string } | null>(null);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => toast.error("Gagal memuat pengguna"));
    getKursus().then(setKursus).catch(() => toast.error("Gagal memuat kursus"));
    getProfil().then(setProfil).catch(() => undefined);
  }, []);

  async function submitProfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const next = await updateProfil({
        nama: text(fd, "nama"),
        alamat: text(fd, "alamat"),
        nomorTelepon: text(fd, "nomorTelepon"),
        email: text(fd, "email"),
      });
      setProfil(next);
      toast.success("Profil disimpan");
    } catch {
      toast.error("Gagal menyimpan profil");
    }
  }

  async function submitUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      nama: text(fd, "nama"),
      email: text(fd, "email"),
      role: safeRole(text(fd, "role")),
      noHp: text(fd, "noHp"),
      password: text(fd, "password") || "admin123",
    };

    try {
      const next = editingUser ? await updateUser(editingUser.id, payload) : await createUser(payload);
      setUsers(next);
      setShowUser(false);
      setEditingUser(null);
      toast.success(editingUser ? "Pengguna diperbarui" : "Pengguna ditambahkan");
    } catch {
      toast.error("Gagal menyimpan pengguna");
    }
  }

  async function submitKursus(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      kode: text(fd, "kode"),
      nama: text(fd, "nama"),
      biaya: Math.round(Number(text(fd, "biaya") || 0)),
      durasiMinggu: Number(text(fd, "durasiMinggu") || 0),
      deskripsi: text(fd, "deskripsi"),
    };
    try {
      const next = editingKursus ? await updateKursus(editingKursus.kode, payload) : await createKursus(payload);
      setKursus(next);
      setShowKursus(false);
      setEditingKursus(null);
      toast.success(editingKursus ? "Kursus diperbarui" : "Kursus ditambahkan");
    } catch {
      toast.error("Gagal menyimpan kursus");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "user") setUsers(await deleteUser(deleteTarget.id));
      else setKursus(await deleteKursus(deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Data dihapus");
    } catch {
      toast.error("Gagal menghapus data. Pastikan belum dipakai transaksi/peserta.");
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FadeIn>
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5 items-start">
          <Card padding="lg">
            <h2 className="text-xs text-[#787774] uppercase tracking-widest mb-5 pb-3 border-b border-[#eaeaea]">Profil Lembaga</h2>
            <form onSubmit={submitProfil} className="space-y-4">
              <Input name="nama" label="Nama Lembaga" defaultValue={profil?.nama ?? "LPK Nida Course"} required />
              <Input name="alamat" label="Alamat" defaultValue={profil?.alamat ?? "Kudus, Jawa Tengah"} />
              <Input name="nomorTelepon" label="Nomor Telepon" defaultValue={profil?.nomorTelepon ?? ""} />
              <Input name="email" label="Email" type="email" defaultValue={profil?.email ?? ""} />
              <Button className="w-full">Simpan Profil</Button>
            </form>
          </Card>

          <div className="space-y-5">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#eaeaea]">
                <h2 className="text-xs text-[#787774] uppercase tracking-widest">Pengguna Sistem</h2>
                <Button size="sm" variant="outline" onClick={() => { setEditingUser(null); setShowUser(true); }}><Plus size={13} /> Tambah</Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {users.map((user) => (
                  <div key={user.id} className="border border-[#eaeaea] rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-[#f7f6f3] rounded-lg flex items-center justify-center"><User size={16} className="text-[#787774]" /></div>
                      <div className="min-w-0"><p className="text-sm font-medium text-[#111111] truncate">{user.nama}</p><p className="text-xs text-[#787774] truncate">{user.email}</p></div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-medium ${user.role === "manajer" ? "bg-[#e1f3fe] text-[#1f6c9f]" : "bg-[#f7f6f3] text-[#787774]"}`}>{user.role}</span>
                      <button type="button" onClick={() => { setEditingUser(user); setShowUser(true); }} className="text-[#787774] hover:text-[#111111]" aria-label={`Edit ${user.nama}`}><PencilSimple size={15} /></button>
                      <button type="button" onClick={() => setDeleteTarget({ type: "user", id: user.id, label: user.nama })} className="text-[#9f2f2d] hover:text-[#111111]" aria-label={`Hapus ${user.nama}`}><Trash size={15} /></button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <div className="lg:col-span-2 py-10 text-center text-sm text-[#787774]">Belum ada pengguna dari backend.</div>}
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#eaeaea]">
                <h2 className="text-xs text-[#787774] uppercase tracking-widest">Daftar Kursus</h2>
                <Button size="sm" variant="outline" onClick={() => { setEditingKursus(null); setShowKursus(true); }}><Plus size={13} /> Tambah</Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {kursus.map((item) => (
                  <div key={item.kode} className="border border-[#eaeaea] rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 bg-[#f7f6f3] rounded-lg flex items-center justify-center shrink-0"><BookOpen size={16} className="text-[#787774]" /></div>
                      <div><p className="text-sm font-medium text-[#111111]">{item.nama}</p><p className="font-mono text-xs text-[#787774] mt-0.5">{item.kode}</p><p className="text-xs text-[#787774] mt-1">Durasi: {item.durasiMinggu || 0} minggu</p><p className="text-xs text-[#787774] mt-1 line-clamp-2">{item.deskripsi}</p></div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-sm font-semibold text-[#111111]">{formatRupiah(item.biaya)}</span>
                      <button type="button" onClick={() => { setEditingKursus(item); setShowKursus(true); }} className="text-[#787774] hover:text-[#111111]" aria-label={`Edit ${item.nama}`}><PencilSimple size={15} /></button>
                      <button type="button" onClick={() => setDeleteTarget({ type: "kursus", id: item.kode, label: item.nama })} className="text-[#9f2f2d] hover:text-[#111111]" aria-label={`Hapus ${item.nama}`}><Trash size={15} /></button>
                    </div>
                  </div>
                ))}
                {kursus.length === 0 && <div className="lg:col-span-2 py-10 text-center text-sm text-[#787774]">Belum ada kursus dari backend.</div>}
              </div>
            </Card>
          </div>
        </div>
      </FadeIn>

      {showUser && (
        <Modal title={editingUser ? "Edit Pengguna" : "Tambah Pengguna"} onClose={() => { setShowUser(false); setEditingUser(null); }}>
          <form onSubmit={submitUser} className="space-y-3">
            <Input name="nama" label="Nama" defaultValue={editingUser?.nama} required />
            <Input name="email" label="Email" type="email" defaultValue={editingUser?.email} required />
            <Input name="noHp" label="No HP" defaultValue={editingUser?.noHp} />
            {!editingUser && <Input name="password" label="Password Awal" defaultValue="admin123" />}
            <label htmlFor="role" className="text-xs text-[#787774] uppercase tracking-widest block mb-1">Role</label>
            <select id="role" name="role" className={inputClass} defaultValue={editingUser?.role ?? "staf"}><option value="staf">Staf</option><option value="manajer">Manajer</option></select>
            <Button className="w-full">Simpan Pengguna</Button>
          </form>
        </Modal>
      )}

      {showKursus && (
        <Modal title={editingKursus ? "Edit Kursus" : "Tambah Kursus"} onClose={() => { setShowKursus(false); setEditingKursus(null); }}>
          <form onSubmit={submitKursus} className="space-y-3">
            <Input name="kode" label="Kode" placeholder="KRS-XXX" defaultValue={editingKursus?.kode} disabled={!!editingKursus} required />
            <Input name="nama" label="Nama Kursus" defaultValue={editingKursus?.nama} required />
            <RupiahInput name="biaya" label="Biaya" defaultValue={editingKursus?.biaya} placeholder="50.000" required />
            <Input name="durasiMinggu" label="Durasi Pelaksanaan (Minggu)" type="number" min={0} defaultValue={editingKursus?.durasiMinggu ?? 0} required />
            <Input name="deskripsi" label="Deskripsi" defaultValue={editingKursus?.deskripsi} />
            <Button className="w-full">Simpan Kursus</Button>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Konfirmasi Hapus" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[#787774]">Hapus {deleteTarget.label}?</p>
          <div className="flex gap-2 justify-end mt-5"><Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button><Button type="button" variant="danger" onClick={confirmDelete}>Hapus</Button></div>
        </Modal>
      )}
    </div>
  );
}

function Input({ label, id, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const inputId = id ?? String(rest.name ?? label);
  return <div><label htmlFor={inputId} className="text-xs text-[#787774] uppercase tracking-widest block mb-1">{label}</label><input id={inputId} className={inputClass} {...rest} /></div>;
}

function RupiahInput({ name, label, defaultValue, required, placeholder }: { name: string; label: string; defaultValue?: number; required?: boolean; placeholder?: string }) {
  const [display, setDisplay] = useState(defaultValue ? new Intl.NumberFormat("id-ID").format(Math.round(defaultValue)) : "");
  const raw = display.replace(/\D/g, "");
  return (
    <div>
      <label htmlFor={name} className="text-xs text-[#787774] uppercase tracking-widest block mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#787774] pointer-events-none">Rp</span>
        <input id={name} type="text" inputMode="numeric" autoComplete="off" value={display} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ""); setDisplay(digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : ""); }} className={`${inputClass} pl-10 font-mono`} placeholder={placeholder ?? "0"} required={required} />
      </div>
      <input type="hidden" name={name} value={raw} />
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white border border-[#eaeaea] rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5"><h2 id="modal-title" className="font-semibold text-[#111111]">{title}</h2><button type="button" onClick={onClose} aria-label="Tutup"><X size={18} className="text-[#787774]" /></button></div>
        {children}
      </div>
    </div>
  );
}
