package com.ncfinance.manager;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.interfaces.DataManager;
import com.ncfinance.model.Siswa;
import com.ncfinance.model.Transaksi;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;

/** HashMap lookup NIM, LinkedHashMap + LinkedList histori pembayaran. */
public class SiswaManager implements DataManager<Siswa> {
    private final HashMap<String, Siswa> siswaMap = new HashMap<>();
    private final LinkedHashMap<String, LinkedList<Transaksi>> historiPerSiswa = new LinkedHashMap<>();

    public synchronized void loadFromDatabase() throws SQLException {
        siswaMap.clear();
        historiPerSiswa.clear();
        String sql = "SELECT id, nim, nama, kategori_kursus, no_hp, alamat, total_biaya, tanggal_daftar, tanggal_mulai, tanggal_selesai, status FROM siswa ORDER BY tanggal_daftar ASC";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Siswa s = new Siswa(
                    rs.getString("id"), rs.getString("nim"), rs.getString("nama"), rs.getString("kategori_kursus"), rs.getString("no_hp"), rs.getString("alamat"), rs.getDouble("total_biaya"),
                    rs.getDate("tanggal_daftar").toLocalDate(),
                    rs.getDate("tanggal_mulai") == null ? null : rs.getDate("tanggal_mulai").toLocalDate(),
                    rs.getDate("tanggal_selesai") == null ? null : rs.getDate("tanggal_selesai").toLocalDate(),
                    rs.getString("status")
                );
                siswaMap.put(s.getNim(), s);
                historiPerSiswa.put(s.getNim(), new LinkedList<>());
            }
        }
        System.out.println("[SiswaManager] Loaded " + siswaMap.size() + " siswa (HashMap LinkedHashMap).");
    }

    public synchronized void indexTransaksi(List<Transaksi> all) {
        for (Transaksi t : all) {
            Siswa s = findById(t.getSiswaId());
            if (s == null) continue;
            LinkedList<Transaksi> hist = historiPerSiswa.computeIfAbsent(s.getNim(), ignored -> new LinkedList<>());
            hist.addFirst(t);
        }
    }

    private Siswa findById(String id) {
        for (Siswa s : siswaMap.values()) if (s.getId().equals(id)) return s;
        return null;
    }

    @Override
    public synchronized void tambah(Siswa s) {
        try (Connection c = DatabaseConnection.get()) {
            c.setAutoCommit(false);
            try (PreparedStatement ps = c.prepareStatement("INSERT INTO siswa (id, nim, nama, kategori_kursus, no_hp, alamat, total_biaya, tanggal_daftar, tanggal_mulai, tanggal_selesai, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)")) {
                ps.setString(1, s.getId()); ps.setString(2, s.getNim()); ps.setString(3, s.getNama()); ps.setString(4, s.getKategoriKursus()); ps.setString(5, s.getNoHp()); ps.setString(6, s.getAlamat()); ps.setDouble(7, s.getTotalBiaya());
                ps.setDate(8, java.sql.Date.valueOf(s.getTanggalDaftar()));
                ps.setDate(9, s.getTanggalMulai() == null ? null : java.sql.Date.valueOf(s.getTanggalMulai()));
                ps.setDate(10, s.getTanggalSelesai() == null ? null : java.sql.Date.valueOf(s.getTanggalSelesai()));
                ps.setString(11, s.getStatus());
                ps.executeUpdate();
            }
            try (PreparedStatement ps = c.prepareStatement("INSERT IGNORE INTO siswa_kursus (siswa_id, kursus_kode, tanggal_daftar) VALUES (?,?,?)")) {
                ps.setString(1, s.getId()); ps.setString(2, s.getKategoriKursus()); ps.setDate(3, java.sql.Date.valueOf(s.getTanggalDaftar())); ps.executeUpdate();
            }
            c.commit();
            siswaMap.put(s.getNim(), s);
            historiPerSiswa.putIfAbsent(s.getNim(), new LinkedList<>());
        } catch (SQLException e) {
            throw new IllegalStateException("Gagal menyimpan siswa: " + e.getMessage(), e);
        }
    }

    public synchronized boolean update(String nim, String nama, String kategori, String noHp, String alamat, double totalBiaya, java.time.LocalDate tanggalMulai, java.time.LocalDate tanggalSelesai, String status) {
        Siswa s = siswaMap.get(nim);
        if (s == null) return false;
        String nextNama = nama == null || nama.isBlank() ? s.getNama() : nama;
        String nextKategori = kategori == null || kategori.isBlank() ? s.getKategoriKursus() : kategori;
        String nextNoHp = noHp == null ? s.getNoHp() : noHp;
        String nextAlamat = alamat == null ? s.getAlamat() : alamat;
        double nextTotal = totalBiaya >= 0 ? totalBiaya : s.getTotalBiaya();
        java.time.LocalDate nextMulai = tanggalMulai == null ? s.getTanggalMulai() : tanggalMulai;
        java.time.LocalDate nextSelesai = tanggalSelesai == null ? s.getTanggalSelesai() : tanggalSelesai;
        String nextStatus = status == null || status.isBlank() ? s.getStatus() : status;
        try (Connection c = DatabaseConnection.get()) {
            c.setAutoCommit(false);
            try (PreparedStatement ps = c.prepareStatement("UPDATE siswa SET nama=?, kategori_kursus=?, no_hp=?, alamat=?, total_biaya=?, tanggal_mulai=?, tanggal_selesai=?, status=? WHERE nim=?")) {
                ps.setString(1, nextNama); ps.setString(2, nextKategori); ps.setString(3, nextNoHp); ps.setString(4, nextAlamat); ps.setDouble(5, nextTotal);
                ps.setDate(6, nextMulai == null ? null : java.sql.Date.valueOf(nextMulai));
                ps.setDate(7, nextSelesai == null ? null : java.sql.Date.valueOf(nextSelesai));
                ps.setString(8, nextStatus); ps.setString(9, nim); ps.executeUpdate();
            }
            try (PreparedStatement ps = c.prepareStatement("DELETE FROM siswa_kursus WHERE siswa_id=?")) { ps.setString(1, s.getId()); ps.executeUpdate(); }
            try (PreparedStatement ps = c.prepareStatement("INSERT IGNORE INTO siswa_kursus (siswa_id, kursus_kode, tanggal_daftar) VALUES (?,?,?)")) { ps.setString(1, s.getId()); ps.setString(2, nextKategori); ps.setDate(3, java.sql.Date.valueOf(s.getTanggalDaftar())); ps.executeUpdate(); }
            c.commit();
            s.setNama(nextNama); s.setKategoriKursus(nextKategori); s.setNoHp(nextNoHp); s.setAlamat(nextAlamat); s.setTotalBiaya(nextTotal); s.setTanggalMulai(nextMulai); s.setTanggalSelesai(nextSelesai); s.setStatus(nextStatus);
            return true;
        } catch (SQLException e) {
            throw new IllegalStateException("Gagal memperbarui siswa: " + e.getMessage(), e);
        }
    }

    @Override
    public synchronized Siswa cari(String nim) { return siswaMap.get(nim); }
    public synchronized LinkedList<Transaksi> getHistori(String nim) { return new LinkedList<>(historiPerSiswa.getOrDefault(nim, new LinkedList<>())); }

    @Override
    public synchronized boolean hapus(String nim) {
        Siswa s = siswaMap.get(nim);
        if (s == null) return false;
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("DELETE FROM siswa WHERE id=?")) {
            ps.setString(1, s.getId()); ps.executeUpdate();
            siswaMap.remove(nim); historiPerSiswa.remove(nim);
            return true;
        } catch (SQLException e) {
            throw new IllegalStateException("Gagal menghapus siswa: " + e.getMessage(), e);
        }
    }

    @Override
    public synchronized List<Siswa> tampilSemua() { return new ArrayList<>(siswaMap.values()); }
    public synchronized int jumlahSiswa() { return siswaMap.size(); }

    public synchronized String generateNextId() {
        int max = 0;
        for (Siswa s : siswaMap.values()) {
            try { int number = Integer.parseInt(s.getId().substring(1)); if (number > max) max = number; } catch (Exception ignored) {}
        }
        return "s" + (max + 1);
    }

    public synchronized String generateNextNim() {
        int max = 0;
        for (String nim : siswaMap.keySet()) {
            try { int number = Integer.parseInt(nim.substring(nim.lastIndexOf("-") + 1)); if (number > max) max = number; } catch (Exception ignored) {}
        }
        return String.format("NC-2026-%03d", max + 1);
    }
}
