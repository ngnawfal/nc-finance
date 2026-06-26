/*
 * NC Finance Code Note: Mengelola data pendaftaran peserta dan relasi kursus.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.manager;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.interfaces.DataManager;
import com.ncfinance.model.PendaftaranPeserta;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/** Manager pendaftaran. HashMap lookup nomor pendaftaran / KTP. */
public class PendaftaranManager implements DataManager<PendaftaranPeserta> {
    private final ArrayList<PendaftaranPeserta> daftar = new ArrayList<>();
    private final HashMap<String, PendaftaranPeserta> byNomor = new HashMap<>();

    public synchronized void loadFromDatabase() throws SQLException {
        daftar.clear();
        byNomor.clear();
        String sql = "SELECT * FROM pendaftaran_peserta ORDER BY created_at DESC";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) addMemory(fromResultSet(rs));
        }
        System.out.println("[PendaftaranManager] Loaded " + daftar.size() + " pendaftaran.");
    }

    private PendaftaranPeserta fromResultSet(ResultSet rs) throws SQLException {
        Date ttd = rs.getDate("tanggal_ttd");
        PendaftaranPeserta p = new PendaftaranPeserta(
            rs.getString("id"), rs.getString("nomor_pendaftaran"), rs.getString("nama_lengkap"), rs.getString("no_ktp"), rs.getString("tempat_lahir"), rs.getDate("tanggal_lahir").toLocalDate(), rs.getString("jenis_kelamin"), rs.getString("alamat_lengkap"), rs.getString("no_telp_wa"), rs.getString("agama"), rs.getString("asal_instansi"), rs.getString("kejuruan_pelatihan"), rs.getString("nama_ayah"), rs.getString("nama_ibu"), rs.getString("alamat_orang_tua"), rs.getBoolean("dok_ktp"), rs.getBoolean("dok_kk"), rs.getBoolean("dok_ijasah"), rs.getBoolean("dok_foto"), rs.getString("tempat_ttd"), ttd == null ? null : ttd.toLocalDate(), rs.getString("nama_terang"), rs.getString("status_pendaftaran")
        );
        p.setDokumenFiles(rs.getString("dok_ktp_file"), rs.getString("dok_ktp_name"), rs.getString("dok_kk_file"), rs.getString("dok_kk_name"), rs.getString("dok_ijasah_file"), rs.getString("dok_ijasah_name"), rs.getString("dok_foto_file"), rs.getString("dok_foto_name"));
        return p;
    }

    private void addMemory(PendaftaranPeserta p) {
        daftar.add(p);
        byNomor.put(p.getNomorPendaftaran(), p);
    }

    @Override
    public synchronized void tambah(PendaftaranPeserta p) {
        String sql = "INSERT INTO pendaftaran_peserta (id, nomor_pendaftaran, nama_lengkap, no_ktp, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat_lengkap, no_telp_wa, agama, asal_instansi, kejuruan_pelatihan, nama_ayah, nama_ibu, alamat_orang_tua, dok_ktp, dok_kk, dok_ijasah, dok_foto, tempat_ttd, tanggal_ttd, nama_terang, status_pendaftaran) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, p.getId()); ps.setString(2, p.getNomorPendaftaran()); ps.setString(3, p.getNamaLengkap()); ps.setString(4, p.getNoKtp()); ps.setString(5, p.getTempatLahir()); ps.setDate(6, java.sql.Date.valueOf(p.getTanggalLahir())); ps.setString(7, p.getJenisKelamin()); ps.setString(8, p.getAlamatLengkap()); ps.setString(9, p.getNoTelpWa()); ps.setString(10, p.getAgama()); ps.setString(11, p.getAsalInstansi()); ps.setString(12, p.getKejuruanPelatihan()); ps.setString(13, p.getNamaAyah()); ps.setString(14, p.getNamaIbu()); ps.setString(15, p.getAlamatOrangTua()); ps.setBoolean(16, p.isDokKtp()); ps.setBoolean(17, p.isDokKk()); ps.setBoolean(18, p.isDokIjasah()); ps.setBoolean(19, p.isDokFoto()); ps.setString(20, p.getTempatTtd()); ps.setDate(21, p.getTanggalTtd() == null ? null : java.sql.Date.valueOf(p.getTanggalTtd())); ps.setString(22, p.getNamaTerang()); ps.setString(23, p.getStatusPendaftaran());
            ps.executeUpdate();
            addMemory(p);
        } catch (SQLException e) {
            throw new IllegalStateException("Gagal menyimpan pendaftaran: " + e.getMessage(), e);
        }
    }

    @Override
    public synchronized boolean hapus(String key) {
        PendaftaranPeserta p = byNomor.get(key);
        if (p == null) return false;
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("DELETE FROM pendaftaran_peserta WHERE nomor_pendaftaran=?")) {
            ps.setString(1, key);
            ps.executeUpdate();
            byNomor.remove(key);
            daftar.removeIf(item -> item.getNomorPendaftaran().equals(key));
            return true;
        } catch (SQLException e) {
            throw new IllegalStateException("Gagal menghapus pendaftaran: " + e.getMessage(), e);
        }
    }

    @Override public synchronized PendaftaranPeserta cari(String key) { return byNomor.get(key); }
    @Override public synchronized List<PendaftaranPeserta> tampilSemua() { return new ArrayList<>(daftar); }

    public synchronized String generateNextId() {
        int max = 0;
        for (PendaftaranPeserta p : daftar) {
            String id = p.getId();
            if (id != null && id.startsWith("p")) try { max = Math.max(max, Integer.parseInt(id.substring(1))); } catch (NumberFormatException ignored) {}
        }
        return "p" + (max + 1);
    }

    public synchronized String generateNextNomor() {
        int max = 0;
        for (PendaftaranPeserta p : daftar) {
            String n = p.getNomorPendaftaran();
            if (n != null && n.startsWith("REG-2026-")) try { max = Math.max(max, Integer.parseInt(n.substring("REG-2026-".length()))); } catch (NumberFormatException ignored) {}
        }
        return String.format("REG-2026-%03d", max + 1);
    }
}
