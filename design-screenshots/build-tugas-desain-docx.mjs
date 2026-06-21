import { writeFile } from "node:fs/promises";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const title = "DESAIN APLIKASI NC FINANCE";
const subtitle = "Penerapan Struktur Data pada Studi Kasus Aplikasi Administrasi dan Keuangan LPK";

const p = (text, opts = {}) => new Paragraph({ spacing: { after: 140 }, ...opts, children: [new TextRun({ text, size: 24, ...opts.run })] });
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 160 }, children: [new TextRun({ text, bold: true, size: 32 })] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 120 }, children: [new TextRun({ text, bold: true, size: 28 })] });
const bullet = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, size: 24 })] });

function cell(text, bold = false) {
  return new TableCell({
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 24 })] })],
  });
}

const identitasTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [cell("No", true), cell("Nama Anggota", true), cell("NIM", true), cell("Kelas", true)] }),
    new TableRow({ children: [cell("1"), cell("........................................"), cell("...................."), cell("................") ] }),
    new TableRow({ children: [cell("2"), cell("........................................"), cell("...................."), cell("................") ] }),
    new TableRow({ children: [cell("3"), cell("........................................"), cell("...................."), cell("................") ] }),
    new TableRow({ children: [cell("4"), cell("........................................"), cell("...................."), cell("................") ] }),
  ],
});

const dsTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [cell("Struktur Data", true), cell("Penerapan dalam Aplikasi", true)] }),
    new TableRow({ children: [cell("ArrayList"), cell("Menyimpan daftar sementara siswa, transaksi, kursus, dan pendaftaran sebelum ditampilkan pada antarmuka.")] }),
    new TableRow({ children: [cell("HashMap"), cell("Mempercepat pencarian berdasarkan NIM siswa, nomor pendaftaran, adjacency list graph, serta pencatatan percobaan login.")] }),
    new TableRow({ children: [cell("Stack"), cell("Menerapkan fitur Undo transaksi. Data transaksi terakhir yang dihapus disimpan dengan prinsip LIFO.")] }),
    new TableRow({ children: [cell("Queue"), cell("Menerapkan antrian validasi transaksi pending dengan prinsip FIFO agar transaksi diproses sesuai urutan masuk.")] }),
    new TableRow({ children: [cell("Graph"), cell("Merepresentasikan relasi antara siswa dan kursus. Node berupa siswa/kursus, edge berupa keikutsertaan.")] }),
    new TableRow({ children: [cell("Searching"), cell("Digunakan pada pencarian siswa, transaksi, pendaftaran, dan filter data.")] }),
    new TableRow({ children: [cell("Sorting"), cell("Digunakan untuk mengurutkan transaksi terbaru, laporan pembayaran, dan data dashboard.")] }),
  ],
});

const flowTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [cell("No", true), cell("Proses", true), cell("Alur Singkat", true)] }),
    new TableRow({ children: [cell("1"), cell("Login"), cell("Pengguna memasukkan email dan password, sistem memvalidasi ke database, lalu membuat sesi jika berhasil.")] }),
    new TableRow({ children: [cell("2"), cell("Pendaftaran"), cell("Staf mengisi data calon peserta, memilih kursus, lalu menyimpan sebagai draft atau terdaftar.")] }),
    new TableRow({ children: [cell("3"), cell("Tambah Siswa"), cell("Data peserta disimpan ke tabel siswa dan relasi kursus disimpan ke tabel siswa_kursus.")] }),
    new TableRow({ children: [cell("4"), cell("Input Transaksi"), cell("Staf mencatat pembayaran, sistem menyimpan transaksi dengan status pending.")] }),
    new TableRow({ children: [cell("5"), cell("Validasi Transaksi"), cell("Manajer memproses antrian transaksi pending dengan approve atau reject.")] }),
    new TableRow({ children: [cell("6"), cell("Undo Transaksi"), cell("Transaksi yang dihapus dapat dikembalikan melalui Stack undo.")] }),
    new TableRow({ children: [cell("7"), cell("Laporan"), cell("Sistem menghitung pemasukan hanya dari transaksi yang sudah approved.")] }),
  ],
});

const children = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 220 }, children: [new TextRun({ text: title, bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 420 }, children: [new TextRun({ text: subtitle, italics: true, size: 26 })] }),
  p("Mata Kuliah: Struktur Data"),
  p("Bahasa Pemrograman: Java"),
  p("Studi Kasus: Aplikasi Administrasi dan Keuangan LPK Nida Course"),
  p("Kelompok: ........................................"),
  h2("Identitas Anggota"),
  identitasTable,
  new Paragraph({ children: [new PageBreak()] }),

  h1("1. Latar Belakang"),
  p("LPK Nida Course membutuhkan aplikasi untuk membantu proses administrasi peserta dan pencatatan pembayaran. Proses manual sering menyebabkan data tersebar, transaksi sulit dilacak, dan validasi pembayaran kurang rapi. Oleh karena itu, dibuat desain aplikasi NC Finance untuk mengelola pendaftaran, data siswa, transaksi, validasi, berkas, laporan, dan pengaturan sistem."),
  p("Aplikasi ini dibuat sebagai studi kasus penerapan teori struktur data menggunakan bahasa pemrograman Java. Struktur data digunakan untuk menyimpan, mencari, mengurutkan, mengantrikan, mengembalikan, dan memodelkan relasi data dalam sistem."),

  h1("2. Tujuan Aplikasi"),
  bullet("Membantu staf mencatat pendaftaran peserta secara terstruktur."),
  bullet("Menyimpan data siswa dan kursus dengan relasi yang jelas."),
  bullet("Mencatat transaksi pembayaran dan mengirimkannya ke antrian validasi."),
  bullet("Memudahkan manajer dalam menyetujui atau menolak transaksi."),
  bullet("Menyediakan laporan keuangan berdasarkan transaksi yang sudah disetujui."),
  bullet("Menerapkan struktur data seperti ArrayList, HashMap, Stack, Queue, dan Graph dalam studi kasus nyata."),

  h1("3. Pengguna Sistem"),
  h2("a. Staf"),
  p("Staf dapat menginput pendaftaran, mengelola data berkas, mencatat transaksi pembayaran, serta melihat data peserta dan laporan umum."),
  h2("b. Manajer"),
  p("Manajer memiliki akses lebih luas, yaitu melakukan validasi transaksi, mengelola pengguna, mengelola kursus, mengubah profil lembaga, serta menghapus data tertentu."),

  h1("4. Fitur Utama Aplikasi"),
  bullet("Login dan autentikasi pengguna."),
  bullet("Dashboard ringkasan pembayaran dan aktivitas sistem."),
  bullet("Pendaftaran peserta baru dengan status draft atau terdaftar."),
  bullet("Pengelolaan data siswa dan relasi siswa dengan kursus."),
  bullet("Input transaksi pembayaran dengan bukti dan catatan."),
  bullet("Validasi transaksi oleh manajer menggunakan antrian pending."),
  bullet("Undo transaksi menggunakan struktur data Stack."),
  bullet("Laporan pembayaran yang hanya menghitung transaksi approved."),
  bullet("Pengaturan profil lembaga, pengguna, dan kursus."),

  h1("5. Penerapan Struktur Data"),
  dsTable,

  h1("6. Desain Alur Sistem"),
  flowTable,

  h1("7. Desain Halaman Aplikasi"),
  h2("a. Halaman Login"),
  p("Halaman login digunakan untuk memvalidasi pengguna sebelum masuk ke sistem. Form terdiri dari email, password, dan tombol masuk. Jika login berhasil, sistem menyimpan token dan mengarahkan pengguna ke dashboard."),
  h2("b. Dashboard"),
  p("Dashboard menampilkan ringkasan kondisi sistem, seperti total pemasukan, jumlah peserta, transaksi terbaru, grafik pembayaran tujuh hari terakhir, dan distribusi metode pembayaran."),
  h2("c. Pendaftaran"),
  p("Halaman pendaftaran digunakan untuk memasukkan data calon peserta. Data dapat disimpan sebagai draft atau langsung sebagai pendaftaran aktif."),
  h2("d. Data Siswa"),
  p("Halaman data siswa menampilkan seluruh peserta dalam bentuk kartu. Pengguna dapat mencari siswa, menambah siswa, melihat detail, mengedit, dan menghapus data sesuai role."),
  h2("e. Graph Relasi"),
  p("Halaman graph menampilkan hubungan antara siswa dan kursus. Hal ini menggunakan konsep Graph, dengan siswa dan kursus sebagai node serta hubungan pendaftaran sebagai edge."),
  h2("f. Transaksi"),
  p("Halaman transaksi menampilkan daftar pembayaran, status validasi, metode pembayaran, serta fitur edit, hapus, cetak, undo, dan restore transaksi."),
  h2("g. Input Transaksi"),
  p("Halaman input transaksi digunakan oleh staf untuk mencatat pembayaran peserta. Setelah disimpan, transaksi masuk ke status pending."),
  h2("h. Validasi Transaksi"),
  p("Halaman validasi digunakan oleh manajer untuk memproses transaksi pending. Proses ini menggunakan konsep Queue agar transaksi diproses berdasarkan urutan masuk."),
  h2("i. Berkas"),
  p("Halaman berkas digunakan untuk memantau kelengkapan dokumen peserta, seperti KTP, KK, ijazah, dan foto."),
  h2("j. Laporan"),
  p("Halaman laporan menampilkan rekap pembayaran yang sudah disetujui. Data dapat difilter berdasarkan periode dan metode pembayaran."),
  h2("k. Pengaturan"),
  p("Halaman pengaturan digunakan untuk mengelola profil lembaga, data pengguna, dan data kursus."),

  h1("8. Desain Data Utama"),
  bullet("User: id, email, passwordHash, nama, role, noHp."),
  bullet("Siswa: id, nim, nama, kategoriKursus, noHp, alamat, totalBiaya, tanggalDaftar, status."),
  bullet("Kursus: kode, nama, biaya, durasiMinggu, deskripsi, statusAktif."),
  bullet("Transaksi: id, siswaId, nominal, metode, buktiPath, catatan, statusValidasi, alasanTolak, createdAt, userId."),
  bullet("Pendaftaran: nomorPendaftaran, namaLengkap, noKtp, alamat, noTelpWa, kejuruanPelatihan, statusPendaftaran, data dokumen."),
  bullet("SiswaKursus: nim dan kodeKursus sebagai relasi graph."),

  h1("9. Kesimpulan"),
  p("Desain aplikasi NC Finance dirancang untuk menyelesaikan masalah administrasi dan keuangan pada LPK Nida Course. Aplikasi ini menerapkan teori struktur data dalam kasus nyata, seperti penggunaan ArrayList untuk penyimpanan daftar, HashMap untuk pencarian cepat, Stack untuk undo transaksi, Queue untuk validasi transaksi, serta Graph untuk relasi siswa dan kursus. Dengan desain ini, proses pencatatan, validasi, dan pelaporan menjadi lebih terstruktur, aman, dan mudah dipantau."),
];

const doc = new Document({
  creator: "Kelompok Struktur Data",
  title,
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 24 } },
      heading1: { run: { font: "Cambria", size: 32, bold: true, color: "111111" } },
      heading2: { run: { font: "Calibri", size: 28, bold: true, color: "111111" } },
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
      children,
    },
  ],
});

const out = await Packer.toBuffer(doc);
await writeFile("Tugas-Desain-Aplikasi-NC-Finance.docx", out);
console.log("ok Tugas-Desain-Aplikasi-NC-Finance.docx", out.length);
