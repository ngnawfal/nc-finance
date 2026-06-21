import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import {
  arrow, arrowPath, decision, database, document as docSym, io, process, terminator, svgWrap,
} from "./flowchart-shapes.mjs";

// ===== Flowchart 1: Login & Auth =====
function fc1() {
  const W = 760, H = 760;
  const cx = W / 2;
  let s = "";
  s += terminator(cx, 30, "Mulai");
  s += io(cx, 110, "Input email & password");
  s += process(cx, 200, "POST /api/auth/login");
  s += database(660, 200, "MySQL users");
  s += decision(cx, 320, "Email & password cocok?");
  s += process(180, 320, "Tampilkan pesan error", 200, 56);
  s += process(cx, 470, "Simpan nc_token & nc_user");
  s += process(cx, 560, "Redirect ke /dashboard");
  s += terminator(cx, 650, "Selesai");

  // arrows
  s += arrow(cx, 54, cx, 82);
  s += arrow(cx, 138, cx, 172);
  s += arrow(cx, 228, cx, 265);
  s += arrow(cx + 100, 200, 590, 200, "query");
  s += arrow(590, 220, cx + 100, 230, "hasil");
  s += arrow(cx - 100, 320, 280, 320, "Tidak");
  s += arrowPath([[180, 292], [180, 110], [cx - 110, 110]]);
  s += arrow(cx, 375, cx, 442, "Ya");
  s += arrow(cx, 498, cx, 532);
  s += arrow(cx, 588, cx, 622);
  return svgWrap(W, H, "Flowchart 1 — Login dan Otentikasi", s);
}

// ===== Flowchart 2: Pendaftaran Peserta =====
function fc2() {
  const W = 760, H = 820;
  const cx = W / 2;
  let s = "";
  s += terminator(cx, 30, "Mulai");
  s += process(cx, 110, "Buka /pendaftaran");
  s += process(cx, 190, "Muat daftar kursus");
  s += database(660, 190, "kursus");
  s += io(cx, 280, "Input data peserta dan ortu");
  s += decision(cx, 400, "Tombol simpan?");
  s += process(180, 400, "Status = draft", 200, 56);
  s += process(580, 400, "Status = terdaftar", 220, 56);
  s += process(cx, 540, "POST /api/pendaftaran");
  s += database(660, 540, "pendaftaran");
  s += docSym(cx, 650, "Toast: pendaftaran tersimpan");
  s += terminator(cx, 760, "Selesai");

  s += arrow(cx, 54, cx, 82);
  s += arrow(cx, 138, cx, 172);
  s += arrow(cx, 218, cx, 252);
  s += arrow(cx + 110, 190, 590, 190);
  s += arrow(cx, 308, cx, 345);
  s += arrow(cx - 100, 400, 280, 400, "Draft");
  s += arrow(cx + 100, 400, 470, 400, "Pendaftaran");
  s += arrowPath([[180, 428], [180, 540], [cx - 110, 540]]);
  s += arrowPath([[580, 428], [580, 540], [cx + 110, 540]]);
  s += arrow(cx + 110, 540, 590, 540, "INSERT");
  s += arrow(cx, 568, cx, 618);
  s += arrow(cx, 682, cx, 732);
  return svgWrap(W, H, "Flowchart 2 — Pendaftaran Peserta", s);
}

// ===== Flowchart 3: Transaksi (Input → Validasi → Laporan) =====
function fc3() {
  const W = 820, H = 900;
  const cx = W / 2;
  let s = "";
  s += terminator(cx, 30, "Mulai");
  s += process(cx, 110, "Staf buka /transaksi/input");
  s += io(cx, 200, "Input peserta, nominal, metode, bukti");
  s += process(cx, 300, "POST /api/transaksi (status = pending)");
  s += database(720, 300, "transaksi");
  s += process(cx, 400, "Notifikasi pending muncul di Topbar");
  s += process(cx, 490, "Manajer buka /transaksi/validasi");
  s += decision(cx, 600, "Setujui atau Tolak?");
  s += process(180, 600, "Status = rejected (alasan)", 240, 56);
  s += process(640, 600, "Status = approved", 220, 56);
  s += process(cx, 730, "PUT /api/transaksi/{id}/validate");
  s += docSym(cx, 830, "Approved masuk dashboard & laporan");
  s += terminator(cx, 920, "Selesai");

  s += arrow(cx, 54, cx, 82);
  s += arrow(cx, 138, cx, 172);
  s += arrow(cx, 228, cx, 272);
  s += arrow(cx, 328, cx, 372);
  s += arrow(cx + 120, 300, 650, 300, "INSERT");
  s += arrow(cx, 428, cx, 462);
  s += arrow(cx, 518, cx, 545);
  s += arrow(cx - 100, 600, 300, 600, "Tolak");
  s += arrow(cx + 100, 600, 530, 600, "Setujui");
  s += arrowPath([[180, 628], [180, 730], [cx - 130, 730]]);
  s += arrowPath([[640, 628], [640, 730], [cx + 130, 730]]);
  s += arrow(cx, 758, cx, 798);
  s += arrowPath([[cx, 862], [cx, 892]]);
  return svgWrap(W, H, "Flowchart 3 — Transaksi (Input, Validasi, Laporan)", s);
}

// ===== Flowchart 4: Undo & Restore Transaksi =====
function fc4() {
  const W = 760, H = 720;
  const cx = W / 2;
  let s = "";
  s += terminator(cx, 30, "Mulai");
  s += process(cx, 110, "User pilih transaksi");
  s += process(cx, 200, "DELETE /api/transaksi/{id}");
  s += database(660, 200, "transaksi");
  s += process(cx, 300, "Backend push ke Undo Stack");
  s += decision(cx, 420, "User klik Undo?");
  s += terminator(180, 420, "Selesai");
  s += process(cx, 540, "DELETE /api/transaksi/undo");
  s += process(cx, 620, "Pop stack & restore baris");
  s += terminator(cx, 700, "Selesai");

  s += arrow(cx, 54, cx, 82);
  s += arrow(cx, 138, cx, 172);
  s += arrow(cx, 228, cx, 272);
  s += arrow(cx + 100, 200, 590, 200, "DELETE");
  s += arrow(cx, 328, cx, 365);
  s += arrow(cx - 100, 420, 230, 420, "Tidak");
  s += arrow(cx, 475, cx, 512, "Ya");
  s += arrow(cx, 568, cx, 592);
  s += arrow(cx, 648, cx, 678);
  return svgWrap(W, H, "Flowchart 4 — Undo dan Restore Transaksi", s);
}

// ===== Flowchart 5: Tambah Siswa =====
function fc5() {
  const W = 760, H = 760;
  const cx = W / 2;
  let s = "";
  s += terminator(cx, 30, "Mulai");
  s += process(cx, 110, "Klik tombol Tambah Siswa");
  s += io(cx, 200, "Isi data siswa & pilih kursus");
  s += decision(cx, 320, "NIM dikosongkan?");
  s += process(580, 320, "Generate NIM otomatis", 220, 56);
  s += process(cx, 470, "POST /api/siswa");
  s += database(660, 470, "siswa & siswa_kursus");
  s += process(cx, 580, "Reload data dan graph");
  s += docSym(cx, 670, "Toast: siswa tersimpan");
  s += terminator(cx, 740, "Selesai");

  s += arrow(cx, 54, cx, 82);
  s += arrow(cx, 138, cx, 172);
  s += arrow(cx, 228, cx, 265);
  s += arrow(cx + 100, 320, 470, 320, "Ya");
  s += arrowPath([[580, 348], [580, 470], [cx + 110, 470]]);
  s += arrow(cx, 375, cx, 442, "Tidak");
  s += arrow(cx + 110, 470, 590, 470, "INSERT");
  s += arrow(cx, 498, cx, 552);
  s += arrow(cx, 612, cx, 638);
  s += arrow(cx, 702, cx, 718);
  return svgWrap(W, H, "Flowchart 5 — Tambah Siswa", s);
}

const charts = [
  { name: "flow-1-login.png", svg: fc1() },
  { name: "flow-2-pendaftaran.png", svg: fc2() },
  { name: "flow-3-transaksi.png", svg: fc3() },
  { name: "flow-4-undo.png", svg: fc4() },
  { name: "flow-5-siswa.png", svg: fc5() },
];

for (const c of charts) {
  const png = await sharp(Buffer.from(c.svg)).png().toBuffer();
  await writeFile(c.name, png);
  console.log("ok", c.name, png.length);
}
