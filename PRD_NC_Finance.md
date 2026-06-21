# Product Requirements Document (PRD)
# N.C Finance — Sistem Pencatatan Keuangan LPK Nida Course

---

## Informasi Dokumen

| Item | Detail |
|------|--------|
| **Nama Proyek** | N.C Finance (Nida Course Finance) |
| **Versi** | 2.0 |
| **Tanggal** | Juni 2026 |
| **Mata Kuliah** | Praktikum Struktur Data |
| **Program Studi** | Teknik Informatika — Universitas Muria Kudus |
| **Frontend** | Next.js 14+ (TypeScript) + Tailwind CSS |
| **Backend** | Java (Plain Class — NetBeans IDE) |
| **Database** | MySQL 8.0 |
| **Struktur Data** | Array, LinkedList, Stack, Queue, Tree, Graph, OOP, Hash, Map |

---

## 1. Ringkasan Proyek

### 1.1 Deskripsi

N.C Finance adalah aplikasi pencatatan keuangan berbasis web yang dikembangkan untuk LPK Nida Course, sebuah lembaga kursus keterampilan di Kudus, Jawa Tengah. Aplikasi ini menggantikan proses administrasi manual (buku besar, kuitansi kertas) dengan sistem digital yang terstruktur, aman, dan dapat diakses melalui browser.

Proyek ini merupakan tugas kelompok mata kuliah Praktikum Struktur Data. Fokus utama: penerapan **9 konsep struktur data** (Array, LinkedList, Stack, Queue, Tree, Graph, OOP, Hashing, Map) secara nyata dalam aplikasi digital menggunakan bahasa pemrograman Java.

### 1.2 Tujuan

1. Mendigitalisasi seluruh pencatatan keuangan LPK Nida Course yang saat ini masih manual
2. Menerapkan minimal 9 konsep struktur data Java secara nyata di fitur-fitur aplikasi
3. Membangun frontend modern menggunakan Next.js (TypeScript + Tailwind CSS)
4. Mengembangkan backend menggunakan Java class biasa yang dijalankan di NetBeans IDE
5. Menyediakan REST API dari Java menggunakan built-in `HttpServer` untuk komunikasi dengan frontend

### 1.3 Arsitektur Sistem

```
┌──────────────────────────────┐
│     FRONTEND (Browser)       │
│     Next.js 14 + TypeScript  │
│     Tailwind CSS             │
│     Port: 3000               │
└──────────┬───────────────────┘
           │ HTTP Request (fetch/axios)
           ▼
┌──────────────────────────────┐
│     BACKEND (Java)           │
│     Plain Java Class         │
│     com.sun.net.httpserver    │
│     HttpServer (built-in)    │
│     Port: 8080               │
│                              │
│     ┌──────────────────┐     │
│     │  Struktur Data:  │     │
│     │  ArrayList        │     │
│     │  LinkedList       │     │
│     │  Stack            │     │
│     │  Queue            │     │
│     │  TreeMap (BST)    │     │
│     │  Graph (AdjList)  │     │
│     │  HashMap          │     │
│     │  LinkedHashMap    │     │
│     │  SHA-256 Hash     │     │
│     └──────────────────┘     │
└──────────┬───────────────────┘
           │ JDBC Connection
           ▼
┌──────────────────────────────┐
│     DATABASE                 │
│     MySQL 8.0                │
│     Port: 3306               │
└──────────────────────────────┘
```

**Penjelasan arsitektur:**

- **Frontend (Next.js)** berjalan di port 3000, menangani UI dan mengirim HTTP request ke backend
- **Backend (Java)** berjalan di port 8080 menggunakan `com.sun.net.httpserver.HttpServer` (built-in Java, tanpa framework tambahan). Seluruh logika bisnis dan struktur data diimplementasikan di sini
- **Database (MySQL)** diakses oleh Java melalui JDBC (java.sql.Connection)
- Tidak ada framework tambahan (Spring Boot, Laravel, dll) — murni Java class biasa

---

## 2. Pemetaan Struktur Data

Bagian ini adalah **inti dari PRD** dan menjadi deliverable utama untuk **Tugas 7**. Setiap struktur data dipetakan ke fitur spesifik, lengkap dengan implementasi Java dan kompleksitas Big-O.

### 2.1 Tabel Pemetaan Lengkap

| No | Struktur Data | Penerapan di N.C Finance | Implementasi Java | Kompleksitas | Alasan Pemilihan |
|----|---------------|--------------------------|-------------------|-------------|-----------------|
| 1 | **Array / ArrayList** | Menyimpan daftar transaksi dan daftar siswa yang ditampilkan di tabel | `ArrayList<Transaksi> daftarTransaksi = new ArrayList<>()` | Akses O(1), Insert O(1) amortized, Search O(n) | Koleksi dinamis; ukuran fleksibel; cocok untuk data yang sering ditampilkan secara sequential di DataTables |
| 2 | **LinkedList** | Riwayat pembayaran per siswa (chain of payments) | `LinkedList<Pembayaran> riwayatBayar = new LinkedList<>()` | Insert head/tail O(1), Search O(n) | Insert/delete cepat di head/tail; cocok untuk histori yang sering ditambahkan dari depan (terbaru duluan) |
| 3 | **Stack** | Fitur **Undo** transaksi terakhir (LIFO) | `Stack<Transaksi> undoStack = new Stack<>()` | Push O(1), Pop O(1), Peek O(1) | Last In First Out — transaksi terakhir yang diinput akan dibatalkan pertama kali |
| 4 | **Queue** | Antrian validasi bukti bayar oleh manajer (FIFO) | `Queue<Transaksi> antriValidasi = new LinkedList<>()` | Offer O(1), Poll O(1), Peek O(1) | First In First Out — transaksi yang masuk duluan divalidasi duluan oleh manajer |
| 5 | **Tree (BST) / TreeMap** | Sorting & range search transaksi berdasarkan tanggal | `TreeMap<LocalDate, List<Transaksi>> dateIndex = new TreeMap<>()` | Put O(log n), Get O(log n), SubMap O(log n) | Key terurut otomatis (Red-Black Tree internal); `subMap(from, to)` untuk filter rentang tanggal |
| 6 | **Graph** | Relasi Siswa ↔ Kursus (bipartite graph) untuk analisis dan rekomendasi | `HashMap<String, List<String>> adjacencyList = new HashMap<>()` | AddEdge O(1), GetNeighbors O(1), BFS O(V+E) | Adjacency List: node = Siswa + Kursus, edge = enrollment; BFS/DFS untuk analisis keterhubungan |
| 7 | **OOP** | Seluruh class model dan manager | `class Transaksi { private fields; getter/setter; }` | — | Encapsulation (private + getter/setter), Inheritance (User → Staf/Manajer), Polymorphism, Abstraction (interface) |
| 8 | **Hashing** | Enkripsi password staf + internal hashing di HashMap/HashSet | `MessageDigest.getInstance("SHA-256")` | O(1) hash computation | Password tidak disimpan plain-text; SHA-256 one-way hash; juga dipakai internal oleh HashMap |
| 9 | **Map (HashMap + LinkedHashMap)** | Lookup siswa by NIM + histori transaksi per siswa dengan urutan input terjaga | `HashMap<String, Siswa> siswaMap` + `LinkedHashMap<String, List<Transaksi>> historiPerSiswa` | Get/Put O(1) | HashMap: lookup super cepat; LinkedHashMap: O(1) lookup + menjaga insertion order |

### 2.2 Penjelasan Detail: Graph (Bipartite Siswa ↔ Kursus)

Graph adalah struktur data yang paling memerlukan justifikasi karena tidak langsung terlihat di konteks keuangan. Dalam N.C Finance, Graph diterapkan sebagai **Bipartite Graph**:

**Definisi node dan edge:**
- **Node tipe Siswa**: setiap siswa terdaftar = 1 node (key: NIM)
- **Node tipe Kursus**: setiap kategori kursus = 1 node (key: kode kursus)
- **Edge**: hubungan "siswa X mengambil kursus Y"

**Implementasi Java (Adjacency List):**

```java
public class GraphManager {
    private HashMap<String, List<String>> adjacencyList = new HashMap<>();

    public void addNode(String node) {
        adjacencyList.putIfAbsent(node, new ArrayList<>());
    }

    public void addEdge(String node1, String node2) {
        adjacencyList.get(node1).add(node2);
        adjacencyList.get(node2).add(node1); // undirected
    }

    public List<String> getNeighbors(String node) {
        return adjacencyList.getOrDefault(node, new ArrayList<>());
    }

    // BFS traversal
    public List<String> bfs(String start) {
        List<String> visited = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        Set<String> seen = new HashSet<>();
        queue.offer(start);
        seen.add(start);
        while (!queue.isEmpty()) {
            String current = queue.poll();
            visited.add(current);
            for (String neighbor : getNeighbors(current)) {
                if (!seen.contains(neighbor)) {
                    seen.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }
        return visited;
    }

    // DFS traversal
    public List<String> dfs(String start) {
        List<String> visited = new ArrayList<>();
        Stack<String> stack = new Stack<>();
        Set<String> seen = new HashSet<>();
        stack.push(start);
        seen.add(start);
        while (!stack.isEmpty()) {
            String current = stack.pop();
            visited.add(current);
            for (String neighbor : getNeighbors(current)) {
                if (!seen.contains(neighbor)) {
                    seen.add(neighbor);
                    stack.push(neighbor);
                }
            }
        }
        return visited;
    }

    // Cari semua siswa di kursus yang sama
    public List<String> findAllInSameKursus(String nim) {
        Set<String> result = new HashSet<>();
        for (String kursus : getNeighbors(nim)) {
            for (String siswa : getNeighbors(kursus)) {
                if (!siswa.equals(nim)) result.add(siswa);
            }
        }
        return new ArrayList<>(result);
    }
}
```

**Manfaat dalam aplikasi:**
1. **Analisis keterhubungan**: BFS/DFS untuk menemukan semua siswa yang rekan sekursus
2. **Rekomendasi kursus**: siswa yang mengambil kursus A, rekomendasikan kursus B yang sering diambil bersamaan
3. **Visualisasi interaktif**: halaman `/siswa/graph` menampilkan graph menggunakan D3.js
4. **Laporan popularitas**: degree setiap node kursus = jumlah pendaftar

---

## 3. Spesifikasi Backend Java (NetBeans)

### 3.1 Package Structure

```
src/
└── com/
    └── ncfinance/
        ├── model/
        │   ├── Siswa.java
        │   ├── Transaksi.java
        │   ├── Pembayaran.java
        │   ├── User.java          (abstract)
        │   ├── Staf.java          (extends User)
        │   ├── Manajer.java       (extends User)
        │   └── Kursus.java
        ├── manager/
        │   ├── TransaksiManager.java
        │   ├── SiswaManager.java
        │   ├── PencarianManager.java
        │   └── GraphManager.java
        ├── util/
        │   └── HashUtil.java
        ├── interfaces/
        │   └── DataManager.java   (interface)
        ├── server/
        │   ├── ApiServer.java     (HttpServer setup)
        │   ├── TransaksiHandler.java
        │   ├── SiswaHandler.java
        │   ├── AuthHandler.java
        │   └── GraphHandler.java
        ├── database/
        │   └── DatabaseConnection.java  (JDBC MySQL)
        └── Main.java
```

### 3.2 Daftar Class Java

| No | Nama Class | Tipe | Struktur Data | Deskripsi |
|----|-----------|------|---------------|-----------|
| 1 | `Siswa.java` | Model (OOP) | — | `private String nim, nama, kategori, noHp, alamat; LocalDate tanggalDaftar;` Encapsulation: private fields + getter/setter + toString() |
| 2 | `Transaksi.java` | Model (OOP) | — | `private String id; Siswa siswa; double nominal; String metode, buktiPath; LocalDateTime timestamp;` Implements `Comparable<Transaksi>` untuk sorting |
| 3 | `Pembayaran.java` | Model (OOP) | — | `extends Transaksi` — tambahan: `statusValidasi, alasanTolak` (Inheritance) |
| 4 | `User.java` | Model (OOP) | — | **Abstract class**: `email, hashedPassword, nama, role` + abstract method `aksesMenu()` |
| 5 | `Staf.java` | Model (OOP) | — | `extends User` — override `aksesMenu()` return menu terbatas (Polymorphism) |
| 6 | `Manajer.java` | Model (OOP) | — | `extends User` — override `aksesMenu()` return menu lengkap + method `validasiTransaksi()` |
| 7 | `Kursus.java` | Model (OOP) | — | `private String kode, nama; double biaya;` Node pada Graph |
| 8 | `TransaksiManager.java` | Service | **ArrayList, Stack, Queue** | `ArrayList<Transaksi>` daftar + `Stack<Transaksi>` undo + `Queue<Transaksi>` antrian validasi |
| 9 | `SiswaManager.java` | Service | **HashMap, LinkedHashMap, LinkedList** | `HashMap<String, Siswa>` lookup NIM + `LinkedHashMap<String, LinkedList<Transaksi>>` histori per siswa |
| 10 | `PencarianManager.java` | Service | **TreeMap (BST)** | `TreeMap<LocalDate, List<Transaksi>>` sorting tanggal + `subMap()` range search |
| 11 | `GraphManager.java` | Service | **Graph (Adjacency List)** | `HashMap<String, List<String>>` bipartite Siswa↔Kursus + BFS + DFS |
| 12 | `HashUtil.java` | Utility | **Hashing SHA-256** | `static String hashSHA256(String input)` menggunakan `MessageDigest` |
| 13 | `DataManager.java` | Interface (OOP) | — | `interface: tambah(), hapus(), cari(), tampilSemua()` — Abstraction, diimplementasikan oleh TransaksiManager dan SiswaManager |
| 14 | `ApiServer.java` | Server | — | Setup `com.sun.net.httpserver.HttpServer` port 8080, register semua handler endpoint |
| 15 | `DatabaseConnection.java` | Database | — | JDBC connection ke MySQL: `DriverManager.getConnection("jdbc:mysql://localhost:3306/ncfinance")` |
| 16 | `Main.java` | Entry Point | — | Start server + demo testing semua struktur data |

### 3.3 Diagram OOP (Inheritance, Interface, Polymorphism)

```
<<interface>> DataManager<T>
    │── tambah(T item) : void
    │── hapus(String key) : boolean
    │── cari(String key) : T
    └── tampilSemua() : List<T>
        ▲ implements
        ├── TransaksiManager (T = Transaksi)
        └── SiswaManager (T = Siswa)


<<abstract>> User
    │── email : String
    │── hashedPassword : String
    │── nama : String
    │── role : String
    │── login(String email, String password) : boolean
    └── aksesMenu() : List<String>      ← abstract
        ▲ extends
        ├── Staf
        │   └── aksesMenu() → ["dashboard", "transaksi", "siswa"]
        └── Manajer
            └── aksesMenu() → ["dashboard", "transaksi", "siswa", "laporan", "validasi", "pengaturan"]


Transaksi
    │── id, siswa, nominal, metode, buktiPath, timestamp
    └── implements Comparable<Transaksi>  // compareTo by timestamp
        ▲ extends
        └── Pembayaran
            └── statusValidasi, alasanTolak
```

### 3.4 Contoh Kode: TransaksiManager.java

```java
package com.ncfinance.manager;

import com.ncfinance.model.Transaksi;
import com.ncfinance.interfaces.DataManager;
import java.util.*;

public class TransaksiManager implements DataManager<Transaksi> {

    // STRUKTUR DATA 1: ArrayList — koleksi utama transaksi
    private ArrayList<Transaksi> daftarTransaksi = new ArrayList<>();

    // STRUKTUR DATA 2: Stack — fitur Undo (LIFO)
    private Stack<Transaksi> undoStack = new Stack<>();

    // STRUKTUR DATA 3: Queue — antrian validasi manajer (FIFO)
    private Queue<Transaksi> antriValidasi = new LinkedList<>();

    @Override
    public void tambah(Transaksi t) {
        daftarTransaksi.add(t);        // ArrayList: add O(1) amortized
        undoStack.push(t);             // Stack: push O(1)
        antriValidasi.offer(t);        // Queue: offer O(1)
    }

    // Undo transaksi terakhir — Stack LIFO
    public Transaksi undo() {
        if (undoStack.isEmpty()) return null;
        Transaksi last = undoStack.pop();       // Stack: pop O(1) — LIFO
        daftarTransaksi.remove(last);           // ArrayList: remove O(n)
        antriValidasi.remove(last);             // Queue: remove O(n)
        return last;
    }

    // Validasi transaksi terdepan — Queue FIFO
    public Transaksi validasiBerikutnya() {
        return antriValidasi.poll();            // Queue: poll O(1) — FIFO
    }

    // Lihat antrian tanpa menghapus
    public Transaksi lihatAntrianTerdepan() {
        return antriValidasi.peek();            // Queue: peek O(1)
    }

    @Override
    public boolean hapus(String id) {
        return daftarTransaksi.removeIf(t -> t.getId().equals(id));
    }

    @Override
    public Transaksi cari(String id) {
        for (Transaksi t : daftarTransaksi) {   // ArrayList: linear search O(n)
            if (t.getId().equals(id)) return t;
        }
        return null;
    }

    @Override
    public List<Transaksi> tampilSemua() {
        return new ArrayList<>(daftarTransaksi); // Return copy
    }

    public int jumlahAntrian() {
        return antriValidasi.size();
    }

    public int jumlahUndoTersedia() {
        return undoStack.size();
    }
}
```

### 3.5 Contoh Kode: SiswaManager.java

```java
package com.ncfinance.manager;

import com.ncfinance.model.Siswa;
import com.ncfinance.model.Transaksi;
import com.ncfinance.interfaces.DataManager;
import java.util.*;

public class SiswaManager implements DataManager<Siswa> {

    // STRUKTUR DATA 4: HashMap — lookup siswa by NIM, O(1)
    private HashMap<String, Siswa> siswaMap = new HashMap<>();

    // STRUKTUR DATA 5: LinkedHashMap + LinkedList — histori per siswa (urutan terjaga)
    private LinkedHashMap<String, LinkedList<Transaksi>> historiPerSiswa = new LinkedHashMap<>();

    @Override
    public void tambah(Siswa s) {
        siswaMap.put(s.getNim(), s);                         // HashMap: put O(1)
        historiPerSiswa.putIfAbsent(s.getNim(), new LinkedList<>());
    }

    @Override
    public Siswa cari(String nim) {
        return siswaMap.get(nim);                             // HashMap: get O(1)
    }

    // Tambah transaksi ke histori siswa — LinkedList
    public void tambahTransaksi(String nim, Transaksi t) {
        LinkedList<Transaksi> histori = historiPerSiswa.get(nim);
        if (histori != null) {
            histori.addFirst(t);                             // LinkedList: addFirst O(1) — terbaru di depan
        }
    }

    // Ambil histori transaksi per siswa — LinkedHashMap + LinkedList
    public LinkedList<Transaksi> getHistori(String nim) {
        return historiPerSiswa.getOrDefault(nim, new LinkedList<>());  // O(1) lookup
    }

    @Override
    public boolean hapus(String nim) {
        historiPerSiswa.remove(nim);
        return siswaMap.remove(nim) != null;                 // HashMap: remove O(1)
    }

    @Override
    public List<Siswa> tampilSemua() {
        return new ArrayList<>(siswaMap.values());           // HashMap values → ArrayList
    }

    public int jumlahSiswa() {
        return siswaMap.size();
    }
}
```

### 3.6 Contoh Kode: PencarianManager.java

```java
package com.ncfinance.manager;

import com.ncfinance.model.Transaksi;
import java.time.LocalDate;
import java.util.*;

public class PencarianManager {

    // STRUKTUR DATA 6: TreeMap (BST) — sorted by date, range search O(log n)
    private TreeMap<LocalDate, List<Transaksi>> dateIndex = new TreeMap<>();

    // Index transaksi berdasarkan tanggal
    public void indexkan(Transaksi t) {
        LocalDate date = t.getTimestamp().toLocalDate();
        dateIndex.computeIfAbsent(date, k -> new ArrayList<>()).add(t);  // O(log n)
    }

    // Range search: filter transaksi dari tanggal A sampai B
    public List<Transaksi> cariByRentangTanggal(LocalDate dari, LocalDate sampai) {
        // TreeMap subMap: O(log n) — jauh lebih cepat dari linear search O(n)
        Map<LocalDate, List<Transaksi>> hasil = dateIndex.subMap(dari, true, sampai, true);
        List<Transaksi> result = new ArrayList<>();
        for (List<Transaksi> list : hasil.values()) {
            result.addAll(list);
        }
        return result;
    }

    // Cari transaksi di tanggal spesifik
    public List<Transaksi> cariByTanggal(LocalDate tanggal) {
        return dateIndex.getOrDefault(tanggal, new ArrayList<>());  // O(log n)
    }

    // Tanggal transaksi pertama dan terakhir
    public LocalDate tanggalPertama() { return dateIndex.firstKey(); }
    public LocalDate tanggalTerakhir() { return dateIndex.lastKey(); }

    // Semua transaksi terurut dari terlama ke terbaru
    public List<Transaksi> semuaTerurut() {
        List<Transaksi> result = new ArrayList<>();
        for (List<Transaksi> list : dateIndex.values()) {  // already sorted by key (date)
            result.addAll(list);
        }
        return result;
    }
}
```

### 3.7 Contoh Kode: HashUtil.java

```java
package com.ncfinance.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashUtil {

    // STRUKTUR DATA 7: Hashing SHA-256 — password security
    public static String hashSHA256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(input.getBytes());

            // Convert bytes to hex string
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    // Verifikasi password: bandingkan hash
    public static boolean verifyPassword(String inputPassword, String storedHash) {
        return hashSHA256(inputPassword).equals(storedHash);
    }
}
```

### 3.8 Contoh Kode: ApiServer.java (Built-in Java HttpServer)

```java
package com.ncfinance.server;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class ApiServer {

    public static void start() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Register endpoint handlers
        server.createContext("/api/auth",       new AuthHandler());
        server.createContext("/api/transaksi",  new TransaksiHandler());
        server.createContext("/api/siswa",      new SiswaHandler());
        server.createContext("/api/graph",      new GraphHandler());

        // CORS header untuk Next.js (localhost:3000)
        server.setExecutor(null);
        server.start();
        System.out.println("N.C Finance API Server running at http://localhost:8080");
    }
}
```

---

## 4. Spesifikasi Frontend (Next.js)

### 4.1 Tech Stack

| Library | Kegunaan |
|---------|----------|
| **Next.js 14+** | App Router, Server/Client Components |
| **TypeScript** | Type safety |
| **Tailwind CSS 3.4+** | Utility-first styling |
| **TanStack Table v8** | DataTables (sort, filter, pagination) |
| **Recharts** | Bar chart, line chart, pie/donut chart |
| **React Hook Form + Zod** | Form handling + validation |
| **D3.js / react-force-graph** | Visualisasi Graph Siswa↔Kursus |
| **Lucide React** | Icon library |
| **Axios** | HTTP client ke Java backend (port 8080) |
| **React Hot Toast** | Notifikasi toast |
| **react-dropzone** | Upload file bukti bayar |

### 4.2 Folder Structure

```
nc-finance-frontend/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── layout.tsx              ← sidebar + topbar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── transaksi/
│   │   │   ├── page.tsx            ← histori/daftar transaksi
│   │   │   ├── input/
│   │   │   │   └── page.tsx        ← form input
│   │   │   └── validasi/
│   │   │       └── page.tsx        ← antrian validasi (Queue)
│   │   ├── siswa/
│   │   │   ├── page.tsx            ← daftar siswa
│   │   │   └── graph/
│   │   │       └── page.tsx        ← visualisasi Graph
│   │   ├── laporan/
│   │   │   └── page.tsx
│   │   └── pengaturan/
│   │       └── page.tsx
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── Breadcrumb.tsx
│   ├── transaksi/
│   │   ├── TransaksiTable.tsx
│   │   ├── TransaksiForm.tsx
│   │   ├── UndoModal.tsx           ← Stack LIFO modal
│   │   └── ValidasiKanban.tsx      ← Queue FIFO kanban
│   ├── siswa/
│   │   ├── SiswaCard.tsx
│   │   ├── SiswaModal.tsx
│   │   └── GraphVisualization.tsx  ← D3.js graph
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Dialog.tsx
│       └── Table.tsx
├── lib/
│   ├── api.ts                     ← Axios instance ke localhost:8080
│   ├── types.ts                   ← TypeScript interfaces
│   └── utils.ts                   ← formatRupiah, formatTanggal, dll
└── tailwind.config.ts
```

### 4.3 Daftar Halaman

| No | Route | Halaman | Fitur Utama | Struktur Data Terkait |
|----|-------|---------|-------------|----------------------|
| 1 | `/login` | Login Staf | Form email+password; SHA-256 hash sebelum kirim | **Hashing, HashMap** |
| 2 | `/dashboard` | Dashboard | 4 summary cards; bar chart 7 hari; donut metode bayar; 5 transaksi terbaru | **ArrayList, Queue** |
| 3 | `/transaksi` | Histori Transaksi | DataTables: search, filter metode, filter tanggal, sort, pagination; tombol Undo | **ArrayList, TreeMap, LinkedHashMap, Stack** |
| 4 | `/transaksi/input` | Form Input | 3 section form: data siswa, pembayaran, upload bukti; auto-fill NIM | **OOP, HashMap, Stack, Queue, ArrayList** |
| 5 | `/transaksi/validasi` | Antrian Validasi | Kanban 3 kolom: Menunggu/Disetujui/Ditolak; approve/reject | **Queue (FIFO)** |
| 6 | `/siswa` | Data Siswa | Card grid; modal tambah; modal detail + riwayat bayar | **HashMap, LinkedHashMap, LinkedList** |
| 7 | `/siswa/graph` | Visualisasi Graph | Graph interaktif Siswa↔Kursus; BFS highlight; info panel | **Graph, BFS, DFS** |
| 8 | `/laporan` | Laporan Keuangan | Filter bulan/tahun; chart tren; rekap per kategori; export | **TreeMap, ArrayList** |
| 9 | `/pengaturan` | Pengaturan | 4 tab: Profil, Keamanan (SHA-256), Staf, Sistem | **Hashing** |

### 4.4 Design System

**Palet Warna:**

| Token | Hex | Penggunaan |
|-------|-----|------------|
| Primary | `#1F3864` | Header, sidebar, CTA buttons |
| Primary Light | `#2E5FA3` | Hover, links |
| Background | `#FFFFFF` | Konten utama |
| Surface | `#F8F9FB` | Sidebar, card bg |
| Accent Blue | `#E6F1FB` | Info cards |
| Success | `#10B981` / `#E1F5EE` | QRIS badge, success |
| Warning | `#F59E0B` / `#FAEEDA` | Tunai badge, warning |
| Error | `#EF4444` / `#FFD7D7` | Error, hapus |
| Transfer | `#3B82F6` | Transfer badge |

**Tipografi:**
- Font: Inter (Google Fonts), fallback system-ui
- H1: text-2xl (24px) font-bold
- H2: text-lg (18px) font-semibold
- Body: text-sm (14px)
- Mono: font-mono untuk NIM, kode, nominal

**Komponen:**
- Border radius: rounded-lg (8px) card, rounded-md (6px) button/input
- Shadow: shadow-sm card, shadow-md modal
- Badge metode bayar: QRIS (green), Transfer (blue), Tunai (amber)

---

## 5. Skema Database (MySQL)

### 5.1 Daftar Tabel

| No | Tabel | Kolom | Keterangan |
|----|-------|-------|------------|
| 1 | `users` | `id` PK, `email` UNIQUE, `hashed_password`, `nama`, `role` ENUM(staf,manajer), `no_hp`, `created_at`, `updated_at` | Staf & manajer; password = SHA-256 hash |
| 2 | `siswa` | `id` PK, `nim` UNIQUE INDEX, `nama`, `kategori_kursus`, `no_hp`, `alamat`, `total_biaya`, `tanggal_daftar`, `status` ENUM(aktif,selesai) | NIM di-index untuk HashMap lookup |
| 3 | `transaksi` | `id` PK, `siswa_id` FK, `user_id` FK, `nominal`, `metode` ENUM(qris,transfer,tunai), `bukti_path`, `status_validasi` ENUM(pending,approved,rejected), `alasan_tolak`, `created_at` | Data pembayaran; status untuk Queue validasi |
| 4 | `kursus` | `id` PK, `kode` UNIQUE, `nama`, `biaya`, `deskripsi`, `status_aktif` | Node pada Graph bipartite |
| 5 | `siswa_kursus` | `id` PK, `siswa_id` FK, `kursus_id` FK, `tanggal_daftar` | **Edge pada Graph** — tabel pivot N:M |
| 6 | `login_history` | `id` PK, `user_id` FK, `ip_address`, `browser`, `status` ENUM(success,failed), `created_at` | Audit trail login |

### 5.2 Relasi

```
users 1 ──── N transaksi        (staf mencatat banyak transaksi)
siswa 1 ──── N transaksi        (siswa punya banyak pembayaran)
siswa N ──── M kursus            (via siswa_kursus = Graph edge)
users 1 ──── N login_history     (riwayat login)
```

---

## 6. API Endpoints

Base URL: `http://localhost:8080`

### 6.1 Authentication

| Method | Endpoint | Request | Response | Struktur Data |
|--------|----------|---------|----------|---------------|
| POST | `/api/auth/login` | `{ email, hashedPassword }` | `{ token, user }` | **Hashing** SHA-256 compare + **HashMap** session |
| POST | `/api/auth/logout` | Header: Bearer token | `{ message }` | HashMap remove session |
| PUT | `/api/auth/change-password` | `{ oldHash, newHash }` | `{ message }` | **Hashing** SHA-256 |

### 6.2 Transaksi

| Method | Endpoint | Request | Response | Struktur Data |
|--------|----------|---------|----------|---------------|
| GET | `/api/transaksi` | `?page&size&search&metode&from&to` | `{ data[], total, pages }` | **ArrayList** + **TreeMap** range + **LinkedHashMap** |
| POST | `/api/transaksi` | FormData: siswa, nominal, metode, buktiFile | `{ transaksi }` | **ArrayList** add + **Stack** push + **Queue** offer + **OOP** new Transaksi() |
| DELETE | `/api/transaksi/undo` | — | `{ undoneTransaksi }` | **Stack** pop (LIFO) |
| GET | `/api/transaksi/validasi` | `?status=pending\|approved\|rejected` | `{ data[] }` | **Queue** peek/view |
| PUT | `/api/transaksi/{id}/validate` | `{ status, alasan? }` | `{ transaksi }` | **Queue** poll (FIFO) |

### 6.3 Siswa

| Method | Endpoint | Request | Response | Struktur Data |
|--------|----------|---------|----------|---------------|
| GET | `/api/siswa` | `?page&size&search` | `{ data[], total }` | **ArrayList** dari HashMap.values() |
| GET | `/api/siswa/{nim}` | — | `{ siswa }` | **HashMap** get O(1) |
| POST | `/api/siswa` | `{ nim, nama, kategori, noHp, alamat, totalBiaya }` | `{ siswa }` | **HashMap** put + **Graph** addNode |
| GET | `/api/siswa/{nim}/transaksi` | — | `{ transaksiList[] }` | **LinkedHashMap** + **LinkedList** |

### 6.4 Graph

| Method | Endpoint | Request | Response | Struktur Data |
|--------|----------|---------|----------|---------------|
| GET | `/api/graph/siswa-kursus` | — | `{ nodes[], edges[] }` | **Graph** adjacencyList |
| GET | `/api/graph/bfs/{startNode}` | — | `{ visited[], path[] }` | **Graph** BFS traversal |
| GET | `/api/graph/dfs/{startNode}` | — | `{ visited[], path[] }` | **Graph** DFS traversal |
| GET | `/api/graph/rekan-sekursus/{nim}` | — | `{ siswaList[] }` | **Graph** findAllInSameKursus |

### 6.5 Laporan & Dashboard

| Method | Endpoint | Request | Response | Struktur Data |
|--------|----------|---------|----------|---------------|
| GET | `/api/dashboard/summary` | — | `{ totalHariIni, pendaftarBaru, totalTransaksi, antrianValidasi }` | **ArrayList** aggregasi + **Queue** size |
| GET | `/api/dashboard/chart` | `?range=7d` | `{ labels[], values[] }` | **TreeMap** sorted iteration |
| GET | `/api/laporan` | `?bulan&tahun` | `{ summary, rekapKategori[], chartData }` | **TreeMap** range + **ArrayList** aggregasi |

---

## 7. Mapping ke Tugas Dosen

| Tugas | Deskripsi | Deliverable dari PRD Ini |
|-------|-----------|--------------------------|
| **Tugas 6** | Analisis masalah studi kasus | Dokumen Analisis Kebutuhan (terpisah) + Bab 1 PRD |
| **Tugas 7** | Penerapan struktur data | **Bab 2**: Tabel pemetaan 9 struktur data → fitur → Java → Big-O |
| **Tugas 8** | Perancangan backend | **Bab 3**: 16 class Java + package structure + OOP diagram + **Bab 5**: database + **Bab 6**: API |
| **Tugas 9a** | Bangun aplikasi | **Bab 4**: 9 halaman Next.js + design system + **Bab 3**: kode Java siap implementasi |
| **Tugas 9b** | Laporan proyek | Seluruh PRD ini + Analisis Kebutuhan + Flowchart |
| **Tugas 10** | Video promosi | Gunakan halaman yang sudah dibangun untuk screen recording |

---

## 8. Ringkasan Teknis

| Aspek | Jumlah | Detail |
|-------|--------|--------|
| Struktur Data | **9** | Array, LinkedList, Stack, Queue, Tree, Graph, OOP, Hash, Map |
| Class Java | **16** | 7 model + 4 manager + 1 utility + 1 interface + 2 server + 1 database + 1 main |
| Halaman Frontend | **9** | Login, Dashboard, Transaksi, Input, Validasi, Siswa, Graph, Laporan, Pengaturan |
| Tabel Database | **6** | users, siswa, transaksi, kursus, siswa_kursus, login_history |
| API Endpoints | **18** | 3 auth + 5 transaksi + 4 siswa + 4 graph + 2 laporan/dashboard |
| Konsep OOP | **4** | Encapsulation, Inheritance, Polymorphism, Abstraction |

---

*Dokumen ini disusun oleh Tim Pengembang N.C Finance — Teknik Informatika, Universitas Muria Kudus, Juni 2026*
