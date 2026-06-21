package com.ncfinance.server;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.model.User;
import com.sun.net.httpserver.HttpExchange;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class AuditLogger {
    public static void log(User user, HttpExchange ex, String action, String entityType, String entityId) {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(
                "INSERT INTO audit_log (user_id, action, entity_type, entity_id, ip_address, user_agent) VALUES (?,?,?,?,?,?)")) {
            ps.setString(1, user == null ? null : user.getId());
            ps.setString(2, action);
            ps.setString(3, entityType);
            ps.setString(4, entityId);
            ps.setString(5, ex.getRemoteAddress() == null ? null : ex.getRemoteAddress().getAddress().getHostAddress());
            ps.setString(6, firstHeader(ex, "User-Agent"));
            ps.executeUpdate();
        } catch (Exception e) {
            System.err.println("[AUDIT] write failed: " + e.getMessage());
        }
    }

    private static String firstHeader(HttpExchange ex, String name) {
        String value = ex.getRequestHeaders().getFirst(name);
        return value == null || value.length() <= 200 ? value : value.substring(0, 200);
    }
}
