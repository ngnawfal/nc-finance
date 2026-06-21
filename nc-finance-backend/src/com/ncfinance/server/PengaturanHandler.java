package com.ncfinance.server;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.model.User;
import com.ncfinance.util.HashUtil;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/** /api/pengaturan/users /api/pengaturan/kursus /api/pengaturan/profil */
public class PengaturanHandler extends BaseHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        User currentUser = requireAuth(ex);
        if (currentUser == null) return;
        try {
            String method = ex.getRequestMethod();
            String path = ex.getRequestURI().getPath();

            if (path.equals("/api/pengaturan/profil") && "GET".equals(method)) { send(ex, 200, profilJson()); return; }
            if (path.equals("/api/pengaturan/users") && "GET".equals(method)) { send(ex, 200, usersJson()); return; }
            if (path.equals("/api/pengaturan/kursus") && "GET".equals(method)) { send(ex, 200, kursusJson()); return; }

            if (!requireRole(ex, currentUser, "manajer")) return;

            if (path.equals("/api/pengaturan/profil") && "PUT".equals(method)) { updateProfil(body(ex)); AuditLogger.log(currentUser, ex, "update", "profil", "default"); send(ex, 200, profilJson()); return; }
            if (path.equals("/api/pengaturan/users") && "POST".equals(method)) { createUser(body(ex)); AuditLogger.log(currentUser, ex, "create", "user", null); send(ex, 201, usersJson()); return; }
            if (path.equals("/api/pengaturan/kursus") && "POST".equals(method)) { createKursus(body(ex)); AuditLogger.log(currentUser, ex, "create", "kursus", null); send(ex, 201, kursusJson()); return; }
            if (path.startsWith("/api/pengaturan/users/") && "PUT".equals(method)) { String id = path.substring("/api/pengaturan/users/".length()); updateUser(id, body(ex)); AuditLogger.log(currentUser, ex, "update", "user", id); send(ex, 200, usersJson()); return; }
            if (path.startsWith("/api/pengaturan/users/") && "DELETE".equals(method)) { String id = path.substring("/api/pengaturan/users/".length()); deleteUser(id); AuditLogger.log(currentUser, ex, "delete", "user", id); send(ex, 200, usersJson()); return; }
            if (path.startsWith("/api/pengaturan/kursus/") && "PUT".equals(method)) { String kode = path.substring("/api/pengaturan/kursus/".length()); updateKursus(kode, body(ex)); AppContext.graphManager.loadFromDatabase(); AuditLogger.log(currentUser, ex, "update", "kursus", kode); send(ex, 200, kursusJson()); return; }
            if (path.startsWith("/api/pengaturan/kursus/") && "DELETE".equals(method)) { String kode = path.substring("/api/pengaturan/kursus/".length()); deleteKursus(kode); AppContext.graphManager.loadFromDatabase(); AuditLogger.log(currentUser, ex, "delete", "kursus", kode); send(ex, 200, kursusJson()); return; }

            error(ex, 404, "Pengaturan endpoint tidak ditemukan");
        } catch (Exception e) {
            System.err.println("[PENGATURAN] " + e.getMessage());
            error(ex, 500, "Terjadi kesalahan server");
        }
    }

    private String profilJson() throws Exception {
        ensureProfil();
        String sql = "SELECT id,nama,alamat,nomor_telepon,email FROM profil_lembaga WHERE id='default'";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return "{\"data\":null}";
            return "{\"data\":{\"id\":" + JsonUtil.quote(rs.getString("id"))
                + ",\"nama\":" + JsonUtil.quote(rs.getString("nama"))
                + ",\"alamat\":" + JsonUtil.quote(rs.getString("alamat"))
                + ",\"nomorTelepon\":" + JsonUtil.quote(rs.getString("nomor_telepon"))
                + ",\"email\":" + JsonUtil.quote(rs.getString("email")) + "}}";
        }
    }

    private void ensureProfil() throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("INSERT IGNORE INTO profil_lembaga (id,nama,alamat,nomor_telepon,email) VALUES ('default','LPK Nida Course','Kudus, Jawa Tengah','','')")) {
            ps.executeUpdate();
        }
    }

    private void updateProfil(String json) throws Exception {
        ensureProfil();
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("UPDATE profil_lembaga SET nama=COALESCE(NULLIF(?,''),nama), alamat=?, nomor_telepon=?, email=? WHERE id='default'")) {
            ps.setString(1, extractJsonString(json, "nama"));
            ps.setString(2, extractJsonString(json, "alamat"));
            ps.setString(3, extractJsonString(json, "nomorTelepon"));
            ps.setString(4, extractJsonString(json, "email"));
            ps.executeUpdate();
        }
    }

    private String usersJson() throws Exception {
        StringBuilder sb = new StringBuilder("{\"data\":[");
        String sql = "SELECT id,email,nama,role,no_hp FROM users ORDER BY nama ASC";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            int i = 0;
            while (rs.next()) {
                if (i++ > 0) sb.append(',');
                sb.append("{\"id\":").append(JsonUtil.quote(rs.getString("id")))
                    .append(",\"email\":").append(JsonUtil.quote(rs.getString("email")))
                    .append(",\"nama\":").append(JsonUtil.quote(rs.getString("nama")))
                    .append(",\"role\":").append(JsonUtil.quote(rs.getString("role")))
                    .append(",\"noHp\":").append(JsonUtil.quote(rs.getString("no_hp"))).append('}');
            }
        }
        return sb.append("]}").toString();
    }

    private String kursusJson() throws Exception {
        StringBuilder sb = new StringBuilder("{\"data\":[");
        String sql = "SELECT kode,nama,biaya,durasi_minggu,deskripsi,status_aktif FROM kursus ORDER BY kode ASC";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            int i = 0;
            while (rs.next()) {
                if (i++ > 0) sb.append(',');
                sb.append("{\"kode\":").append(JsonUtil.quote(rs.getString("kode")))
                    .append(",\"nama\":").append(JsonUtil.quote(rs.getString("nama")))
                    .append(",\"biaya\":").append(rs.getDouble("biaya"))
                    .append(",\"durasiMinggu\":").append(rs.getInt("durasi_minggu"))
                    .append(",\"deskripsi\":").append(JsonUtil.quote(rs.getString("deskripsi")))
                    .append(",\"statusAktif\":").append(rs.getBoolean("status_aktif")).append('}');
            }
        }
        return sb.append("]}").toString();
    }

    private void createUser(String json) throws Exception {
        String id = "u" + System.currentTimeMillis();
        String email = extractJsonString(json, "email");
        String nama = extractJsonString(json, "nama");
        String role = extractJsonString(json, "role");
        String noHp = extractJsonString(json, "noHp");
        String password = extractJsonString(json, "password");
        if (password == null || password.isBlank()) password = "admin123";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("INSERT INTO users (id,email,hashed_password,nama,role,no_hp) VALUES (?,?,?,?,?,?)")) {
            ps.setString(1, id); ps.setString(2, email); ps.setString(3, HashUtil.hashPassword(password)); ps.setString(4, nama); ps.setString(5, role == null ? "staf" : role); ps.setString(6, noHp); ps.executeUpdate();
        }
    }

    private void updateUser(String id, String json) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("UPDATE users SET nama=COALESCE(NULLIF(?,''),nama), email=COALESCE(NULLIF(?,''),email), role=COALESCE(NULLIF(?,''),role), no_hp=? WHERE id=?")) {
            ps.setString(1, extractJsonString(json, "nama"));
            ps.setString(2, extractJsonString(json, "email"));
            ps.setString(3, extractJsonString(json, "role"));
            ps.setString(4, extractJsonString(json, "noHp"));
            ps.setString(5, id);
            ps.executeUpdate();
        }
    }

    private void deleteUser(String id) throws Exception {
        try (Connection c = DatabaseConnection.get()) {
            int deleted;
            try (PreparedStatement ps = c.prepareStatement("DELETE FROM users WHERE id=? AND NOT EXISTS (SELECT 1 FROM transaksi WHERE user_id=?)")) {
                ps.setString(1, id); ps.setString(2, id);
                deleted = ps.executeUpdate();
            }
            // Cabut semua session aktif user ini supaya token-nya langsung tidak berlaku.
            // (Eksplisit, tidak bergantung pada ON DELETE CASCADE di DB lama.)
            if (deleted > 0) {
                try (PreparedStatement ps = c.prepareStatement("DELETE FROM sessions WHERE user_id=?")) {
                    ps.setString(1, id);
                    ps.executeUpdate();
                }
            }
        }
    }

    private void createKursus(String json) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("INSERT INTO kursus (kode,nama,biaya,durasi_minggu,deskripsi,status_aktif) VALUES (?,?,?,?,?,1)")) {
            ps.setString(1, extractJsonString(json, "kode"));
            ps.setString(2, extractJsonString(json, "nama"));
            ps.setDouble(3, extractJsonDouble(json, "biaya", 0));
            ps.setInt(4, (int) extractJsonDouble(json, "durasiMinggu", 0));
            ps.setString(5, extractJsonString(json, "deskripsi"));
            ps.executeUpdate();
        }
    }

    private void updateKursus(String kode, String json) throws Exception {
        double biaya = extractJsonDouble(json, "biaya", -1);
        double durasi = extractJsonDouble(json, "durasiMinggu", -1);
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("UPDATE kursus SET nama=COALESCE(NULLIF(?,''),nama), biaya=IF(? < 0, biaya, ?), durasi_minggu=IF(? < 0, durasi_minggu, ?), deskripsi=? WHERE kode=?")) {
            ps.setString(1, extractJsonString(json, "nama"));
            ps.setDouble(2, biaya); ps.setDouble(3, biaya);
            ps.setDouble(4, durasi); ps.setDouble(5, durasi);
            ps.setString(6, extractJsonString(json, "deskripsi"));
            ps.setString(7, kode);
            ps.executeUpdate();
        }
    }

    private void deleteKursus(String kode) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("DELETE FROM kursus WHERE kode=?")) {
            ps.setString(1, kode); ps.executeUpdate();
        }
    }
}
