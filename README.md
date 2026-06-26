# NC-Finance

Aplikasi manajemen keuangan sekolah (SPP, transaksi, pelaporan) dengan backend **Spring Boot** dan frontend **Next.js**. Dibuat sebagai proyek UAS.

## Arsitektur

```
nc-finance/
├── nc-finance-backend/    # REST API — Spring Boot (Java 17, Gradle)
└── nc-finance-frontend/   # Web UI — Next.js 15 (App Router)
```

| Lapisan  | Teknologi |
|----------|-----------|
| Backend  | Spring Boot, Spring Security (JWT), Spring Data JPA, PostgreSQL, Gradle |
| Frontend | Next.js 15, React 19, Redux Toolkit, Tailwind CSS, Recharts |

## Fitur

- **Autentikasi** — login berbasis JWT dengan kontrol akses per peran
- **Dashboard** — ringkasan keuangan & grafik
- **Siswa** — data siswa beserta visualisasi graph
- **Transaksi** — input, validasi, dan riwayat pembayaran
- **Laporan** — rekap keuangan
- **Berkas** — manajemen dokumen
- **Pendaftaran** — pendaftaran siswa baru
- **Pengaturan** — konfigurasi aplikasi

## Prasyarat

- Java 17+
- Node.js 18+
- PostgreSQL 14+

## Menjalankan

### Backend

```bash
cd nc-finance-backend
# Salin template environment lalu isi kredensial Anda
cp secret.env.bat.example secret.env.bat   # Windows: copy secret.env.bat.example secret.env.bat
./gradlew bootRun
```

API berjalan di `http://localhost:8080`. Detail lengkap: [readme-backend.md](readme-backend.md).

### Frontend

```bash
cd nc-finance-frontend
npm install
npm run dev
```

UI berjalan di `http://localhost:3000`.

## Konfigurasi

Nilai sensitif (kredensial DB, JWT secret) **tidak** disertakan di repo. Gunakan `nc-finance-backend/secret.env.bat.example` sebagai acuan dan buat `secret.env.bat` lokal Anda sendiri.

## Lisensi

Proyek akademik — untuk keperluan pembelajaran.
