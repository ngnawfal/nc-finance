/*
 * NC Finance Code Note: Endpoint CRUD pendaftaran peserta dan berkas.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.server;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.model.Pembayaran;
import com.ncfinance.model.PendaftaranPeserta;
import com.ncfinance.model.Siswa;
import com.ncfinance.model.User;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** /api/pendaftaran formulir pendaftaran peserta. */
public class PendaftaranHandler extends BaseHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        User user = requireAuth(ex);
        if (user == null) return;
        try {
            String method = ex.getRequestMethod();
            String path = ex.getRequestURI().getPath();
            if ("GET".equals(method) && path.equals("/api/pendaftaran")) {
                send(ex, 200, "{\"data\":" + JsonUtil.pendaftaranList(AppContext.pendaftaranManager.tampilSemua()) + ",\"total\":" + AppContext.pendaftaranManager.tampilSemua().size() + "}"); return;
            }
            if ("GET".equals(method) && path.startsWith("/api/pendaftaran/")) {
                String nomor = path.substring("/api/pendaftaran/".length());
                PendaftaranPeserta p = AppContext.pendaftaranManager.cari(nomor);
                if (p == null) { error(ex, 404, "Pendaftaran tidak ditemukan"); return; }
                send(ex, 200, "{\"pendaftaran\":" + JsonUtil.pendaftaran(p) + "}"); return;
            }
            if ("DELETE".equals(method) && path.startsWith("/api/pendaftaran/")) {
                String nomor = path.substring("/api/pendaftaran/".length());
                boolean ok = AppContext.pendaftaranManager.hapus(nomor);
                if (!ok) { error(ex, 404, "Pendaftaran tidak ditemukan"); return; }
                AuditLogger.log(user, ex, "delete", "pendaftaran", nomor);
                send(ex, 200, "{\"message\":\"Pendaftaran dihapus\"}"); return;
            }
            if ("PUT".equals(method) && path.startsWith("/api/pendaftaran/")) {
                String nomor = path.substring("/api/pendaftaran/".length());
                updateBerkas(nomor, body(ex));
                AppContext.pendaftaranManager.loadFromDatabase();
                PendaftaranPeserta p = AppContext.pendaftaranManager.cari(nomor);
                if (p == null) { error(ex, 404, "Pendaftaran tidak ditemukan"); return; }
                AuditLogger.log(user, ex, "update_berkas", "pendaftaran", nomor);
                send(ex, 200, "{\"pendaftaran\":" + JsonUtil.pendaftaran(p) + "}"); return;
            }
            if ("POST".equals(method) && path.equals("/api/pendaftaran")) {
                String json = body(ex);
                String kodeKursus = required(json, "kodeKursus");
                String namaKursus = namaKursus(kodeKursus);
                String statusPendaftaran = "draft".equals(extractJsonString(json, "statusPendaftaran")) ? "draft" : "terdaftar";
                PendaftaranPeserta p = new PendaftaranPeserta(AppContext.pendaftaranManager.generateNextId(), AppContext.pendaftaranManager.generateNextNomor(), required(json, "namaLengkap"), required(json, "noKtp"), required(json, "tempatLahir"), parseDate(required(json, "tanggalLahir")), required(json, "jenisKelamin"), required(json, "alamatLengkap"), required(json, "noTelpWa"), extractJsonString(json, "agama"), extractJsonString(json, "asalInstansi"), namaKursus, extractJsonString(json, "namaAyah"), extractJsonString(json, "namaIbu"), extractJsonString(json, "alamatOrangTua"), false, false, false, false, extractJsonString(json, "tempatTtd") == null ? "Kudus" : extractJsonString(json, "tempatTtd"), parseDateNullable(extractJsonString(json, "tanggalTtd")), extractJsonString(json, "namaTerang"), statusPendaftaran);
                AppContext.pendaftaranManager.tambah(p);
                LocalDate mulai = parseDateNullable(extractJsonString(json, "tanggalMulai"));
                if (mulai == null) mulai = LocalDate.now();
                LocalDate selesai = parseDateNullable(extractJsonString(json, "tanggalSelesai"));
                if (selesai == null) selesai = mulai.plusWeeks(durasiKursus(kodeKursus));
                Siswa s = new Siswa(AppContext.siswaManager.generateNextId(), AppContext.siswaManager.generateNextNim(), p.getNamaLengkap(), kodeKursus, p.getNoTelpWa(), p.getAlamatLengkap(), biayaKursus(kodeKursus), LocalDate.now(), mulai, selesai, "aktif");
                AppContext.siswaManager.tambah(s);
                AppContext.graphManager.addEdge(s.getNim(), s.getKategoriKursus());
                Pembayaran pembayaranAwal = null;
                if ("terdaftar".equals(statusPendaftaran)) {
                    pembayaranAwal = new Pembayaran(
                        AppContext.transaksiManager.generateNextId(),
                        s.getId(),
                        s.getNama(),
                        s.getNim(),
                        user.getId(),
                        biayaKursus(kodeKursus),
                        "tunai",
                        null,
                        "Tagihan otomatis dari pendaftaran " + p.getNomorPendaftaran(),
                        "pending",
                        LocalDateTime.now(),
                        null
                    );
                    AppContext.transaksiManager.tambah(pembayaranAwal);
                }
                AuditLogger.log(user, ex, "create", "pendaftaran", p.getNomorPendaftaran());
                send(ex, 201, "{\"pendaftaran\":" + JsonUtil.pendaftaran(p) + ",\"siswa\":" + JsonUtil.siswa(s) + (pembayaranAwal == null ? "" : ",\"transaksi\":" + JsonUtil.transaksi(pembayaranAwal)) + "}"); return;
            }
            error(ex, 404, "Pendaftaran endpoint tidak ditemukan");
        } catch (IllegalArgumentException e) {
            error(ex, 400, e.getMessage());
        } catch (Exception e) {
            System.err.println("[PENDAFTARAN] " + e.getMessage());
            error(ex, 500, "Terjadi kesalahan server");
        }
    }

    private String required(String json, String key) {
        String v = extractJsonString(json, key);
        if (v == null || v.isBlank()) throw new IllegalArgumentException(key + " wajib diisi");
        return v;
    }
    private LocalDate parseDate(String v) { return LocalDate.parse(v); }
    private LocalDate parseDateNullable(String v) { return v == null || v.isBlank() ? null : LocalDate.parse(v); }

    private String namaKursus(String kode) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("SELECT nama FROM kursus WHERE kode=?")) {
            ps.setString(1, kode);
            try (ResultSet rs = ps.executeQuery()) { if (rs.next()) return rs.getString("nama"); }
        }
        throw new IllegalArgumentException("Program pelatihan belum tersedia Pengaturan");
    }

    private double biayaKursus(String kode) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("SELECT biaya FROM kursus WHERE kode=?")) {
            ps.setString(1, kode);
            try (ResultSet rs = ps.executeQuery()) { return rs.next() ? rs.getDouble("biaya") : 0; }
        }
    }

    private int durasiKursus(String kode) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("SELECT durasi_minggu FROM kursus WHERE kode=?")) {
            ps.setString(1, kode);
            try (ResultSet rs = ps.executeQuery()) { return rs.next() ? rs.getInt(1) : 0; }
        }
    }

    private void updateBerkas(String nomor, String json) throws Exception {
        String ktpFile = extractJsonString(json, "dokKtpFile");
        String kkFile = extractJsonString(json, "dokKkFile");
        String ijasahFile = extractJsonString(json, "dokIjasahFile");
        String fotoFile = extractJsonString(json, "dokFotoFile");
        validateUpload(ktpFile, extractJsonString(json, "dokKtpName"));
        validateUpload(kkFile, extractJsonString(json, "dokKkName"));
        validateUpload(ijasahFile, extractJsonString(json, "dokIjasahName"));
        validateUpload(fotoFile, extractJsonString(json, "dokFotoName"));
        String sql = "UPDATE pendaftaran_peserta SET dok_ktp=?, dok_ktp_file=COALESCE(?,dok_ktp_file), dok_ktp_name=COALESCE(?,dok_ktp_name), dok_kk=?, dok_kk_file=COALESCE(?,dok_kk_file), dok_kk_name=COALESCE(?,dok_kk_name), dok_ijasah=?, dok_ijasah_file=COALESCE(?,dok_ijasah_file), dok_ijasah_name=COALESCE(?,dok_ijasah_name), dok_foto=?, dok_foto_file=COALESCE(?,dok_foto_file), dok_foto_name=COALESCE(?,dok_foto_name) WHERE nomor_pendaftaran=?";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setBoolean(1, ktpFile != null || extractJsonBool(json, "dokKtp")); ps.setString(2, ktpFile); ps.setString(3, extractJsonString(json, "dokKtpName"));
            ps.setBoolean(4, kkFile != null || extractJsonBool(json, "dokKk")); ps.setString(5, kkFile); ps.setString(6, extractJsonString(json, "dokKkName"));
            ps.setBoolean(7, ijasahFile != null || extractJsonBool(json, "dokIjasah")); ps.setString(8, ijasahFile); ps.setString(9, extractJsonString(json, "dokIjasahName"));
            ps.setBoolean(10, fotoFile != null || extractJsonBool(json, "dokFoto")); ps.setString(11, fotoFile); ps.setString(12, extractJsonString(json, "dokFotoName"));
            ps.setString(13, nomor);
            ps.executeUpdate();
        }
    }

    private void validateUpload(String dataUrl, String name) {
        if (dataUrl == null) return;
        if (dataUrl.length() > 2_800_000) throw new IllegalArgumentException("Ukuran file maksimal 2 MB");
        boolean allowedMime = dataUrl.startsWith("data:image/jpeg;base64,") || dataUrl.startsWith("data:image/png;base64,") || dataUrl.startsWith("data:application/pdf;base64,");
        if (!allowedMime) throw new IllegalArgumentException("File harus JPG, PNG, atau PDF");
        if (name != null && (name.contains("/") || name.contains("\\") || name.length() > 120)) throw new IllegalArgumentException("Nama file tidak valid");
    }
}
