"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeSimple, Eye, EyeSlash, LockKey } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await login(form.email, form.password);
      localStorage.setItem("nc_token", session.token);
      localStorage.setItem("nc_user", JSON.stringify(session.user));
      toast.success("Berhasil masuk");
      router.push("/dashboard");
    } catch {
      toast.error("Email atau kata sandi salah");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(255,250,235,0.6) 0%, transparent 70%)", opacity: 0.8 }} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-10 fade-in visible"><h1 className="font-serif text-3xl text-[#111111] tracking-tight leading-tight">N.C Finance</h1><p className="text-sm text-[#787774] mt-2">LPK Nida Course Kudus, Jawa Tengah</p></div>
        <div className="bg-white border border-[#eaeaea] rounded-xl p-8">
          <h2 className="text-base font-semibold text-[#111111] mb-6">Masuk sistem</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label htmlFor="email" className="text-xs font-medium text-[#787774] uppercase tracking-widest block mb-1.5">Alamat Email</label><div className="relative"><EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" /><input id="email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="staf@nidacourse.id" autoComplete="email" className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] text-[#111111] placeholder:text-[#787774] focus:outline-none focus:border-[#111111] transition-colors" /></div></div>
            <div><label htmlFor="password" className="text-xs font-medium text-[#787774] uppercase tracking-widest block mb-1.5">Kata Sandi</label><div className="relative"><LockKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" /><input id="password" type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" autoComplete="current-password" className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] text-[#111111] placeholder:text-[#787774] focus:outline-none focus:border-[#111111] transition-colors" /><button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787774] hover:text-[#111111]" aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPass ? <EyeSlash size={16} /> : <Eye size={16} />}</button></div></div>
            <Button type="submit" disabled={loading} className="w-full mt-2" size="lg">{loading ? "Memverifikasi…" : "Masuk"}</Button>
          </form>
        </div>
        <p className="text-center text-xs text-[#787774] mt-6">Teknik Informatika Universitas Muria Kudus, 2026</p>
      </div>
    </div>
  );
}
