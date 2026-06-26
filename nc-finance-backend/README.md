# NC Finance — Backend (Java)

Backend aplikasi manajemen keuangan lembaga kursus **NC Finance**, ditulis dengan **Java murni** (tanpa Spring Boot) di atas `com.sun.net.httpserver.HttpServer` + **JDBC** (MySQL/MariaDB).

> **Kenapa Java murni, bukan framework?**
> Proyek ini adalah tugas **Struktur Data & OOP**. Framework seperti Spring menyembunyikan struktur data di balik abstraksi. Dengan Java murni, setiap `ArrayList`, `HashMap`, `Stack`, `Queue`, `TreeMap`, dan `Graph` terlihat eksplisit di kode dan bisa dijelaskan saat demo.

---

## Daftar Isi

1. [Struktur Folder](#struktur-folder)
2. [Penerapan OOP](#penerapan-oop)
   - [Abstraction — `abstract class User`](#1-abstraction--abstract-class-user)
   - [Inheritance — `Staf` & `Manajer`](#2-inheritance--staf--manajer)
   - [Polymorphism — `aksesMenu()`](#3-polymorphism--aksesmenu)
   - [Encapsulation](#4-encapsulation)
   - [Interface + Generics — `DataManager<T>`](#5-interface--generics--datamanagert)
   - [`Comparable<T>` — `Transaksi`](#6-comparablet--transaksi)
   - [Inheritance lanjutan — `Pembayaran extends Transaksi`](#7-inheritance-lanjutan--pembayaran-extends-transaksi)
3. [Penerapan Struktur Data](#penerapan-struktur-data)
4. [Setup Database](#setup-database)
5. [Menjalankan Server](#menjalankan-server)
6. [Test Endpoint](#test-endpoint)

---

## Struktur Folder

```
nc-finance-backend/
└── src/com/ncfinance/
    ├── Main.java                 # Entry point — start HttpServer
    ├── interfaces/
    │   └── DataManager.java      # Interface generic <T>
    ├── model/                    # Kelas OOP (data + perilaku)
    │   ├── User.java             # abstract class (parent)
    │   ├── Staf.java             # extends User
    │   ├── Manajer.java          # extends User
    │   ├── Transaksi.java        # implements Comparable<Transaksi>
    │   ├── Pembayaran.java       # extends Transaksi
    │   ├── Siswa.java
    │   ├── Kursus.java
    │   └── PendaftaranPeserta.java
    ├── manager/                  # Logika + struktur data
    │   ├── TransaksiManager.java # ArrayList + Stack + Queue
    │   ├── SiswaManager.java     # HashMap + LinkedHashMap
    │   ├── GraphManager.java     # Graph (adjacency list) + BFS/DFS
    │   ├── PencarianManager.java # TreeMap (range tanggal)
    │   └── PendaftaranManager.java
    ├── util/
    │   └── HashUtil.java         # PBKDF2 / SHA-256 password
    ├── database/
    │   └── DatabaseConnection.java
    └── server/                   # HTTP handler per endpoint
        ├── ApiServer.java, AppContext.java
        ├── AuthHandler.java, BaseHandler.java
        ├── TransaksiHandler.java, SiswaHandler.java
        ├── PendaftaranHandler.java, DashboardHandler.java
        └── ...
```

---

## Penerapan OOP

### 1. Abstraction — `abstract class User`

`User` adalah **kelas abstrak**: tidak bisa di-`new` langsung. Ia mendefinisikan kontrak `aksesMenu()` yang **wajib** diisi setiap turunannya, tetapi tidak menentukan bagaimana isinya.

```java
// model/User.java
public abstract class User {
    protected String id;
    protected String email;
    protected String hashedPassword;   // disembunyikan, hanya hash
    protected String nama;
    protected String role;
    protected String noHp;

    public User(String id, String email, String hashedPassword,
                String nama, String role, String noHp) {
        this.id = id;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.nama = nama;
        this.role = role;
        this.noHp = noHp;
    }

    /** Kontrak abstrak — tiap role WAJIB menentukan menunya sendiri. */
    public abstract List<String> aksesMenu();

    // getter (encapsulation)
    public String getId()    { return id; }
    public String getNama()  { return nama; }
    public String getRole()  { return role; }
    public String getEmail() { return email; }
}
```

### 2. Inheritance — `Staf` & `Manajer`

Dua role mewarisi `User`. Konstruktor memanggil `super(...)` dan meng-hardcode `role` masing-masing, sehingga role tidak mungkin salah isi.

```java
// model/Staf.java
public class Staf extends User {
    public Staf(String id, String email, String hashedPassword, String nama, String noHp) {
        super(id, email, hashedPassword, nama, "staf", noHp);   // role = "staf"
    }

    @Override
    public List<String> aksesMenu() {
        return Arrays.asList("dashboard", "transaksi", "transaksi/input", "siswa");
    }
}
```

```java
// model/Manajer.java
public class Manajer extends User {
    public Manajer(String id, String email, String hashedPassword, String nama, String noHp) {
        super(id, email, hashedPassword, nama, "manajer", noHp); // role = "manajer"
    }

    @Override
    public List<String> aksesMenu() {
        // Manajer akses penuh: termasuk laporan, grafik, pengaturan
        return Arrays.asList("dashboard", "transaksi", "transaksi/input",
                             "siswa", "siswa/graph", "pendaftaran",
                             "laporan", "pengaturan");
    }
}
```

### 3. Polymorphism — `aksesMenu()`

Karena keduanya bertipe `User`, kode pemanggil cukup tahu tipe `User` — JVM memilih implementasi yang benar saat runtime (**dynamic dispatch**).

```java
User user = login(email, password);   // bisa Staf, bisa Manajer
List<String> menu = user.aksesMenu(); // otomatis pakai versi yang tepat
// Staf    -> 4 menu operasional
// Manajer -> 8 menu (termasuk laporan & pengaturan)
```

Satu baris `user.aksesMenu()` menghasilkan perilaku berbeda tergantung objek aslinya — inilah polymorphism.

### 4. Encapsulation

Semua field memakai `protected`/`private`. Dunia luar hanya membaca lewat **getter**, dan `hashedPassword` tidak pernah diekspos sebagai plain text. State objek terlindungi dari perubahan sembarangan.

### 5. Interface + Generics — `DataManager<T>`

Interface generic menyeragamkan kontrak CRUD untuk semua manager, apa pun tipe datanya. `<T>` membuatnya **type-safe** tanpa duplikasi kode.

```java
// interfaces/DataManager.java
public interface DataManager<T> {
    void tambah(T item);          // Create
    List<T> semua();              // Read all
    T cariById(String id);        // Read one
    boolean hapus(String id);     // Delete
}
```

```java
// manager/TransaksiManager.java
public class TransaksiManager implements DataManager<Transaksi> {
    // T menjadi Transaksi -> compiler menjamin tipe pada compile-time
    @Override public void tambah(Transaksi t) { ... }
    @Override public List<Transaksi> semua()  { ... }
}
```

### 6. `Comparable<T>` — `Transaksi`

`Transaksi` mengimplementasikan `Comparable` sehingga objeknya bisa diurutkan otomatis (mis. `Collections.sort`) berdasarkan **waktu transaksi**.

```java
// model/Transaksi.java
public class Transaksi implements Comparable<Transaksi> {
    protected String id;
    protected String siswaId, siswaNama, siswaNim, userId;
    protected double nominal;
    protected String metode, buktiPath, catatan, statusValidasi;
    protected LocalDateTime createdAt;

    @Override
    public int compareTo(Transaksi other) {
        return this.createdAt.compareTo(other.createdAt); // urut by waktu
    }

    @Override
    public String toString() {
        return "Transaksi{" + siswaNama + " " + nominal + " " + metode + "}";
    }
}
```

### 7. Inheritance lanjutan — `Pembayaran extends Transaksi`

`Pembayaran` adalah transaksi khusus pembayaran kursus. Ia mewarisi seluruh field/perilaku `Transaksi` (termasuk `compareTo`) dan menambah konteks pembayaran.

```java
// model/Pembayaran.java
public class Pembayaran extends Transaksi {
    private String alasanTolak;

    public Pembayaran(String id, String siswaId, String siswaNama, String siswaNim,
                      String userId, double nominal, String metode, String buktiPath,
                      String catatan, String statusValidasi,
                      LocalDateTime createdAt, String alasanTolak) {
        super(id, siswaId, siswaNama, siswaNim, userId, nominal, metode,
              buktiPath, catatan, statusValidasi, createdAt);
        this.alasanTolak = alasanTolak;
    }
}
```

---

## Penerapan Struktur Data

| Struktur Data | Lokasi | Dipakai untuk |
|---|---|---|
| `ArrayList` | `TransaksiManager.daftarTransaksi` | Menyimpan semua transaksi berurutan |
| `HashMap` | `SiswaManager.siswaMap` | Lookup siswa by NIM **O(1)** |
| `LinkedHashMap` + `LinkedList` | `SiswaManager` histori | Histori transaksi per siswa (urut + cepat) |
| `Stack` | `TransaksiManager.undoStack` | **Undo** transaksi terakhir (LIFO) |
| `Queue` | `TransaksiManager.antriValidasi` | **Antrian validasi** pembayaran (FIFO) |
| `TreeMap` | `PencarianManager.dateIndex` | Laporan rentang tanggal (terurut) |
| `Graph` (adjacency list) | `GraphManager` | Relasi siswa ↔ kursus + BFS/DFS |
| Hashing (PBKDF2/SHA-256) | `HashUtil` | Keamanan password |

### ArrayList — daftar transaksi

Penyimpanan utama transaksi. Akses index cepat, cocok untuk iterasi & list di dashboard.

```java
// manager/TransaksiManager.java
private final List<Transaksi> daftarTransaksi = new ArrayList<>();

@Override
public void tambah(Transaksi t) {
    daftarTransaksi.add(t);        // O(1) amortized
    undoStack.push(t);             // catat untuk undo
    if ("pending".equals(t.getStatusValidasi()))
        antriValidasi.offer(t);    // masuk antrian validasi
}

@Override
public List<Transaksi> semua() {
    return new ArrayList<>(daftarTransaksi); // copy defensif
}
```

### HashMap — index siswa by NIM

Mencari siswa berdasarkan NIM (mis. `NC-2026-001`) dalam **O(1)**, jauh lebih cepat dari menelusuri list satu per satu.

```java
// manager/SiswaManager.java
private final Map<String, Siswa> siswaMap = new HashMap<>();

@Override
public void tambah(Siswa s) {
    siswaMap.put(s.getNim(), s);   // key = NIM
}

public Siswa cariByNim(String nim) {
    return siswaMap.get(nim);      // O(1) lookup
}
```

### LinkedHashMap + LinkedList — histori per siswa

`LinkedHashMap` menjaga **urutan penyisipan** siswa; tiap siswa punya `LinkedList` histori transaksi (efisien untuk append di ujung).

```java
// manager/SiswaManager.java
private final Map<String, LinkedList<Transaksi>> historiSiswa = new LinkedHashMap<>();

public void catatHistori(String nim, Transaksi t) {
    historiSiswa
        .computeIfAbsent(nim, k -> new LinkedList<>())
        .addLast(t);               // tambah di akhir, O(1)
}
```

### Stack — undo transaksi (LIFO)

Setiap transaksi yang masuk di-`push`. Fitur **undo** mengambil yang **terakhir** lebih dulu — Last In, First Out.

```java
// manager/TransaksiManager.java
private final Deque<Transaksi> undoStack = new ArrayDeque<>();

public Transaksi undoTerakhir() {
    if (undoStack.isEmpty()) return null;
    Transaksi t = undoStack.pop();         // ambil paling atas (terbaru)
    daftarTransaksi.remove(t);
    return t;
}
```

### Queue — antrian validasi (FIFO)

Pembayaran berstatus `pending` masuk antrian. Manajer memvalidasi sesuai **urutan masuk** — First In, First Out, supaya adil.

```java
// manager/TransaksiManager.java
private final Queue<Transaksi> antriValidasi = new LinkedList<>();

public Transaksi validasiBerikutnya() {
    return antriValidasi.poll();   // ambil yang paling lama menunggu
}
```

### TreeMap — index tanggal untuk laporan

`TreeMap` menyimpan transaksi terurut by tanggal. Method `subMap()` mengambil **rentang tanggal** (mis. laporan bulanan) secara efisien tanpa scan penuh.

```java
// manager/PencarianManager.java
private final TreeMap<LocalDate, List<Transaksi>> dateIndex = new TreeMap<>();

public List<Transaksi> laporanRentang(LocalDate dari, LocalDate sampai) {
    List<Transaksi> hasil = new ArrayList<>();
    // subMap mengembalikan view terurut antara dua tanggal
    for (List<Transaksi> harian : dateIndex.subMap(dari, true, sampai, true).values())
        hasil.addAll(harian);
    return hasil;
}
```

### Graph + BFS/DFS — relasi siswa ↔ kursus

Graph **bipartite** (siswa di satu sisi, kursus di sisi lain) disimpan sebagai **adjacency list** (`Map<String, List<String>>`). Dipakai untuk halaman *Relasi Peserta & Pelatihan*.

```java
// manager/GraphManager.java
private final Map<String, List<String>> adjacency = new HashMap<>();

public void addEdge(String siswaId, String kursusKode) {
    adjacency.computeIfAbsent(siswaId, k -> new ArrayList<>()).add(kursusKode);
    adjacency.computeIfAbsent(kursusKode, k -> new ArrayList<>()).add(siswaId);
}

/** BFS — telusuri relasi level demi level dari satu node. */
public List<String> bfs(String start) {
    List<String> urutan = new ArrayList<>();
    Set<String> dikunjungi = new HashSet<>();
    Queue<String> antri = new LinkedList<>();
    antri.offer(start);
    dikunjungi.add(start);
    while (!antri.isEmpty()) {
        String node = antri.poll();
        urutan.add(node);
        for (String tetangga : adjacency.getOrDefault(node, List.of())) {
            if (!dikunjungi.contains(tetangga)) {
                dikunjungi.add(tetangga);
                antri.offer(tetangga);
            }
        }
    }
    return urutan;
}

/** DFS — telusuri sedalam mungkin dulu (rekursif). */
public void dfs(String node, Set<String> dikunjungi, List<String> urutan) {
    dikunjungi.add(node);
    urutan.add(node);
    for (String tetangga : adjacency.getOrDefault(node, List.of()))
        if (!dikunjungi.contains(tetangga))
            dfs(tetangga, dikunjungi, urutan);
}
```

### Hashing — keamanan password

Password tidak pernah disimpan plain text. `HashUtil` memakai **PBKDF2WithHmacSHA256** (120.000 iterasi, salt acak) dengan format tersimpan `pbkdf2$iterations$salt$hash`. Verifikasi memakai perbandingan **constant-time** (`MessageDigest.isEqual`) untuk mencegah timing attack, dan masih kompatibel dengan hash SHA-256 lama (64-hex).

```java
// util/HashUtil.java
private static final int ITERATIONS = 120_000;
private static final int KEY_LENGTH = 256;

public static String hashPassword(String password) {
    byte[] salt = randomSalt();
    byte[] hash = pbkdf2(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
    return "pbkdf2$" + ITERATIONS + "$" + toHex(salt) + "$" + toHex(hash);
}

public static boolean verifyPassword(String password, String stored) {
    if (stored.startsWith("pbkdf2$")) return verifyPbkdf2(password, stored);
    // fallback: hash SHA-256 lama (64 hex)
    return MessageDigest.isEqual(
        hashSHA256(password).getBytes(), stored.getBytes());
}
```

---

## Setup Database

1. Jalankan MySQL/MariaDB di `localhost:3306`.
2. Import schema + seed:

```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

Default koneksi: user `root`, password kosong. Override lewat environment variable bila perlu:

```bash
set NC_DB_URL=jdbc:mysql://localhost:3306/ncfinance?serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true
set NC_DB_USER=root
set NC_DB_PASS=your_password
```

---

## Menjalankan Server

```bash
run-backend.bat
```

Atau manual:

```bash
# Compile
javac -encoding UTF-8 -d out -cp "lib/*" $(find src -name "*.java")

# Run
java -cp "out;lib/*" com.ncfinance.Main
```

Server listen di `http://localhost:8080`.

---

## Test Endpoint

```bash
curl http://localhost:8080/api/siswa
curl http://localhost:8080/api/pendaftaran
curl http://localhost:8080/api/transaksi
curl http://localhost:8080/api/dashboard/summary
curl http://localhost:8080/api/graph/siswa-kursus

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"siti.rahayu@nidacourse.id\",\"password\":\"admin123\"}"
```

> **Catatan demo struktur data:** tiap manager sengaja memakai satu struktur data inti agar mudah dijelaskan — `TransaksiManager` (ArrayList + Stack + Queue), `SiswaManager` (HashMap + LinkedHashMap), `GraphManager` (Graph + BFS/DFS), `PencarianManager` (TreeMap). Lihat tabel [Penerapan Struktur Data](#penerapan-struktur-data).

---

*Backend NC Finance — Tugas UAS Struktur Data & OOP.*
