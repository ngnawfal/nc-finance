import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType,
  PageBreak, PageOrientation, Footer, Header,
} from "docx";

const items = [
  {
    file: "flow-1-login.png",
    title: "Flowchart 1 — Login dan Otentikasi",
    desc: "Pengguna memasukkan email dan kata sandi pada halaman login. Sistem mengirim data ke backend melalui POST /api/auth/login dan mencocokkan dengan tabel users di MySQL. Jika tidak cocok, pesan kesalahan ditampilkan dan pengguna diminta mencoba kembali. Jika cocok, token autentikasi dan data pengguna disimpan, lalu pengguna diarahkan ke halaman dashboard.",
    legend: ["Terminator (oval) menunjukkan awal dan akhir alur.", "Input/Output (jajar genjang) untuk data yang diketik pengguna.", "Process (persegi) untuk pemanggilan API.", "Decision (belah ketupat) untuk percabangan kondisi.", "Database (silinder) untuk media penyimpanan."],
  },
  {
    file: "flow-2-pendaftaran.png",
    title: "Flowchart 2 — Pendaftaran Peserta",
    desc: "Staf membuka halaman pendaftaran. Sistem memuat daftar kursus dari database. Staf mengisi data peserta dan orang tua, kemudian memilih tombol simpan. Jika menekan Simpan Draft, status disimpan sebagai draft; jika menekan Simpan Pendaftaran, status menjadi terdaftar. Data dikirim melalui POST /api/pendaftaran dan disimpan ke tabel pendaftaran, lalu sistem menampilkan notifikasi sukses berupa dokumen konfirmasi.",
    legend: ["Document (lembar bergelombang) untuk keluaran berbentuk dokumen atau notifikasi tersimpan.", "Percabangan tombol simpan menggunakan simbol Decision."],
  },
  {
    file: "flow-3-transaksi.png",
    title: "Flowchart 3 — Transaksi (Input, Validasi, dan Laporan)",
    desc: "Staf menginput transaksi pembayaran pada halaman /transaksi/input. Sistem menyimpan transaksi dengan status pending ke database dan menampilkan notifikasi pada topbar. Manajer membuka halaman validasi, memeriksa bukti pembayaran, lalu memilih untuk menyetujui atau menolak. Status diperbarui melalui PUT /api/transaksi/{id}/validate. Hanya transaksi berstatus disetujui yang masuk perhitungan dashboard dan laporan.",
    legend: ["Alur memuat dua aktor (staf dan manajer) dengan jalur kondisi persetujuan.", "Document di akhir alur menggambarkan laporan keluaran sistem."],
  },
  {
    file: "flow-4-undo.png",
    title: "Flowchart 4 — Undo dan Restore Transaksi",
    desc: "Saat pengguna menghapus transaksi, sistem mengirim DELETE /api/transaksi/{id} dan menyimpan data terakhir ke undo stack di backend. Jika pengguna tidak menekan Undo, alur selesai. Jika menekan Undo, sistem mengirim DELETE /api/transaksi/undo, lalu backend mengeluarkan entri teratas dari stack dan mengembalikan baris transaksi ke tabel.",
    legend: ["Pola stack LIFO direpresentasikan dengan satu proses penyimpanan dan satu proses pengambilan.", "Decision menentukan apakah operasi undo dijalankan."],
  },
  {
    file: "flow-5-siswa.png",
    title: "Flowchart 5 — Tambah Siswa",
    desc: "Pengguna menekan tombol Tambah Siswa, mengisi data siswa, dan memilih kursus. Jika NIM dikosongkan, sistem membuat NIM otomatis sebelum mengirim POST /api/siswa. Backend menyimpan data ke tabel siswa dan tabel relasi siswa_kursus secara transactional. Setelah berhasil, sistem memuat ulang data dan graf relasi serta menampilkan notifikasi sukses.",
    legend: ["Decision NIM otomatis mempertahankan jalur paralel yang bertemu kembali sebelum proses penyimpanan.", "Database melibatkan dua tabel dalam satu transaksi."],
  },
];

const MAX_W_PX = 600;
const MAX_H_PX = 480;

const children = [];

children.push(
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Flowchart Sistem NC Finance", bold: true, size: 40 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [new TextRun({ text: "Disusun mengikuti notasi simbol flowchart standar ANSI/ISO 5807.", italics: true, color: "787774", size: 22 })],
  }),
  new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 120 }, children: [new TextRun({ text: "Daftar Simbol yang Digunakan", bold: true, size: 28 })] }),
  bullet("Terminator (oval) — menandai mulai dan selesai."),
  bullet("Process (persegi panjang) — menandai langkah pemrosesan atau pemanggilan fungsi/endpoint."),
  bullet("Input/Output (jajar genjang) — menandai data yang dimasukkan atau dikeluarkan oleh pengguna."),
  bullet("Decision (belah ketupat) — menandai percabangan berdasarkan kondisi."),
  bullet("Document (lembar bergelombang) — menandai keluaran berupa dokumen atau notifikasi."),
  bullet("Database (silinder) — menandai media penyimpanan basis data."),
  bullet("Connector (lingkaran kecil) — penyambung antar bagian alur (digunakan bila diperlukan)."),
  bullet("Garis berarah dengan ujung panah menunjukkan arah aliran proses."),
  new Paragraph({ children: [new PageBreak()] }),
);

for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const buf = await readFile(path.resolve(it.file));
  const meta = await sharp(buf).metadata();
  let w = MAX_W_PX;
  let h = Math.round(w * (meta.height / meta.width));
  if (h > MAX_H_PX) {
    h = MAX_H_PX;
    w = Math.round(h * (meta.width / meta.height));
  }

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 160 },
      children: [new TextRun({ text: it.title, bold: true, size: 30 })],
    }),
    new Paragraph({
      spacing: { after: 220 },
      children: [new TextRun({ text: it.desc, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new ImageRun({ data: buf, transformation: { width: w, height: h }, type: "png" })],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: "Catatan notasi:", bold: true, size: 22 })],
    }),
    ...it.legend.map(bullet),
  );
  if (i < items.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }));
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22 })],
  });
}

const doc = new Document({
  creator: "NC Finance",
  title: "Flowchart Sistem NC Finance",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
      heading1: { run: { font: "Cambria", size: 30, color: "111111", bold: true } },
      heading2: { run: { font: "Cambria", size: 26, color: "111111", bold: true } },
      title: { run: { font: "Cambria", size: 40, color: "111111", bold: true } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { orientation: PageOrientation.PORTRAIT, width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Flowchart Sistem NC Finance", color: "787774", size: 18 })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dokumen Desain — NC Finance", color: "787774", size: 18 })] })] }) },
      children,
    },
  ],
});

const out = await Packer.toBuffer(doc);
await writeFile("Flowchart-Sistem-NC-Finance.docx", out);
console.log("ok Flowchart-Sistem-NC-Finance.docx", out.length);
