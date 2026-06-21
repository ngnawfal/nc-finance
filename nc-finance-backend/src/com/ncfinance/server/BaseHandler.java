package com.ncfinance.server;

import com.ncfinance.model.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public abstract class BaseHandler implements HttpHandler {
    private static final long MAX_JSON_BODY_BYTES = 6L * 1024L * 1024L;

    protected void cors(HttpExchange ex) {
        String origin = ex.getRequestHeaders().getFirst("Origin");
        String allowedOrigins = conf("NC_ALLOWED_ORIGINS", "http://localhost:3000");
        String allowed = allowedOrigin(origin, allowedOrigins);
        if (allowed != null) ex.getResponseHeaders().set("Access-Control-Allow-Origin", allowed);
        ex.getResponseHeaders().set("Vary", "Origin");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
    }

    protected boolean handleOptions(HttpExchange ex) throws IOException {
        cors(ex);
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    protected User requireAuth(HttpExchange ex) throws IOException {
        try {
            User user = SessionManager.authenticate(ex.getRequestHeaders().getFirst("Authorization"));
            if (user == null) {
                error(ex, 401, "Sesi tidak valid atau sudah berakhir");
                return null;
            }
            return user;
        } catch (Exception e) {
            System.err.println("[AUTH] " + e.getMessage());
            error(ex, 401, "Sesi tidak valid atau sudah berakhir");
            return null;
        }
    }

    protected boolean requireRole(HttpExchange ex, User user, String role) throws IOException {
        if (user == null) return false;
        if (!role.equals(user.getRole())) {
            error(ex, 403, "Akses ditolak: membutuhkan role " + role);
            return false;
        }
        return true;
    }

    protected void send(HttpExchange ex, int status, String json) throws IOException {
        cors(ex);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.close();
    }

    protected void error(HttpExchange ex, int status, String message) throws IOException {
        String safe = status >= 500 ? "Terjadi kesalahan server" : message;
        send(ex, status, "{\"error\":" + JsonUtil.quote(safe) + "}");
    }

    protected String body(HttpExchange ex) throws IOException {
        String lengthHeader = ex.getRequestHeaders().getFirst("Content-Length");
        if (lengthHeader != null) {
            try {
                long length = Long.parseLong(lengthHeader);
                if (length > MAX_JSON_BODY_BYTES) throw new IOException("Ukuran request terlalu besar");
            } catch (NumberFormatException ignored) {
            }
        }
        try (InputStream is = ex.getRequestBody()) {
            byte[] bytes = is.readNBytes((int) MAX_JSON_BODY_BYTES + 1);
            if (bytes.length > MAX_JSON_BODY_BYTES) throw new IOException("Ukuran request terlalu besar");
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }

    protected String extractJsonString(String json, String key) {
        if (json == null) return null;
        String pattern = "\"" + key + "\"";
        int index = json.indexOf(pattern);
        if (index < 0) return null;
        int colon = json.indexOf(':', index + pattern.length());
        if (colon < 0) return null;
        int start = json.indexOf('"', colon + 1);
        if (start < 0) return null;
        StringBuilder value = new StringBuilder();
        boolean escaped = false;
        for (int i = start + 1; i < json.length(); i++) {
            char ch = json.charAt(i);
            if (escaped) {
                switch (ch) {
                    case 'n': value.append('\n'); break;
                    case 'r': value.append('\r'); break;
                    case 't': value.append('\t'); break;
                    case '"': value.append('"'); break;
                    case '\\': value.append('\\'); break;
                    default: value.append(ch); break;
                }
                escaped = false;
            } else if (ch == '\\') {
                escaped = true;
            } else if (ch == '"') {
                return value.toString();
            } else {
                value.append(ch);
            }
        }
        return null;
    }

    protected double extractJsonDouble(String json, String key, double fallback) {
        if (json == null) return fallback;
        String pattern = "\"" + key + "\"";
        int index = json.indexOf(pattern);
        if (index < 0) return fallback;
        int colon = json.indexOf(':', index + pattern.length());
        if (colon < 0) return fallback;
        int start = colon + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) start++;
        int end = start;
        while (end < json.length() && "-0123456789.".indexOf(json.charAt(end)) >= 0) end++;
        try {
            return Double.parseDouble(json.substring(start, end));
        } catch (Exception e) {
            return fallback;
        }
    }

    protected boolean extractJsonBool(String json, String key) {
        if (json == null) return false;
        String pattern = "\"" + key + "\"";
        int index = json.indexOf(pattern);
        if (index < 0) return false;
        int colon = json.indexOf(':', index + pattern.length());
        if (colon < 0) return false;
        String tail = json.substring(colon + 1).trim();
        return tail.startsWith("true") || tail.startsWith("1");
    }

    private static String conf(String key, String fallback) {
        String property = System.getProperty(key);
        if (property != null && !property.isBlank()) return property;
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String allowedOrigin(String origin, String allowedOrigins) {
        if (origin == null || origin.isBlank()) return allowedOrigins.split(",")[0].trim();
        for (String allowed : allowedOrigins.split(",")) {
            if (origin.equals(allowed.trim())) return origin;
        }
        return null;
    }
}
