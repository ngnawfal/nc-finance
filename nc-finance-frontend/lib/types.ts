// NC Finance Code Note: Definisi type TypeScript untuk data backend.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
export type MetodeBayar = "qris" | "transfer" | "tunai";
export type StatusValidasi = "pending" | "approved" | "rejected";
export type RoleUser = "staf" | "manajer";

export interface Siswa {
  id: string;
  nim: string;
  nama: string;
  kategoriKursus: string;
  noHp: string;
  alamat: string;
  totalBiaya: number;
  tanggalDaftar: string;
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  status: "aktif" | "selesai";
}

export interface Transaksi {
  id: string;
  siswaId: string;
  siswaNama: string;
  siswaNim: string;
  nominal: number;
  metode: MetodeBayar;
  buktiPath: string;
  catatan?: string;
  statusValidasi: StatusValidasi;
  alasanTolak?: string;
  createdAt: string;
  userId: string;
}

export interface Kursus {
  kode: string;
  nama: string;
  biaya: number;
  durasiMinggu: number;
  deskripsi: string;
}

export interface User {
  id: string;
  email: string;
  nama: string;
  role: RoleUser;
  noHp: string;
}

export interface GraphEdge {
  nim: string;
  kodeKursus: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "siswa" | "kursus";
}

export interface PendaftaranPeserta {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  noKtp: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  alamatLengkap: string;
  noTelpWa: string;
  agama?: string;
  asalInstansi?: string;
  kejuruanPelatihan: string;
  namaAyah?: string;
  namaIbu?: string;
  alamatOrangTua?: string;
  dokKtp: boolean;
  dokKtpFile?: string | null;
  dokKtpName?: string | null;
  dokKk: boolean;
  dokKkFile?: string | null;
  dokKkName?: string | null;
  dokIjasah: boolean;
  dokIjasahFile?: string | null;
  dokIjasahName?: string | null;
  dokFoto: boolean;
  dokFotoFile?: string | null;
  dokFotoName?: string | null;
  tempatTtd?: string;
  tanggalTtd?: string;
  namaTerang?: string;
  statusPendaftaran: "draft" | "terdaftar" | "dibatalkan";
}
