package com.ncfinance.server;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.model.Manajer;
import com.ncfinance.model.Staf;
import com.ncfinance.model.User;
import com.ncfinance.util.HashUtil;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** /api/auth/login /api/auth/logout /api/auth/me server-side sessions. */
public class AuthHandler extends BaseHandler {
    private static final Map<String, Attempt> ATTEMPTS = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 10L * 60L * 1000L;

    @Override
    public void handle(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        String path = ex.getRequestURI().getPath();
        try {
            if ("GET".equals(ex.getRequestMethod()) && path.endsWith("/me")) {
                User user = requireAuth(ex);
                if (user == null) return;
                send(ex, 200, "{\"user\":" + JsonUtil.user(user) + "}");
                return;
            }

            if ("POST".equals(ex.getRequestMethod()) && path.endsWith("/login")) {
                String ip = remoteIp(ex);
                if (rateLimited(ip)) {
                    error(ex, 429, "Terlalu banyak percobaan login. Coba lagi nanti.");
                    return;
                }
                String json = body(ex);
                String email = extractJsonString(json, "email");
                String password = extractJsonString(json, "password");
                User user = login(email, password);
                if (user == null) {
                    registerFailure(ip);
                    writeLoginHistory(null, ip, ex.getRequestHeaders().getFirst("User-Agent"), "failed");
                    error(ex, 401, "Email atau password salah");
                    return;
                }
                ATTEMPTS.remove(ip);
                writeLoginHistory(user.getId(), ip, ex.getRequestHeaders().getFirst("User-Agent"), "success");
                String token = SessionManager.createSession(user);
                send(ex, 200, "{\"token\":" + JsonUtil.quote(token) + ",\"user\":" + JsonUtil.user(user) + "}");
                return;
            }

            if ("POST".equals(ex.getRequestMethod()) && path.endsWith("/logout")) {
                User user = requireAuth(ex);
                if (user == null) return;
                SessionManager.revoke(ex.getRequestHeaders().getFirst("Authorization"));
                AuditLogger.log(user, ex, "logout", "session", user.getId());
                send(ex, 200, "{\"message\":\"Logout berhasil\"}");
                return;
            }

            error(ex, 404, "Auth endpoint tidak ditemukan");
        } catch (Exception e) {
            System.err.println("[AUTH] " + e.getMessage());
            error(ex, 500, "Terjadi kesalahan server");
        }
    }

    private User login(String email, String password) throws Exception {
        if (email == null || password == null || email.isBlank() || password.isBlank()) return null;
        String sql = "SELECT id, email, hashed_password, nama, role, no_hp FROM users WHERE email = ?";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                String storedHash = rs.getString("hashed_password");
                if (!HashUtil.verifyPassword(password, storedHash)) return null;
                if (HashUtil.needsRehash(storedHash)) rehashPassword(rs.getString("id"), password);
                String role = rs.getString("role");
                if ("manajer".equals(role)) return new Manajer(rs.getString("id"), rs.getString("email"), storedHash, rs.getString("nama"), rs.getString("no_hp"));
                return new Staf(rs.getString("id"), rs.getString("email"), storedHash, rs.getString("nama"), rs.getString("no_hp"));
            }
        }
    }

    private void rehashPassword(String userId, String password) throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("UPDATE users SET hashed_password=? WHERE id=?")) {
            ps.setString(1, HashUtil.hashPassword(password));
            ps.setString(2, userId);
            ps.executeUpdate();
        }
    }

    private boolean rateLimited(String ip) {
        Attempt attempt = ATTEMPTS.get(ip);
        if (attempt == null) return false;
        if (System.currentTimeMillis() - attempt.windowStart > WINDOW_MS) {
            ATTEMPTS.remove(ip);
            return false;
        }
        return attempt.count >= MAX_ATTEMPTS;
    }

    private void registerFailure(String ip) {
        ATTEMPTS.compute(ip, (key, existing) -> {
            long now = System.currentTimeMillis();
            if (existing == null || now - existing.windowStart > WINDOW_MS) return new Attempt(1, now);
            existing.count++;
            return existing;
        });
    }

    private void writeLoginHistory(String userId, String ip, String browser, String status) {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("INSERT INTO login_history (user_id, ip_address, browser, status) VALUES (?,?,?,?)")) {
            ps.setString(1, userId);
            ps.setString(2, ip);
            ps.setString(3, browser == null ? null : browser.length() <= 160 ? browser : browser.substring(0, 160));
            ps.setString(4, status);
            ps.executeUpdate();
        } catch (Exception e) {
            System.err.println("[LOGIN_HISTORY] " + e.getMessage());
        }
    }

    private String remoteIp(HttpExchange ex) {
        return ex.getRemoteAddress() == null ? "unknown" : ex.getRemoteAddress().getAddress().getHostAddress();
    }

    private static class Attempt {
        int count;
        long windowStart;
        Attempt(int count, long windowStart) { this.count = count; this.windowStart = windowStart; }
    }
}
