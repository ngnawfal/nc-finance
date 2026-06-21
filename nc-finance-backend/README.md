# N.C Finance Backend (Java Plain Class)

Backend sesuai PRD: Java `com.sun.net.httpserver.HttpServer`, JDBC MySQL, tanpa Spring Boot.

## Struktur Data

- `ArrayList<Transaksi>` — daftar transaksi
- `LinkedList<Transaksi>` — histori pembayaran siswa
- `Stack<Transaksi>` — undo transaksi LIFO
- `Queue<Transaksi>` — antrian validasi FIFO
- `TreeMap<LocalDate, List<Transaksi>>` — index tanggal + range search
- `HashMap<String, Siswa>` — lookup siswa by NIM
- `LinkedHashMap<String, LinkedList<Transaksi>>` — histori per siswa dengan insertion order
- Graph adjacency list — relasi Siswa ↔ Kursus + BFS/DFS
- SHA-256 hashing — password

## Setup DB

1. Jalankan MySQL di `localhost:3306`.
2. Import schema + seed:

```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

Default koneksi: `root` password kosong. Override kalau perlu:

```bash
set NC_DB_URL=jdbc:mysql://localhost:3306/ncfinance?serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true
set NC_DB_USER=root
set NC_DB_PASS=your_password
```

## Run

```bash
run-backend.bat
```

Server: `http://localhost:8080`

## Test endpoints

```bash
curl http://localhost:8080/api/siswa
curl http://localhost:8080/api/pendaftaran
curl http://localhost:8080/api/transaksi
curl http://localhost:8080/api/dashboard/summary
curl http://localhost:8080/api/graph/siswa-kursus
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"siti.rahayu@nidacourse.id\",\"password\":\"admin123\"}"
curl -X POST http://localhost:8080/api/pendaftaran -H "Content-Type: application/json" -d "{\"namaLengkap\":\"Ayu Safira\",\"noKtp\":\"3319000000000001\",\"tempatLahir\":\"Kudus\",\"tanggalLahir\":\"2003-05-10\",\"jenisKelamin\":\"Perempuan\",\"alamatLengkap\":\"Jl. Menara Kudus\",\"noTelpWa\":\"085700000001\",\"agama\":\"Islam\",\"asalInstansi\":\"Umum\",\"kejuruanPelatihan\":\"Tata Boga — Kue\",\"namaAyah\":\"Slamet\",\"namaIbu\":\"Rini\",\"alamatOrangTua\":\"Kudus\",\"dokKtp\":true,\"dokKk\":true,\"dokIjasah\":false,\"dokFoto\":true,\"tempatTtd\":\"Kudus\",\"tanggalTtd\":\"2026-06-18\",\"namaTerang\":\"Ayu Safira\"}"
```

Frontend expects backend at `http://localhost:8080`.
