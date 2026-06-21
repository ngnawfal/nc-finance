import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import path from "node:path";

const W = 1400;
const PAD = 48;
const IMG_W = W - PAD * 2;
const GAP = 24;
const STEP_GAP = 64;
const HEADER_H = 200;
const FOOTER_H = 120;

const steps = [
  { file: "01-login.png", title: "Langkah 1 — Login", desc: "Pintu masuk aplikasi. User memasukkan email dan password, sistem memvalidasi ke backend (POST /api/auth/login). Token disimpan di localStorage, lalu user diarahkan ke dashboard. Tanpa token valid, semua halaman terkunci." },
  { file: "02-dashboard.png", title: "Langkah 2 — Dashboard", desc: "Ringkasan keuangan dan operasional dalam satu layar: empat kartu KPI (total pemasukan, peserta aktif, transaksi bulan ini, pending validasi), bar chart pembayaran tujuh hari terakhir, pie chart metode bayar, serta lima transaksi terbaru. Semua angka hanya menghitung transaksi berstatus approved." },
  { file: "03-pendaftaran.png", title: "Langkah 3 — Pendaftaran Peserta", desc: "Form pendaftaran calon peserta. Staf mengisi data peserta, data orang tua, dan tanda tangan. Di sidebar kanan, staf memilih program pelatihan dan tanggal mulai/selesai. Tersedia dua tombol simpan: 'Simpan Pendaftaran' (status terdaftar) dan 'Simpan Draft' (status draft)." },
  { file: "04-siswa.png", title: "Langkah 4 — Data Siswa", desc: "Daftar peserta aktif dan pendaftar dalam bentuk kartu. Tersedia search, tombol Tambah Siswa (modal form), serta aksi Detail, Edit, dan Hapus. Hapus hanya bisa dilakukan oleh manajer. Modal detail menampilkan profil dan riwayat pembayaran peserta." },
  { file: "05-siswa-graph.png", title: "Langkah 5 — Graph Relasi Siswa & Kursus", desc: "Visualisasi struktur graf relasi peserta dengan kursus yang diikuti. Node lingkaran merepresentasikan siswa, node persegi merepresentasikan kursus, dan edge menghubungkan keduanya. Membantu memahami sebaran peserta per program." },
  { file: "06-transaksi.png", title: "Langkah 6 — Daftar Transaksi", desc: "Tabel seluruh transaksi pembayaran dengan filter status dan pencarian. Tersedia operasi edit, hapus, serta undo untuk mengembalikan transaksi yang baru dihapus. Status validasi ditampilkan sebagai badge berwarna untuk memudahkan pemantauan." },
  { file: "07-transaksi-input.png", title: "Langkah 7 — Input Transaksi", desc: "Form pencatatan pembayaran. Staf memilih peserta, mengisi nominal (terformat rupiah otomatis), memilih metode (QRIS, Transfer, Tunai), mengunggah bukti, dan menambahkan catatan opsional. Setiap transaksi baru masuk dengan status pending menunggu validasi manajer." },
  { file: "08-transaksi-validasi.png", title: "Langkah 8 — Validasi Manajer", desc: "Antrian khusus manajer untuk meninjau transaksi pending. Setiap kartu menampilkan peserta, nominal, metode, bukti, dan catatan. Manajer dapat menyetujui atau menolak (disertai alasan). Hanya transaksi yang disetujui yang masuk perhitungan dashboard dan laporan." },
  { file: "09-berkas.png", title: "Langkah 9 — Berkas Peserta", desc: "Memantau kelengkapan dokumen peserta: KTP, KK, ijazah, dan foto. Tampilan tabel menunjukkan checklist per dokumen serta persentase kelengkapan tiap peserta, sehingga staf dapat segera menindaklanjuti berkas yang belum lengkap." },
  { file: "10-laporan.png", title: "Langkah 10 — Laporan Keuangan", desc: "Rekap keuangan terstruktur dengan filter periode, chart pemasukan harian, distribusi metode pembayaran, serta tabel detail transaksi yang siap dilaporkan. Semua angka dihitung hanya dari transaksi berstatus approved." },
  { file: "11-pengaturan.png", title: "Langkah 11 — Pengaturan Sistem", desc: "Master data sistem: profil lembaga, daftar pengguna (dengan role staf atau manajer), dan daftar kursus (kode, biaya, durasi, deskripsi). Manajer dapat menambah, mengubah, atau menghapus melalui modal. Semua aksi divalidasi role di backend." },
];

function wrapText(text, charPerLine) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > charPerLine) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

const blocks = [];
let totalH = HEADER_H;

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  const buf = await readFile(path.resolve("desktop", step.file));
  const meta = await sharp(buf).metadata();
  const scale = IMG_W / meta.width;
  const imgH = Math.round(meta.height * scale);
  const descLines = wrapText(step.desc, 110);
  const descH = descLines.length * 22 + 16;
  const blockH = 56 + descH + 16 + imgH + STEP_GAP;
  blocks.push({ step, base64: buf.toString("base64"), imgH, descLines });
  totalH += blockH;
}
totalH += FOOTER_H;

let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${totalH}" viewBox="0 0 ${W} ${totalH}" font-family="-apple-system, Segoe UI, Helvetica, Arial, sans-serif">\n`;
svg += `<rect width="${W}" height="${totalH}" fill="#f9f9f8"/>\n`;

// Header
svg += `<g>\n`;
svg += `<text x="${PAD}" y="84" font-family="Georgia, serif" font-size="36" fill="#111111">Desain Aplikasi NC Finance</text>\n`;
svg += `<text x="${PAD}" y="120" font-size="16" fill="#787774">Alur penggunaan aplikasi dari login hingga pengaturan, disusun per langkah.</text>\n`;
svg += `<line x1="${PAD}" y1="160" x2="${W - PAD}" y2="160" stroke="#eaeaea" stroke-width="1"/>\n`;
svg += `</g>\n`;

let cursor = HEADER_H;
for (let i = 0; i < blocks.length; i++) {
  const { step, base64, imgH, descLines } = blocks[i];
  // Step number badge
  svg += `<g transform="translate(${PAD},${cursor})">\n`;
  svg += `<circle cx="20" cy="20" r="20" fill="#111111"/>\n`;
  svg += `<text x="20" y="26" text-anchor="middle" font-size="16" font-weight="600" fill="#ffffff">${i + 1}</text>\n`;
  svg += `<text x="56" y="18" font-family="Georgia, serif" font-size="22" fill="#111111">${escapeXml(step.title)}</text>\n`;
  svg += `<text x="56" y="40" font-size="13" fill="#787774">${escapeXml(step.file)}</text>\n`;
  svg += `</g>\n`;

  // Description
  let dy = cursor + 72;
  for (const line of descLines) {
    svg += `<text x="${PAD}" y="${dy}" font-size="15" fill="#3a3a38">${escapeXml(line)}</text>\n`;
    dy += 22;
  }

  // Image
  const imgY = dy + 8;
  svg += `<rect x="${PAD - 2}" y="${imgY - 2}" width="${IMG_W + 4}" height="${imgH + 4}" fill="#ffffff" stroke="#eaeaea" stroke-width="1" rx="14" ry="14"/>\n`;
  svg += `<image x="${PAD}" y="${imgY}" width="${IMG_W}" height="${imgH}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${base64}"/>\n`;

  cursor = imgY + imgH + STEP_GAP;
}

// Footer
svg += `<g transform="translate(${PAD},${totalH - 60})">\n`;
svg += `<line x1="0" y1="-32" x2="${IMG_W}" y2="-32" stroke="#eaeaea" stroke-width="1"/>\n`;
svg += `<text x="0" y="0" font-size="13" fill="#787774">Dokumen desain UI NC Finance — dihasilkan otomatis dari screenshot aplikasi.</text>\n`;
svg += `</g>\n`;

svg += `</svg>\n`;

function escapeXml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
}

await writeFile("desain-aplikasi.svg", svg);
console.log("done", "desain-aplikasi.svg");
