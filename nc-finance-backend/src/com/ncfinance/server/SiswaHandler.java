package com.ncfinance.server;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.model.Siswa;
import com.ncfinance.model.User;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;

/** /api/siswa HashMap lookup LinkedHashMap/LinkedList history. */
public class SiswaHandler extends BaseHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        User user = requireAuth(ex);
        if (user == null) return;
        try {
            String method = ex.getRequestMethod();
            String path = ex.getRequestURI().getPath();

            if ("GET".equals(method) && path.equals("/api/siswa")) { send(ex, 200, "{\"data\":" + JsonUtil.siswaList(AppContext.siswaManager.tampilSemua()) + ",\"total\":" + AppContext.siswaManager.jumlahSiswa() + "}"); return; }
            if ("GET".equals(method) && path.startsWith("/api/siswa/") && path.endsWith("/transaksi")) { String nim = path.substring("/api/siswa/".length(), path.length() - "/transaksi".length()); send(ex, 200, "{\"transaksiList\":" + JsonUtil.transaksiList(AppContext.siswaManager.getHistori(nim)) + "}"); return; }
            if ("GET".equals(method) && path.startsWith("/api/siswa/")) { String nim = path.substring("/api/siswa/".length()); Siswa s = AppContext.siswaManager.cari(nim); if (s == null) { error(ex, 404, "Siswa tidak ditemukan"); return; } send(ex, 200, "{\"siswa\":" + JsonUtil.siswa(s) + "}"); return; }

            if ("PUT".equals(method) && path.startsWith("/api/siswa/")) {
                String nim = path.substring("/api/siswa/".length());
                String json = body(ex);
                boolean ok = AppContext.siswaManager.update(nim, extractJsonString(json, "nama"), extractJsonString(json, "kategoriKursus"), extractJsonString(json, "noHp"), extractJsonString(json, "alamat"), extractJsonDouble(json, "totalBiaya", -1), parseDateNullable(extractJsonString(json, "tanggalMulai")), parseDateNullable(extractJsonString(json, "tanggalSelesai")), extractJsonString(json, "status"));
                if (!ok) { error(ex, 404, "Siswa tidak ditemukan"); return; }
                AppContext.graphManager.loadFromDatabase();
                AuditLogger.log(user, ex, "update", "siswa", nim);
                send(ex, 200, "{\"siswa\":" + JsonUtil.siswa(AppContext.siswaManager.cari(nim)) + "}");
                return;
            }

            if ("DELETE".equals(method) && path.startsWith("/api/siswa/")) {
                if (!requireRole(ex, user, "manajer")) return;
                String nim = path.substring("/api/siswa/".length());
                boolean ok = AppContext.siswaManager.hapus(nim);
                if (!ok) { error(ex, 404, "Siswa tidak ditemukan"); return; }
                AppContext.graphManager.loadFromDatabase();
                AuditLogger.log(user, ex, "delete", "siswa", nim);
                send(ex, 200, "{\"message\":\"Siswa dihapus\"}");
                return;
            }

            if ("POST".equals(method) && path.equals("/api/siswa")) {
                String json = body(ex);
                String nama = extractJsonString(json, "nama");
                String kategori = extractJsonString(json, "kategoriKursus");
                if (nama == null || nama.isBlank() || kategori == null || kategori.isBlank()) { error(ex, 400, "Nama dan kursus wajib diisi"); return; }
                double totalBiaya = extractJsonDouble(json, "totalBiaya", biayaKursus(kategori));
                String nim = AppContext.siswaManager.generateNextNim();
                LocalDate mulai = parseDateNullable(extractJsonString(json, "tanggalMulai"));
                if (mulai == null) mulai = LocalDate.now();
                LocalDate selesai = parseDateNullable(extractJsonString(json, "tanggalSelesai"));
                if (selesai == null) selesai = mulai.plusWeeks(durasiMinggu(kategori));
                Siswa s = new Siswa(AppContext.siswaManager.generateNextId(), nim, nama, kategori, extractJsonString(json, "noHp"), extractJsonString(json, "alamat"), totalBiaya, LocalDate.now(), mulai, selesai, "aktif");
                AppContext.siswaManager.tambah(s);
                AppContext.graphManager.loadFromDatabase();
                AuditLogger.log(user, ex, "create", "siswa", nim);
                send(ex, 201, "{\"siswa\":" + JsonUtil.siswa(s) + "}");
                return;
            }

            error(ex, 404, "Siswa endpoint tidak ditemukan");
        } catch (Exception e) {
            System.err.println("[SISWA] " + e.getMessage());
            error(ex, 500, "Terjadi kesalahan server");
        }
    }

    private LocalDate parseDateNullable(String v) { return v == null || v.isBlank() ? null : LocalDate.parse(v); }

    private int durasiMinggu(String kode) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("SELECT durasi_minggu FROM kursus WHERE kode=?")) {
            ps.setString(1, kode);
            try (ResultSet rs = ps.executeQuery()) { return rs.next() ? rs.getInt(1) : 0; }
        }
    }

    private double biayaKursus(String kode) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("SELECT biaya FROM kursus WHERE kode=?")) {
            ps.setString(1, kode);
            try (ResultSet rs = ps.executeQuery()) { return rs.next() ? rs.getDouble(1) : 0; }
        }
    }
}
