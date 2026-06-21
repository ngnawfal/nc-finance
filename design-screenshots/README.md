# NC Finance — Screenshot Pages

Hasil capture otomatis pakai Playwright. Tiap halaman ada 2 ukuran:

- `desktop/` — 1440×900, full page, 2x scale (siap untuk Figma desktop frame)
- `mobile/`  — 390×844, full page, 2x scale (iPhone 14 frame)

## Daftar Page

| # | File | Route | Catatan |
|---|------|-------|---------|
| 01 | `01-login.png` | `/login` | Halaman login awal |
| 02 | `02-dashboard.png` | `/dashboard` | Ringkasan keuangan + chart |
| 03 | `03-pendaftaran.png` | `/pendaftaran` | Form pendaftaran peserta |
| 04 | `04-siswa.png` | `/siswa` | Data peserta + detail |
| 05 | `05-siswa-graph.png` | `/siswa/graph` | Relasi pelatihan |
| 06 | `06-transaksi.png` | `/transaksi` | List pembayaran |
| 07 | `07-transaksi-input.png` | `/transaksi/input` | Catat transaksi |
| 08 | `08-transaksi-validasi.png` | `/transaksi/validasi` | Antrian validasi (manajer) |
| 09 | `09-berkas.png` | `/berkas` | Kelengkapan berkas |
| 10 | `10-laporan.png` | `/laporan` | Laporan bayar (approved) |
| 11 | `11-pengaturan.png` | `/pengaturan` | Profil, user, kursus |

## Cara Regenerate

1. Nyalakan dev server:
   ```
   cd nc-finance-frontend
   npm run dev
   ```
2. Dari folder ini:
   ```
   node capture.mjs
   ```

Script `capture.mjs` mock semua API backend, jadi tidak butuh MySQL hidup.

## Import ke Figma

- Buat 2 page: `Desktop` (frame 1440×900) dan `Mobile` (frame 390×844).
- Drag PNG dari folder masing-masing.
- Frame name pakai prefix angka biar urut otomatis.
- Kalau mau editable layers (bukan PNG), pakai plugin `html.to.design` lalu paste URL `http://localhost:3000/{route}`.
