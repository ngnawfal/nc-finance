import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("design-screenshots");
const BASE = "http://localhost:3000";

const routes = [
  { path: "/login", name: "01-login", auth: false },
  { path: "/dashboard", name: "02-dashboard" },
  { path: "/pendaftaran", name: "03-pendaftaran" },
  { path: "/siswa", name: "04-siswa" },
  { path: "/siswa/graph", name: "05-siswa-graph" },
  { path: "/transaksi", name: "06-transaksi" },
  { path: "/transaksi/input", name: "07-transaksi-input" },
  { path: "/transaksi/validasi", name: "08-transaksi-validasi" },
  { path: "/berkas", name: "09-berkas" },
  { path: "/laporan", name: "10-laporan" },
  { path: "/pengaturan", name: "11-pengaturan" },
];

const USER = { id: "U-001", email: "admin@ncfinance.local", nama: "Admin Manajer", role: "manajer", noHp: "081234567890" };
const TOKEN = "demo-token";

const siswa = [
  { id: "S-001", nim: "NC-2025-001", nama: "Aulia Rahma", kategoriKursus: "Komputer Office", noHp: "081234567890", alamat: "Jl. Mawar 12, Kudus", totalBiaya: 1500000, tanggalDaftar: "2025-04-12", tanggalMulai: "2025-05-01", tanggalSelesai: "2025-08-30", status: "aktif" },
  { id: "S-002", nim: "NC-2025-002", nama: "Bayu Pratama", kategoriKursus: "Desain Grafis", noHp: "081299990000", alamat: "Jl. Melati 4, Kudus", totalBiaya: 2000000, tanggalDaftar: "2025-04-15", tanggalMulai: "2025-05-08", tanggalSelesai: "2025-09-12", status: "aktif" },
  { id: "S-003", nim: "NC-2025-003", nama: "Citra Lestari", kategoriKursus: "Bahasa Inggris", noHp: "081311112222", alamat: "Jl. Kenanga 7, Kudus", totalBiaya: 1250000, tanggalDaftar: "2025-04-20", tanggalMulai: "2025-05-15", tanggalSelesai: "2025-08-15", status: "selesai" },
];

const kursus = [
  { kode: "KRS-OFC", nama: "Komputer Office", biaya: 1500000, durasiMinggu: 16, deskripsi: "Word, Excel, PowerPoint level mahir", statusAktif: true },
  { kode: "KRS-DG", nama: "Desain Grafis", biaya: 2000000, durasiMinggu: 20, deskripsi: "Photoshop, Illustrator, brand identity", statusAktif: true },
  { kode: "KRS-ENG", nama: "Bahasa Inggris", biaya: 1250000, durasiMinggu: 12, deskripsi: "Conversation & TOEFL preparation", statusAktif: true },
];

const users = [
  { id: "U-001", email: "admin@ncfinance.local", nama: "Admin Manajer", role: "manajer", noHp: "081234567890" },
  { id: "U-002", email: "staf@ncfinance.local", nama: "Putri Kasir", role: "staf", noHp: "081234500000" },
];

const profil = { id: "P-001", nama: "LPK Nida Course", alamat: "Jl. Sunan Kudus No. 1, Kudus", nomorTelepon: "0291-444-555", email: "halo@ncfinance.local" };

function daysAgo(n, h = 9) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

const transaksi = [
  { id: "TRX-001", siswaId: "S-001", siswaNama: "Aulia Rahma", siswaNim: "NC-2025-001", nominal: 500000, metode: "qris", buktiPath: "", catatan: "DP semester 1", statusValidasi: "approved", createdAt: daysAgo(6, 8), userId: "U-001" },
  { id: "TRX-002", siswaId: "S-002", siswaNama: "Bayu Pratama", siswaNim: "NC-2025-002", nominal: 750000, metode: "transfer", buktiPath: "", catatan: "Pelunasan", statusValidasi: "approved", createdAt: daysAgo(5, 10), userId: "U-001" },
  { id: "TRX-003", siswaId: "S-003", siswaNama: "Citra Lestari", siswaNim: "NC-2025-003", nominal: 250000, metode: "tunai", buktiPath: "", catatan: "Cicilan", statusValidasi: "approved", createdAt: daysAgo(4, 13), userId: "U-002" },
  { id: "TRX-004", siswaId: "S-001", siswaNama: "Aulia Rahma", siswaNim: "NC-2025-001", nominal: 400000, metode: "qris", buktiPath: "", catatan: "Cicilan kedua", statusValidasi: "approved", createdAt: daysAgo(3, 9), userId: "U-002" },
  { id: "TRX-005", siswaId: "S-002", siswaNama: "Bayu Pratama", siswaNim: "NC-2025-002", nominal: 600000, metode: "transfer", buktiPath: "", catatan: "Pelunasan tahap 2", statusValidasi: "approved", createdAt: daysAgo(2, 11), userId: "U-001" },
  { id: "TRX-006", siswaId: "S-003", siswaNama: "Citra Lestari", siswaNim: "NC-2025-003", nominal: 300000, metode: "qris", buktiPath: "", catatan: "Cicilan akhir", statusValidasi: "approved", createdAt: daysAgo(1, 14), userId: "U-002" },
  { id: "TRX-007", siswaId: "S-001", siswaNama: "Aulia Rahma", siswaNim: "NC-2025-001", nominal: 450000, metode: "tunai", buktiPath: "", catatan: "Pembayaran modul", statusValidasi: "approved", createdAt: daysAgo(0, 9), userId: "U-001" },
  { id: "TRX-008", siswaId: "S-002", siswaNama: "Bayu Pratama", siswaNim: "NC-2025-002", nominal: 400000, metode: "qris", buktiPath: "", catatan: "Menunggu validasi manajer", statusValidasi: "pending", createdAt: daysAgo(0, 10), userId: "U-002" },
];

const pendaftaran = [
  {
    id: "P-2025-001", nomorPendaftaran: "REG-20250612-001", namaLengkap: "Dewi Anggraini", noKtp: "3319010101010001",
    tempatLahir: "Kudus", tanggalLahir: "2003-08-12", jenisKelamin: "Perempuan",
    alamatLengkap: "Jl. Anggrek 9, Kudus", noTelpWa: "081299991111", agama: "Islam", asalInstansi: "SMA 1 Kudus",
    kejuruanPelatihan: "Komputer Office", namaAyah: "Sutrisno", namaIbu: "Sumini", alamatOrangTua: "Jl. Anggrek 9, Kudus",
    dokKtp: true, dokKk: true, dokIjasah: false, dokFoto: true,
    statusPendaftaran: "terdaftar",
  },
  {
    id: "P-2025-002", nomorPendaftaran: "REG-20250613-002", namaLengkap: "Eko Saputra", noKtp: "3319010101010002",
    tempatLahir: "Demak", tanggalLahir: "2002-11-22", jenisKelamin: "Laki-laki",
    alamatLengkap: "Jl. Dahlia 5, Kudus", noTelpWa: "081311113333", agama: "Islam", asalInstansi: "SMK 2 Kudus",
    kejuruanPelatihan: "Desain Grafis", namaAyah: "Saputra", namaIbu: "Marni", alamatOrangTua: "Jl. Dahlia 5, Kudus",
    dokKtp: true, dokKk: false, dokIjasah: false, dokFoto: false,
    statusPendaftaran: "draft",
  },
];

const graph = {
  nodes: [
    ...siswa.map(s => ({ id: s.nim, label: s.nama, type: "siswa" })),
    ...kursus.map(k => ({ id: k.kode, label: k.nama, type: "kursus" })),
  ],
  edges: [
    { source: "NC-2025-001", target: "KRS-OFC" },
    { source: "NC-2025-002", target: "KRS-DG" },
    { source: "NC-2025-003", target: "KRS-ENG" },
  ],
};

function ok(data) { return { status: 200, contentType: "application/json", body: JSON.stringify(data) }; }

async function setupRoutes(page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname;
    if (p === "/api/auth/me") return route.fulfill(ok({ user: USER }));
    if (p === "/api/auth/login") return route.fulfill(ok({ token: TOKEN, user: USER }));
    if (p === "/api/auth/logout") return route.fulfill(ok({ ok: true }));
    if (p === "/api/transaksi") return route.fulfill(ok({ data: transaksi }));
    if (p === "/api/transaksi/validasi") return route.fulfill(ok({ data: transaksi.filter(t => t.statusValidasi === "pending") }));
    if (p === "/api/siswa") return route.fulfill(ok({ data: siswa }));
    if (p === "/api/pendaftaran") return route.fulfill(ok({ data: pendaftaran }));
    if (p === "/api/graph/siswa-kursus") return route.fulfill(ok(graph));
    if (p === "/api/pengaturan/profil") return route.fulfill(ok({ data: profil }));
    if (p === "/api/pengaturan/users") return route.fulfill(ok({ data: users }));
    if (p === "/api/pengaturan/kursus") return route.fulfill(ok({ data: kursus }));
    return route.fulfill(ok({ data: [] }));
  });
}

async function capture(name, urlPath, viewport, dir) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  await context.addInitScript(([token, user]) => {
    localStorage.setItem("nc_token", token);
    localStorage.setItem("nc_user", JSON.stringify(user));
  }, [TOKEN, USER]);
  const page = await context.newPage();
  await setupRoutes(page);
  const res = await page.goto(BASE + urlPath, { waitUntil: "networkidle", timeout: 60000 });
  if (!res || !res.ok()) {
    console.log("warn", urlPath, res?.status());
  }
  await page.addStyleTag({ content: "nextjs-portal,#__next-build-watcher,#__next-prerender-indicator,[data-nextjs-toast],[data-nextjs-dev-tools-button]{display:none!important}" });
  await page.waitForTimeout(800);
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await browser.close();
  console.log("ok", file);
}

await mkdir(path.join(OUT, "desktop"), { recursive: true });
await mkdir(path.join(OUT, "mobile"), { recursive: true });

for (const route of routes) {
  await capture(route.name, route.path, { width: 1440, height: 900 }, path.join(OUT, "desktop"));
  await capture(route.name, route.path, { width: 390, height: 844 }, path.join(OUT, "mobile"));
}
console.log("done");
