// NC Finance Code Note: Client API Axios; otomatis memakai /api di hosting dan localhost:8080 saat dev lokal.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
import axios from "axios";
import type { GraphEdge, PendaftaranPeserta, Siswa, Transaksi, User } from "./types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8080" : "");

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nc_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      localStorage.removeItem("nc_token");
      localStorage.removeItem("nc_user");
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data as { token: string; user: User };
}

export async function getMe(): Promise<User> {
  const res = await api.get("/api/auth/me");
  return res.data.user as User;
}

export async function logout() {
  const res = await api.post("/api/auth/logout");
  return res.data;
}

export async function getTransaksi(): Promise<Transaksi[]> {
  const res = await api.get("/api/transaksi");
  return (res.data.data ?? []) as Transaksi[];
}

export async function getPendingTransaksi(): Promise<Transaksi[]> {
  const res = await api.get("/api/transaksi/validasi");
  return (res.data.data ?? []) as Transaksi[];
}

export async function getSiswa(): Promise<Siswa[]> {
  const res = await api.get("/api/siswa");
  return (res.data.data ?? []) as Siswa[];
}

export async function createSiswa(
  payload: Partial<Siswa> & { nama: string; kategoriKursus: string },
): Promise<Siswa> {
  const res = await api.post("/api/siswa", payload);
  return res.data.siswa as Siswa;
}

export async function updateSiswa(nim: string, payload: Partial<Siswa>): Promise<Siswa> {
  const res = await api.put(`/api/siswa/${nim}`, payload);
  return res.data.siswa as Siswa;
}

export async function deleteSiswa(nim: string) {
  const res = await api.delete(`/api/siswa/${nim}`);
  return res.data;
}

export async function createTransaksi(payload: {
  nim: string;
  nominal: number;
  metode: string;
  catatan?: string;
  buktiPath?: string | null;
}): Promise<Transaksi> {
  const res = await api.post("/api/transaksi", payload);
  return res.data.transaksi as Transaksi;
}

export async function updateTransaksi(
  id: string,
  payload: Partial<Pick<Transaksi, "nominal" | "metode" | "statusValidasi" | "alasanTolak" | "catatan">>,
) {
  const res = await api.put(`/api/transaksi/${id}`, payload);
  return res.data;
}

export async function deleteTransaksi(id: string) {
  const res = await api.delete(`/api/transaksi/${id}`);
  return res.data;
}

export async function undoTransaksi(): Promise<Transaksi> {
  const res = await api.delete("/api/transaksi/undo");
  return res.data.undoneTransaksi as Transaksi;
}

export async function restoreTransaksi(transaksi: Transaksi): Promise<Transaksi> {
  const res = await api.post("/api/transaksi/restore", transaksi);
  return res.data.transaksi as Transaksi;
}

export async function validateTransaksi(id: string, status: "approved" | "rejected", alasan?: string) {
  const res = await api.put(`/api/transaksi/${id}/validate`, { status, alasan });
  return res.data;
}

export async function getGraph(): Promise<{
  nodes: { id: string; label: string; type: "siswa" | "kursus" }[];
  edges: GraphEdge[];
}> {
  const res = await api.get("/api/graph/siswa-kursus");
  const nodes = (res.data.nodes ?? []) as { id: string; label: string; type: "siswa" | "kursus" }[];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const rawEdges = (res.data.edges ?? []) as { source: string; target: string }[];
  return {
    nodes,
    edges: rawEdges.map((edge) => {
      const source = byId.get(edge.source);
      const sourceIsSiswa = source?.type === "siswa";
      return {
        nim: sourceIsSiswa ? edge.source : edge.target,
        kodeKursus: sourceIsSiswa ? edge.target : edge.source,
      };
    }),
  };
}

export async function getPendaftaran(): Promise<PendaftaranPeserta[]> {
  const res = await api.get("/api/pendaftaran");
  return (res.data.data ?? []) as PendaftaranPeserta[];
}

export async function createPendaftaran(
  payload: Omit<PendaftaranPeserta, "id" | "nomorPendaftaran" | "statusPendaftaran"> & {
    kodeKursus: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    statusPendaftaran?: "draft" | "terdaftar" | "dibatalkan";
  },
): Promise<PendaftaranPeserta> {
  const res = await api.post("/api/pendaftaran", payload);
  return res.data.pendaftaran as PendaftaranPeserta;
}

export async function deletePendaftaran(nomorPendaftaran: string) {
  const res = await api.delete(`/api/pendaftaran/${nomorPendaftaran}`);
  return res.data;
}

export async function updatePendaftaranBerkas(
  nomorPendaftaran: string,
  payload: Pick<PendaftaranPeserta, "dokKtp" | "dokKk" | "dokIjasah" | "dokFoto"> &
    Partial<
      Pick<
        PendaftaranPeserta,
        | "dokKtpFile"
        | "dokKtpName"
        | "dokKkFile"
        | "dokKkName"
        | "dokIjasahFile"
        | "dokIjasahName"
        | "dokFotoFile"
        | "dokFotoName"
      >
    >,
): Promise<PendaftaranPeserta> {
  const res = await api.put(`/api/pendaftaran/${nomorPendaftaran}`, payload);
  return res.data.pendaftaran as PendaftaranPeserta;
}

export type PengaturanUser = { id: string; email: string; nama: string; role: "staf" | "manajer"; noHp: string };
export type PengaturanKursus = {
  kode: string;
  nama: string;
  biaya: number;
  durasiMinggu: number;
  deskripsi: string;
  statusAktif: boolean;
};
export type ProfilLembaga = { id: string; nama: string; alamat: string; nomorTelepon: string; email: string };

export async function getProfil(): Promise<ProfilLembaga> {
  const res = await api.get("/api/pengaturan/profil");
  return res.data.data as ProfilLembaga;
}

export async function updateProfil(payload: Partial<ProfilLembaga>): Promise<ProfilLembaga> {
  const res = await api.put("/api/pengaturan/profil", payload);
  return res.data.data as ProfilLembaga;
}

export async function getUsers(): Promise<PengaturanUser[]> {
  const res = await api.get("/api/pengaturan/users");
  return (res.data.data ?? []) as PengaturanUser[];
}

export async function createUser(payload: {
  email: string;
  nama: string;
  role: string;
  noHp: string;
  password: string;
}): Promise<PengaturanUser[]> {
  const res = await api.post("/api/pengaturan/users", payload);
  return (res.data.data ?? []) as PengaturanUser[];
}

export async function updateUser(id: string, payload: Partial<PengaturanUser>): Promise<PengaturanUser[]> {
  const res = await api.put(`/api/pengaturan/users/${id}`, payload);
  return (res.data.data ?? []) as PengaturanUser[];
}

export async function deleteUser(id: string): Promise<PengaturanUser[]> {
  const res = await api.delete(`/api/pengaturan/users/${id}`);
  return (res.data.data ?? []) as PengaturanUser[];
}

export async function getKursus(): Promise<PengaturanKursus[]> {
  const res = await api.get("/api/pengaturan/kursus");
  return (res.data.data ?? []) as PengaturanKursus[];
}

export async function createKursus(payload: {
  kode: string;
  nama: string;
  biaya: number;
  durasiMinggu: number;
  deskripsi: string;
}): Promise<PengaturanKursus[]> {
  const res = await api.post("/api/pengaturan/kursus", payload);
  return (res.data.data ?? []) as PengaturanKursus[];
}

export async function updateKursus(kode: string, payload: Partial<PengaturanKursus>): Promise<PengaturanKursus[]> {
  const res = await api.put(`/api/pengaturan/kursus/${kode}`, payload);
  return (res.data.data ?? []) as PengaturanKursus[];
}

export async function deleteKursus(kode: string): Promise<PengaturanKursus[]> {
  const res = await api.delete(`/api/pengaturan/kursus/${kode}`);
  return (res.data.data ?? []) as PengaturanKursus[];
}
