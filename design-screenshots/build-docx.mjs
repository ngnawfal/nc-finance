import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType,
  PageBreak, PageOrientation, Footer, Header,
} from "docx";

const steps = [
  { file: "01-login.png", title: "Langkah 1 — Login", desc: "Pintu masuk aplikasi. Pengguna memasukkan email dan kata sandi, lalu sistem memvalidasi ke backend melalui endpoint POST /api/auth/login. Token autentikasi disimpan pada localStorage dan pengguna diarahkan ke halaman dashboard. Tanpa token yang valid, seluruh halaman lain akan terkunci secara otomatis." },
  { file: "02-dashboard.png", title: "Langkah 2 — Dashboard", desc: "Ringkasan keuangan dan operasional yang ditampilkan dalam satu layar. Terdapat empat kartu indikator utama (total pemasukan, peserta aktif, transaksi bulan ini, dan jumlah transaksi menunggu validasi), grafik batang pembayaran tujuh hari terakhir, grafik lingkaran metode pembayaran, serta daftar lima transaksi terbaru. Seluruh angka hanya menghitung transaksi yang berstatus disetujui." },
  { file: "03-pendaftaran.png", title: "Langkah 3 — Pendaftaran Peserta", desc: "Form pendaftaran calon peserta. Staf mengisi data peserta, data orang tua, serta data tanda tangan. Pada sidebar kanan, staf memilih program pelatihan dan menentukan tanggal mulai dan selesai. Tersedia dua tombol simpan: \"Simpan Pendaftaran\" untuk status terdaftar dan \"Simpan Draft\" untuk data yang masih akan dilengkapi." },
  { file: "04-siswa.png", title: "Langkah 4 — Data Siswa", desc: "Daftar peserta aktif dan pendaftar dalam bentuk kartu. Tersedia pencarian, tombol Tambah Siswa berupa modal form, serta aksi Detail, Edit, dan Hapus pada setiap kartu. Aksi hapus hanya dapat dilakukan oleh manajer. Modal detail siswa menampilkan profil lengkap beserta riwayat pembayaran peserta tersebut." },
  { file: "05-siswa-graph.png", title: "Langkah 5 — Graph Relasi Siswa dan Kursus", desc: "Visualisasi struktur graf relasi antara peserta dan kursus yang diikuti. Node lingkaran merepresentasikan siswa, node persegi merepresentasikan kursus, dan garis di antaranya menggambarkan keikutsertaan. Tampilan ini membantu memahami sebaran peserta pada setiap program pelatihan." },
  { file: "06-transaksi.png", title: "Langkah 6 — Daftar Transaksi", desc: "Tabel berisi seluruh transaksi pembayaran dengan filter berdasarkan status dan kolom pencarian. Tersedia operasi edit dan hapus, serta tombol Undo untuk mengembalikan transaksi yang baru saja dihapus. Status validasi ditampilkan sebagai badge berwarna untuk memudahkan pemantauan." },
  { file: "07-transaksi-input.png", title: "Langkah 7 — Input Transaksi", desc: "Form pencatatan pembayaran. Staf memilih peserta, mengisi nominal yang otomatis terformat sebagai mata uang rupiah, memilih metode pembayaran (QRIS, Transfer, atau Tunai), mengunggah bukti pembayaran, dan menambahkan catatan opsional. Setiap transaksi baru akan masuk dengan status pending menunggu validasi manajer." },
  { file: "08-transaksi-validasi.png", title: "Langkah 8 — Validasi Transaksi", desc: "Antrian khusus yang hanya dapat diakses oleh manajer untuk meninjau transaksi yang masih berstatus pending. Setiap kartu antrian menampilkan informasi peserta, nominal, metode, bukti, serta catatan staf. Manajer dapat menyetujui atau menolak transaksi disertai alasan. Hanya transaksi yang disetujui yang masuk perhitungan dashboard dan laporan." },
  { file: "09-berkas.png", title: "Langkah 9 — Berkas Peserta", desc: "Memantau kelengkapan dokumen peserta, meliputi KTP, KK, ijazah, dan foto. Tampilan tabel menunjukkan checklist setiap dokumen serta persentase kelengkapan per peserta. Staf dapat langsung menindaklanjuti berkas yang belum lengkap dari halaman ini." },
  { file: "10-laporan.png", title: "Langkah 10 — Laporan Keuangan", desc: "Rekapitulasi keuangan terstruktur dengan filter periode, grafik pemasukan harian, distribusi metode pembayaran, serta tabel detail transaksi siap laporan. Seluruh angka pada halaman ini dihitung hanya dari transaksi yang berstatus disetujui." },
  { file: "11-pengaturan.png", title: "Langkah 11 — Pengaturan Sistem", desc: "Master data sistem yang terdiri atas profil lembaga, daftar pengguna lengkap dengan peran staf atau manajer, serta daftar kursus mencakup kode, biaya, durasi, dan deskripsi. Manajer dapat menambah, mengubah, dan menghapus data melalui modal. Setiap perubahan tetap divalidasi peran pengguna pada backend." },
];

// A4 portrait: 21cm × 29.7cm. Content area dengan margin 2cm: 17cm lebar.
// 1cm = ~37.7953 px (96 dpi). 17cm ≈ 643 px. Tinggi gambar disesuaikan rasio.
const CONTENT_W_PX = 640;

const children = [];

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  const imgBuf = await readFile(path.resolve("desktop", step.file));
  const meta = await sharp(imgBuf).metadata();
  const ratio = meta.height / meta.width;
  const targetH = Math.round(CONTENT_W_PX * ratio);

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 120 },
      children: [new TextRun({ text: step.title, bold: true, size: 32 })],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: step.desc, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new ImageRun({
          data: imgBuf,
          transformation: { width: CONTENT_W_PX, height: targetH },
          type: meta.format === "png" ? "png" : "jpg",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: step.file, italics: true, color: "787774", size: 18 })],
    }),
  );

  if (i < steps.length - 1) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
}

const doc = new Document({
  creator: "NC Finance",
  title: "Desain Aplikasi NC Finance",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
      heading1: { run: { font: "Cambria", size: 32, color: "111111", bold: true } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { orientation: PageOrientation.PORTRAIT, width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2cm
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Desain Aplikasi NC Finance", color: "787774", size: 18 })] })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NC Finance — Dokumen Desain UI", color: "787774", size: 18 })] })],
        }),
      },
      children,
    },
  ],
});

const buf = await Packer.toBuffer(doc);
await writeFile("Desain-Aplikasi-NC-Finance.docx", buf);
console.log("ok Desain-Aplikasi-NC-Finance.docx", buf.length);
