import pptxgen from "pptxgenjs";
import path from "node:path";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Kelompok Struktur Data";
pptx.subject = "Presentasi Tugas 9 Aplikasi";
pptx.title = "Presentasi NC Finance";
pptx.company = "LPK Nida Course";
pptx.lang = "id-ID";
pptx.theme = {
  headFontFace: "Georgia",
  bodyFontFace: "Aptos",
  lang: "id-ID",
};

const C = {
  bg: "F9F9F8",
  dark: "111111",
  muted: "787774",
  border: "EAEAEA",
  green: "346538",
  blue: "1F6C9F",
  yellow: "956400",
  red: "9F2F2D",
  white: "FFFFFF",
};

function addHeader(slide, title, no) {
  slide.background = { color: C.bg };
  slide.addText(title, { x: 0.55, y: 0.35, w: 10.8, h: 0.35, fontFace: "Georgia", fontSize: 20, bold: true, color: C.dark, margin: 0 });
  slide.addText(String(no).padStart(2, "0"), { x: 12.0, y: 0.32, w: 0.7, h: 0.35, fontSize: 12, bold: true, color: C.muted, align: "right", margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.55, y: 0.85, w: 12.15, h: 0, line: { color: C.border, width: 1 } });
}

function bullet(slide, lines, x = 0.75, y = 1.3, w = 5.7, fs = 18) {
  const runs = [];
  for (const line of lines) {
    runs.push({ text: line, options: { bullet: { indent: 14 }, hanging: 4, breakLine: true } });
  }
  slide.addText(runs, { x, y, w, h: 5.2, fontSize: fs, color: C.dark, breakLine: false, valign: "top", fit: "shrink" });
}

function img(name) {
  return path.resolve("desktop", name);
}

function flow(name) {
  return path.resolve(name);
}

function card(slide, x, y, w, h, title, desc, color = C.dark) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.border, width: 1 } });
  slide.addText(title, { x: x + 0.18, y: y + 0.18, w: w - 0.36, h: 0.3, fontSize: 13, bold: true, color, margin: 0 });
  slide.addText(desc, { x: x + 0.18, y: y + 0.55, w: w - 0.36, h: h - 0.72, fontSize: 11, color: C.muted, fit: "shrink", margin: 0.02 });
}

// 1 Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.bg }, line: { color: C.bg } });
  s.addText("NC Finance", { x: 0.8, y: 1.15, w: 7.8, h: 0.7, fontFace: "Georgia", fontSize: 42, bold: true, color: C.dark, margin: 0 });
  s.addText("Aplikasi Administrasi & Keuangan LPK\nBerbasis Struktur Data", { x: 0.85, y: 2.0, w: 6.6, h: 1.0, fontSize: 22, color: C.muted, breakLine: false, fit: "shrink" });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.85, y: 3.35, w: 5.5, h: 1.35, rectRadius: 0.16, fill: { color: C.white }, line: { color: C.border } });
  s.addText("Tugas 9 — Aplikasi & Laporan Proyek\nMata Kuliah: Struktur Data\nKelompok: ................................", { x: 1.1, y: 3.58, w: 5.0, h: 0.9, fontSize: 16, color: C.dark, breakLine: false });
  s.addImage({ path: img("02-dashboard.png"), x: 7.05, y: 0.8, w: 5.65, h: 5.35, sizing: { type: "contain", x: 7.05, y: 0.8, w: 5.65, h: 5.35 } });
  s.addText("Nama Anggota: isi di sini", { x: 0.85, y: 6.75, w: 8.0, h: 0.28, fontSize: 12, color: C.muted });
}

// 2 Latar belakang
{
  const s = pptx.addSlide(); addHeader(s, "Latar Belakang Studi Kasus", 2);
  bullet(s, [
    "LPK perlu mencatat pendaftaran peserta, pembayaran, validasi, dan laporan secara rapi.",
    "Proses manual rawan data tercecer, sulit mencari transaksi, dan validasi pembayaran tidak terkontrol.",
    "Solusi: aplikasi NC Finance untuk mengelola administrasi dan keuangan berbasis Java + MySQL.",
    "Aplikasi juga menjadi studi kasus penerapan struktur data dalam sistem nyata.",
  ], 0.75, 1.35, 6.1, 18);
  s.addImage({ path: img("03-pendaftaran.png"), x: 7.0, y: 1.25, w: 5.55, h: 4.9, sizing: { type: "contain", x: 7.0, y: 1.25, w: 5.55, h: 4.9 } });
}

// 3 Rumusan & Tujuan
{
  const s = pptx.addSlide(); addHeader(s, "Rumusan Masalah & Tujuan", 3);
  card(s, 0.8, 1.25, 5.65, 2.2, "Rumusan Masalah", "Bagaimana membuat aplikasi sederhana dengan Java untuk mengelola pendaftaran, siswa, transaksi, validasi, berkas, laporan, sekaligus menerapkan struktur data?", C.red);
  card(s, 6.85, 1.25, 5.65, 2.2, "Tujuan", "Membuat prototype aplikasi yang membantu administrasi LPK dan menerapkan ArrayList, HashMap, Stack, Queue, Graph, Searching, dan Sorting.", C.green);
  bullet(s, [
    "Merapikan data peserta dan kursus.",
    "Mencatat pembayaran dan bukti transaksi.",
    "Memisahkan transaksi pending dan approved.",
    "Membuat laporan keuangan yang mudah dibaca.",
  ], 1.0, 4.05, 11.4, 17);
}

// 4 Fitur
{
  const s = pptx.addSlide(); addHeader(s, "Fitur Utama Aplikasi", 4);
  const items = [
    ["Login", "Autentikasi dan role staf/manajer"],
    ["Dashboard", "KPI, chart 7 hari, metode bayar"],
    ["Pendaftaran", "Draft atau terdaftar"],
    ["Data Siswa", "CRUD siswa dan riwayat bayar"],
    ["Graph", "Relasi siswa-kursus"],
    ["Transaksi", "Input, edit, hapus, undo"],
    ["Validasi", "Queue pending manajer"],
    ["Laporan", "Approved-only"],
  ];
  items.forEach((it, i) => card(s, 0.75 + (i % 4) * 3.1, 1.25 + Math.floor(i / 4) * 2.0, 2.75, 1.45, it[0], it[1], [C.dark, C.blue, C.green, C.yellow][i % 4]));
  s.addImage({ path: img("06-transaksi.png"), x: 2.1, y: 5.25, w: 9.1, h: 1.65, sizing: { type: "contain", x: 2.1, y: 5.25, w: 9.1, h: 1.65 } });
}

// 5 Struktur Data
{
  const s = pptx.addSlide(); addHeader(s, "Penerapan Struktur Data", 5);
  const rows = [
    ["ArrayList", "Daftar transaksi, pendaftaran, hasil tampil semua"],
    ["HashMap", "Lookup siswa by NIM, pendaftaran by nomor/KTP, adjacency list graph"],
    ["Stack", "Undo transaksi dengan prinsip LIFO"],
    ["Queue", "Antrian validasi transaksi pending (FIFO)"],
    ["Graph", "Relasi siswa dan kursus, BFS/DFS"],
    ["Sorting/Search", "Filter pencarian dan transaksi terbaru"],
  ];
  rows.forEach((r, i) => card(s, 0.85 + (i % 2) * 6.0, 1.15 + Math.floor(i / 2) * 1.65, 5.45, 1.25, r[0], r[1], [C.green, C.blue, C.yellow, C.red, C.dark, C.muted][i]));
}

// 6 Arsitektur
{
  const s = pptx.addSlide(); addHeader(s, "Arsitektur Sistem", 6);
  card(s, 0.75, 1.5, 2.4, 1.1, "Frontend", "Next.js + Tailwind", C.blue);
  card(s, 3.95, 1.5, 2.4, 1.1, "Backend", "Java HTTP Server", C.green);
  card(s, 7.15, 1.5, 2.4, 1.1, "Manager", "Siswa, Transaksi, Pendaftaran, Graph", C.yellow);
  card(s, 10.35, 1.5, 2.1, 1.1, "Database", "MySQL", C.red);
  s.addShape(pptx.ShapeType.line, { x: 3.15, y: 2.05, w: 0.8, h: 0, line: { color: C.dark, beginArrowType: "none", endArrowType: "triangle" } });
  s.addShape(pptx.ShapeType.line, { x: 6.35, y: 2.05, w: 0.8, h: 0, line: { color: C.dark, endArrowType: "triangle" } });
  s.addShape(pptx.ShapeType.line, { x: 9.55, y: 2.05, w: 0.8, h: 0, line: { color: C.dark, endArrowType: "triangle" } });
  bullet(s, [
    "Frontend mengirim request HTTP/JSON ke backend.",
    "Backend Java mengatur autentikasi, role, validasi, dan pemrosesan data.",
    "Manager layer menerapkan struktur data dan menyinkronkan ke MySQL.",
    "Database menyimpan data permanen: users, siswa, kursus, transaksi, pendaftaran, sessions.",
  ], 1.0, 3.35, 11.3, 17);
}

// 7 Flowchart
{
  const s = pptx.addSlide(); addHeader(s, "Flowchart Proses Utama", 7);
  s.addImage({ path: flow("flow-3-transaksi.png"), x: 0.8, y: 1.05, w: 5.75, h: 5.9, sizing: { type: "contain", x: 0.8, y: 1.05, w: 5.75, h: 5.9 } });
  bullet(s, [
    "Transaksi baru disimpan sebagai pending.",
    "Manajer melakukan validasi approve/reject.",
    "Hanya transaksi approved yang dihitung pada dashboard dan laporan.",
    "Simbol flowchart mengikuti standar: terminator, proses, input/output, decision, database, document.",
  ], 7.0, 1.45, 5.5, 17);
}

// 8 UI UX
{
  const s = pptx.addSlide(); addHeader(s, "UI/UX Aplikasi", 8);
  s.addImage({ path: img("02-dashboard.png"), x: 0.65, y: 1.1, w: 5.95, h: 2.75, sizing: { type: "contain", x: 0.65, y: 1.1, w: 5.95, h: 2.75 } });
  s.addImage({ path: img("08-transaksi-validasi.png"), x: 6.85, y: 1.1, w: 5.95, h: 2.75, sizing: { type: "contain", x: 6.85, y: 1.1, w: 5.95, h: 2.75 } });
  s.addImage({ path: img("10-laporan.png"), x: 3.55, y: 4.1, w: 6.25, h: 2.35, sizing: { type: "contain", x: 3.55, y: 4.1, w: 6.25, h: 2.35 } });
  s.addText("Desain dibuat sederhana: sidebar navigasi, kartu KPI, tabel, badge status, chart, dan modal form.", { x: 1.0, y: 6.75, w: 11.3, h: 0.35, fontSize: 14, color: C.muted, align: "center" });
}

// 9 Demo
{
  const s = pptx.addSlide(); addHeader(s, "Rencana Demo Aplikasi", 9);
  bullet(s, [
    "1. Login sebagai manajer.",
    "2. Tunjukkan dashboard ringkasan pembayaran.",
    "3. Input pendaftaran peserta baru.",
    "4. Tambah data siswa dan relasi kursus.",
    "5. Input transaksi pembayaran.",
    "6. Validasi transaksi pending sebagai manajer.",
    "7. Tampilkan laporan dan graph siswa-kursus.",
  ], 0.9, 1.25, 6.0, 18);
  s.addImage({ path: img("04-siswa.png"), x: 7.1, y: 1.15, w: 5.45, h: 4.9, sizing: { type: "contain", x: 7.1, y: 1.15, w: 5.45, h: 4.9 } });
}

// 10 Hasil
{
  const s = pptx.addSlide(); addHeader(s, "Hasil & Manfaat", 10);
  card(s, 0.8, 1.25, 3.7, 1.5, "Data Rapi", "Pendaftaran, siswa, kursus, dan transaksi tersimpan terstruktur.", C.green);
  card(s, 4.85, 1.25, 3.7, 1.5, "Validasi Jelas", "Transaksi pending harus disetujui manajer sebelum masuk laporan.", C.blue);
  card(s, 8.9, 1.25, 3.7, 1.5, "Laporan Cepat", "Dashboard dan laporan otomatis dari transaksi approved.", C.yellow);
  card(s, 2.55, 3.35, 3.7, 1.5, "Struktur Data", "ArrayList, HashMap, Stack, Queue, Graph diterapkan nyata.", C.dark);
  card(s, 7.05, 3.35, 3.7, 1.5, "Role Aman", "Menu dan endpoint dibatasi untuk staf/manajer.", C.red);
}

// 11 Pengembangan
{
  const s = pptx.addSlide(); addHeader(s, "Kendala & Pengembangan Lanjutan", 11);
  bullet(s, [
    "Kendala: sinkronisasi data frontend-backend dan validasi role harus konsisten.",
    "Kendala: transaksi pending tidak boleh ikut laporan sebelum disetujui.",
    "Pengembangan: export PDF laporan otomatis.",
    "Pengembangan: upload bukti pembayaran ke storage file, bukan data URL.",
    "Pengembangan: audit log untuk semua perubahan data penting.",
  ], 0.85, 1.25, 6.1, 18);
  s.addImage({ path: img("11-pengaturan.png"), x: 7.05, y: 1.25, w: 5.55, h: 4.9, sizing: { type: "contain", x: 7.05, y: 1.25, w: 5.55, h: 4.9 } });
}

// 12 Penutup
{
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  s.addText("Kesimpulan", { x: 0.85, y: 1.2, w: 8.0, h: 0.7, fontFace: "Georgia", fontSize: 38, bold: true, color: C.white });
  s.addText("NC Finance menyelesaikan studi kasus administrasi dan keuangan LPK dengan menerapkan struktur data secara aplikatif: daftar data, lookup cepat, undo stack, antrian validasi, dan graph relasi siswa-kursus.", { x: 0.9, y: 2.25, w: 10.8, h: 1.2, fontSize: 22, color: "EAEAEA", fit: "shrink" });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 4.25, w: 4.0, h: 1.0, rectRadius: 0.16, fill: { color: C.white }, line: { color: C.white } });
  s.addText("Terima kasih", { x: 1.15, y: 4.55, w: 3.5, h: 0.35, fontSize: 20, bold: true, color: C.dark, align: "center" });
}

await pptx.writeFile({ fileName: "Presentasi-NC-Finance.pptx" });
console.log("ok Presentasi-NC-Finance.pptx");
