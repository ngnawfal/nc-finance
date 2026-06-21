package com.ncfinance.server;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.model.Manajer;
import com.ncfinance.model.Staf;
import com.ncfinance.model.User;

import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Base64;

public class SessionManager {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long SESSION_SECONDS = 60L * 60L * 8L;

    public static String createSession(User user) throws Exception {
        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        String sql = "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, token);
            ps.setString(2, user.getId());
            ps.setLong(3, SESSION_SECONDS);
            ps.executeUpdate();
        }
        return token;
    }

    public static User authenticate(String authorizationHeader) throws Exception {
        String token = bearerToken(authorizationHeader);
        if (token == null) return null;
        String sql = "SELECT u.id,u.email,u.hashed_password,u.nama,u.role,u.no_hp FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.revoked_at IS NULL AND s.expires_at > NOW()";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, token);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                String role = rs.getString("role");
                if ("manajer".equals(role)) return new Manajer(rs.getString("id"), rs.getString("email"), rs.getString("hashed_password"), rs.getString("nama"), rs.getString("no_hp"));
                return new Staf(rs.getString("id"), rs.getString("email"), rs.getString("hashed_password"), rs.getString("nama"), rs.getString("no_hp"));
            }
        }
    }

    public static void revoke(String authorizationHeader) throws Exception {
        String token = bearerToken(authorizationHeader);
        if (token == null) return;
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("UPDATE sessions SET revoked_at=NOW() WHERE token=?")) {
            ps.setString(1, token);
            ps.executeUpdate();
        }
    }

    public static void cleanupExpired() throws Exception {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("DELETE FROM sessions WHERE expires_at < NOW() OR revoked_at IS NOT NULL")) {
            ps.executeUpdate();
        }
    }

    private static String bearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) return null;
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        return token.isEmpty() ? null : token;
    }
}
