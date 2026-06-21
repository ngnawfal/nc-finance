package com.ncfinance.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * JDBC connection MySQL.
 * Urutan prioritas config:
 *   1. System property  (-DNC_DB_USER=...)  – diset oleh run-backend.bat
 *   2. Environment variable (NC_DB_USER)
 *   3. Default dev untuk URL + user saja; PASSWORD TIDAK punya default.
 *
 * Password (NC_DB_PASS) WAJIB diset lewat system property / env var.
 * Tidak ada password yang di-hardcode di source supaya tidak ikut ter-commit.
 */
public class DatabaseConnection {
    private static final String DEFAULT_URL  = "jdbc:mysql://localhost:3306/ncfinance?serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true&autoReconnect=true";
    private static final String DEFAULT_USER = "ncfinance_app";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC driver tidak ditemukan. Pastikan mysql-connector-j-*.jar ada di classpath.", e);
        }
    }

    public static Connection get() throws SQLException {
        String url  = conf("NC_DB_URL",  DEFAULT_URL);
        String user = conf("NC_DB_USER", DEFAULT_USER);
        String pass = conf("NC_DB_PASS", null);
        if (pass == null || pass.isBlank()) {
            throw new SQLException("NC_DB_PASS belum diset. Jalankan lewat run-backend.bat "
                + "(salin secret.env.bat.example -> secret.env.bat lalu isi password DB) "
                + "atau set env var NC_DB_PASS.");
        }
        return DriverManager.getConnection(url, user, pass);
    }

    /**
     * Baca dari System.property dulu, fallback ke env var, fallback ke default.
     * run-backend.bat pass -DNC_DB_USER=... ke JVM supaya selalu terbaca.
     * Untuk secret (password) panggil dengan fallback null supaya WAJIB diset dari luar.
     */
    private static String conf(String key, String fallback) {
        // 1) system property (-Dkey=value)
        String v = System.getProperty(key);
        if (v != null && !v.isBlank()) return v;
        // 2) environment variable
        v = System.getenv(key);
        if (v != null && !v.isBlank()) return v;
        // 3) default (null untuk secret -> dipaksa diset dari luar)
        return fallback;
    }

    public static boolean testConnection() {
        try (Connection c = get()) {
            return c != null && !c.isClosed();
        } catch (SQLException e) {
            System.err.println("[DB] Connection test failed: " + e.getMessage());
            return false;
        }
    }
}
