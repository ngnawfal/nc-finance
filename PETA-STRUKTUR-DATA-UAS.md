# Peta Struktur Data + Bahan Sidang/Demo UAS — NC Finance

> Backend Java murni (`com.sun.net.httpserver`). Dokumen ini memetakan **setiap materi
> semester 2** ke lokasi nyata di kode, alasan pemilihannya, dan kompleksitas Big-O —
> supaya siap menjawab pertanyaan dosen saat demo.
>
> Semua path relatif ke `nc-finance-backend/src/com/ncfinance/`.

---

## Ringkasan: 1 materi = 1 baris

| # | Materi | Struktur Java | Lokasi | Fungsi di aplikasi |
|---|---|---|---|---|
| 1 | Array / List | `ArrayList<Transaksi>` | `manager/TransaksiManager.java:21` | daftar semua transaksi |
| 2 | HashMap / Map | `HashMap<String,Siswa>` | `manager/SiswaManager.java:20` | cari siswa by NIM cepat |
| 3 | LinkedHashMap | `LinkedHashMap<...>` | `manager/SiswaManager.java:21` | histori per-siswa, urutan terjaga |
| 4 | Linked List | `LinkedList<Transaksi>` | `manager/SiswaManager.java:21,111` | histori transaksi tiap siswa |
| 5 | Stack (LIFO) | `Stack<Transaksi>` | `manager/TransaksiManager.java:22,62` | fitur **undo** transaksi |
| 6 | Queue (FIFO) | `Queue<Transaksi>` | `manager/TransaksiManager.java:23,51` | **antrian validasi** pembayaran |
| 7 | Tree | `TreeMap<LocalDate,...>` | `manager/PencarianManager.java:19` | filter transaksi per rentang tanggal |
| 8 | Graph (BFS & DFS) | `HashMap` adjacency list | `manager/GraphManager.java:27,49,68` | relasi **siswa ↔ kursus** |
| 9 | Hashing | SHA-256 / PBKDF2 | `util/HashUtil.java` | hash password |
| 10 | OOP (inheritance, abstract, polymorphism) | `User`→`Staf`/`Manajer` | `model/User.java:10` | hak akses per peran |
| 11 | Generics + Interface | `interface DataManager<T>` | `interfaces/DataManager.java:10` | kontrak manager |
| 12 | Comparable | `Transaksi implements Comparable` | `model/Transaksi.java:9,57` | urut transaksi by waktu |

---

## Penjelasan per materi (untuk menjawab "kenapa pakai ini?")

### 1. Array / ArrayList — daftar transaksi
- **Di mana:** `TransaksiManager.daftarTransaksi` (`:21`).
- **Kenapa:** butuh koleksi berurutan yang sering di-iterasi (tampilkan semua, hitung total).
- **Big-O:** akses index `O(1)`, tambah di akhir `O(1)`, cari nilai `O(n)`.
- **Jawaban jika ditanya "kenapa bukan LinkedList?":** akses & iterasi ArrayList lebih cepat
  (data tersimpan berurutan di memori); kita jarang menyisip di tengah.

### 2. HashMap — cari siswa by NIM
- **Di mana:** `SiswaManager.siswaMap` (`:20`), lookup di `cari(nim)`.
- **Kenapa:** pencarian siswa berdasarkan NIM harus instan.
- **Big-O:** cari/insert/hapus **`O(1)` rata-rata** (lewat hashing key).
- **Kaitan hashing:** key (NIM) di-hash jadi indeks bucket → ini contoh nyata materi *hash*.

### 3. LinkedHashMap — histori per siswa dengan urutan
- **Di mana:** `SiswaManager.historiPerSiswa` (`:21`).
- **Kenapa:** seperti HashMap (lookup `O(1)`) **tapi mempertahankan urutan masuk**, jadi
  daftar siswa tampil konsisten, tidak acak.
- **Beda dengan HashMap biasa:** HashMap tak menjamin urutan; LinkedHashMap menjamin.

### 4. Linked List — histori transaksi tiap siswa
- **Di mana:** value dari `historiPerSiswa`, dikembalikan di `getHistori()` (`:111`).
- **Kenapa:** histori sering **ditambah di ujung**; LinkedList tambah depan/belakang `O(1)`.
- **Big-O:** tambah ujung `O(1)`, akses index `O(n)`.

### 5. Stack — fitur Undo (LIFO)
- **Di mana:** `TransaksiManager.undoStack` (`:22`), `push()` saat transaksi baru (`:62`).
- **Kenapa:** undo = "batalkan yang **terakhir**" → sifat **Last In First Out** persis Stack.
- **Operasi:** `push` (simpan), `pop` (undo ambil teratas), `peek`. Semua `O(1)`.
- **Analogi demo:** tumpukan piring — yang terakhir ditaruh, pertama diambil.

### 6. Queue — Antrian validasi pembayaran (FIFO)
- **Di mana:** `TransaksiManager.antriValidasi` (`:23`), `offer()` saat pending (`:51`).
- **Kenapa:** pembayaran divalidasi **urut datang** → **First In First Out** = Queue.
- **Operasi:** `offer` (masuk antrian), `poll` (proses terdepan), `peek`. `O(1)`.
- **Analogi demo:** antrian loket — yang datang duluan dilayani duluan.

### 7. Tree / TreeMap — filter transaksi per rentang tanggal
- **Di mana:** `PencarianManager.dateIndex` (`:19`), tipe `TreeMap<LocalDate, List<Transaksi>>`.
- **Kenapa:** TreeMap menyimpan key **terurut** (implementasi Red-Black Tree), jadi ambil
  data "Jan–Jun 2026" efisien lewat `subMap()`/range, tanpa scan semua.
- **Big-O:** cari/insert/hapus **`O(log n)`**; selalu terurut otomatis.
- **Beda dengan HashMap:** HashMap `O(1)` tapi **tak terurut**; TreeMap `O(log n)` tapi
  **terurut** → cocok untuk query rentang.

### 8. Graph — relasi Siswa ↔ Kursus (BFS & DFS)
- **Di mana:** `GraphManager`. Representasi **adjacency list** = `HashMap<String,List<String>>`
  (`:27`). BFS pakai **Queue** (`:49–51`), DFS pakai **Stack** (`:68–70`), `seen` pakai
  **HashSet** untuk hindari kunjungan ganda.
- **Kenapa:** siswa terhubung ke kursus (dan sebaliknya) = simpul & sisi → model Graph.
- **BFS (Breadth-First):** telusuri per "lapis", pakai **Queue**. Untuk cari relasi terdekat.
- **DFS (Depth-First):** telusuri sedalam mungkin dulu, pakai **Stack**.
- **Big-O:** `O(V + E)` (V = simpul, E = sisi).
- **Poin bagus:** di sini Queue & Stack **dipakai ulang** sebagai mesin BFS/DFS — bukti paham
  fungsinya, bukan sekadar mendeklarasikan.

### 9. Hashing — password
- **Di mana:** `util/HashUtil.java`.
- **Apa:** SHA-256 (`hashSHA256`) untuk demo materi hash; password asli pakai **PBKDF2 bersalt**
  (lebih aman). Verifikasi pakai `MessageDigest.isEqual` (anti timing-attack).
- **Kaitan materi:** fungsi hash = ubah input jadi nilai tetap; dipakai juga di HashMap (#2).

### 10. OOP — inheritance, abstraction, polymorphism, encapsulation
- **Di mana:** `model/User.java:10` (`abstract class User`), `Staf`/`Manajer extends User`.
- **Abstraction:** `User` abstract, tak bisa di-instansiasi langsung.
- **Inheritance:** `Staf` & `Manajer` mewarisi `User`.
- **Polymorphism:** method `aksesMenu()` abstract, **di-override** beda di tiap subclass
  (Manajer dapat menu lebih banyak dari Staf).
- **Encapsulation:** field `private` + getter (lihat `Siswa`, `Transaksi`).

### 11. Generics + Interface
- **Di mana:** `interfaces/DataManager.java:10` → `interface DataManager<T>`.
- **Kenapa:** satu kontrak generik dipakai berbagai manager (type-safe, hindari cast).

### 12. Comparable — pengurutan transaksi
- **Di mana:** `model/Transaksi.java:9,57` → `implements Comparable<Transaksi>`,
  `compareTo` membandingkan `createdAt`.
- **Kenapa:** supaya transaksi bisa **diurutkan otomatis** by waktu (dan jadi key TreeMap #7).

---

## Kemungkinan pertanyaan dosen + jawaban singkat

**"Kenapa data disimpan di memori, bukan langsung query DB tiap saat?"**
> Karena tugas ini fokus struktur data. Data di-*load* dari DB ke struktur (HashMap, Stack,
> Queue, dll) saat start, lalu operasi cepat dilakukan di memori. Tiap perubahan tetap
> ditulis balik ke DB (write-through), jadi tidak hilang saat restart.

**"Bedanya HashMap, LinkedHashMap, TreeMap?"**
> HashMap: `O(1)`, tak terurut. LinkedHashMap: `O(1)`, terurut sesuai urutan masuk.
> TreeMap: `O(log n)`, terurut menurut key (cocok untuk pencarian rentang).

**"Kenapa Stack untuk undo dan Queue untuk validasi?"**
> Undo butuh yang terakhir dulu (LIFO) → Stack. Validasi harus adil urut datang (FIFO) →
> Queue.

**"Beda BFS dan DFS?"**
> BFS melebar per lapis pakai Queue; DFS mendalam dulu pakai Stack. Keduanya `O(V+E)`.

**"Mana contoh polymorphism-nya?"**
> `User.aksesMenu()` abstract, di-override berbeda oleh `Staf` dan `Manajer`.

**"Apa fungsi hashing di sini?"**
> Dua: (1) mempercepat lookup di HashMap lewat hash key NIM, (2) mengamankan password
> (SHA-256 / PBKDF2).

---

## Checklist sebelum demo
- [ ] Nyalakan **MySQL/MariaDB (XAMPP)** dulu.
- [ ] Jalankan backend: `run-backend.bat` (butuh `secret.env.bat` berisi password DB).
- [ ] Jalankan frontend: `npm run dev` di `nc-finance-frontend`.
- [ ] Login pakai **email** (`bagus.pratomo@nidacourse.id` / `admin123`).
- [ ] Siapkan menjelaskan **min. 1 struktur data sambil menunjuk baris kodenya**.
- [ ] Hafal Big-O tabel ringkasan di atas.
