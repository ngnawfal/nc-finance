/*
 * NC Finance Code Note: Endpoint transaksi, validasi, undo, restore.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.server;

import com.ncfinance.model.Pembayaran;
import com.ncfinance.model.Siswa;
import com.ncfinance.model.Transaksi;
import com.ncfinance.model.User;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/** /api/transaksi ArrayList Stack Undo Queue FIFO validation. */
public class TransaksiHandler extends BaseHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        User user = requireAuth(ex);
        if (user == null) return;
        try {
            String method = ex.getRequestMethod();
            String path = ex.getRequestURI().getPath();

            if ("GET".equals(method) && path.equals("/api/transaksi")) {
                send(ex, 200, "{\"data\":" + JsonUtil.transaksiList(AppContext.transaksiManager.tampilSemua()) + ",\"total\":" + AppContext.transaksiManager.jumlahTransaksi() + "}");
                return;
            }

            if ("GET".equals(method) && path.equals("/api/transaksi/validasi")) {
                List<Transaksi> pending = AppContext.transaksiManager.tampilSemua().stream()
                    .filter(t -> "pending".equals(t.getStatusValidasi()))
                    .collect(Collectors.toList());
                send(ex, 200, "{\"data\":" + JsonUtil.transaksiList(pending) + "}");
                return;
            }

            if ("POST".equals(method) && path.equals("/api/transaksi")) {
                String json = body(ex);
                String nim = extractJsonString(json, "nim");
                String metode = extractJsonString(json, "metode");
                String bukti = extractJsonString(json, "buktiPath");
                String catatan = extractJsonString(json, "catatan");
                double nominal = extractJsonDouble(json, "nominal", 0);
                if (nominal < 1000) { error(ex, 400, "Nominal minimal 1.000"); return; }
                validateBukti(bukti);
                Siswa siswa = AppContext.siswaManager.cari(nim);
                if (siswa == null) { error(ex, 404, "Siswa tidak ditemukan"); return; }
                Pembayaran p = new Pembayaran(AppContext.transaksiManager.generateNextId(), siswa.getId(), siswa.getNama(), siswa.getNim(), user.getId(), nominal, metode == null ? "tunai" : metode, bukti, catatan, "pending", LocalDateTime.now(), null);
                AppContext.transaksiManager.tambah(p);
                AppContext.pencarianManager.indexkan(p);
                AuditLogger.log(user, ex, "create", "transaksi", p.getId());
                send(ex, 201, "{\"transaksi\":" + JsonUtil.transaksi(p) + "}");
                return;
            }

            if ("DELETE".equals(method) && path.equals("/api/transaksi/undo")) {
                if (!requireRole(ex, user, "manajer")) return;
                Transaksi undone = AppContext.transaksiManager.undo();
                if (undone == null) { error(ex, 404, "Tidak ada transaksi untuk undo"); return; }
                AuditLogger.log(user, ex, "undo", "transaksi", undone.getId());
                send(ex, 200, "{\"undoneTransaksi\":" + JsonUtil.transaksi(undone) + "}");
                return;
            }

            if ("POST".equals(method) && path.equals("/api/transaksi/restore")) {
                if (!requireRole(ex, user, "manajer")) return;
                String json = body(ex);
                Siswa siswa = AppContext.siswaManager.cari(extractJsonString(json, "siswaNim"));
                if (siswa == null) { error(ex, 404, "Siswa tidak ditemukan untuk restore"); return; }
                Pembayaran restored = new Pembayaran(
                    extractJsonString(json, "id"), siswa.getId(), siswa.getNama(), siswa.getNim(), user.getId(),
                    extractJsonDouble(json, "nominal", 0), extractJsonString(json, "metode"), extractJsonString(json, "buktiPath"),
                    extractJsonString(json, "catatan"), extractJsonString(json, "statusValidasi") == null ? "pending" : extractJsonString(json, "statusValidasi"),
                    LocalDateTime.now(), extractJsonString(json, "alasanTolak")
                );
                boolean ok = AppContext.transaksiManager.restore(restored);
                if (!ok) { error(ex, 409, "Transaksi tidak dapat dipulihkan"); return; }
                AuditLogger.log(user, ex, "restore", "transaksi", restored.getId());
                send(ex, 201, "{\"transaksi\":" + JsonUtil.transaksi(restored) + "}");
                return;
            }

            if ("PUT".equals(method) && path.startsWith("/api/transaksi/") && path.endsWith("/validate")) {
                if (!requireRole(ex, user, "manajer")) return;
                String id = path.substring("/api/transaksi/".length(), path.length() - "/validate".length());
                String json = body(ex);
                String status = extractJsonString(json, "status");
                if (!"approved".equals(status) && !"rejected".equals(status)) { error(ex, 400, "Status validasi tidak valid"); return; }
                boolean ok = AppContext.transaksiManager.updateStatus(id, status, extractJsonString(json, "alasan"));
                if (!ok) { error(ex, 404, "Transaksi tidak ditemukan"); return; }
                AuditLogger.log(user, ex, "validate", "transaksi", id);
                send(ex, 200, "{\"message\":\"Status diperbarui\"}");
                return;
            }

            if ("PUT".equals(method) && path.startsWith("/api/transaksi/")) {
                String id = path.substring("/api/transaksi/".length());
                String json = body(ex);
                String status = extractJsonString(json, "statusValidasi") == null ? extractJsonString(json, "status") : extractJsonString(json, "statusValidasi");
                boolean ok = AppContext.transaksiManager.update(id, extractJsonDouble(json, "nominal", -1), extractJsonString(json, "metode"), status, extractJsonString(json, "alasanTolak") == null ? extractJsonString(json, "alasan") : extractJsonString(json, "alasanTolak"), extractJsonString(json, "catatan"));
                if (!ok) { error(ex, 404, "Transaksi tidak ditemukan"); return; }
                AuditLogger.log(user, ex, "update", "transaksi", id);
                send(ex, 200, "{\"message\":\"Transaksi diperbarui\"}");
                return;
            }

            if ("DELETE".equals(method) && path.startsWith("/api/transaksi/")) {
                if (!requireRole(ex, user, "manajer")) return;
                String id = path.substring("/api/transaksi/".length());
                boolean ok = AppContext.transaksiManager.hapus(id);
                if (!ok) { error(ex, 404, "Transaksi tidak ditemukan"); return; }
                AuditLogger.log(user, ex, "delete", "transaksi", id);
                send(ex, 200, "{\"message\":\"Transaksi dihapus\"}");
                return;
            }

            error(ex, 404, "Transaksi endpoint tidak ditemukan");
        } catch (IllegalArgumentException e) {
            error(ex, 400, e.getMessage());
        } catch (Exception e) {
            System.err.println("[TRANSAKSI] " + e.getMessage());
            error(ex, 500, "Terjadi kesalahan server");
        }
    }

    private void validateBukti(String dataUrl) {
        if (dataUrl == null || dataUrl.isBlank()) return;
        if (dataUrl.length() > 5_500_000) throw new IllegalArgumentException("Ukuran bukti maksimal 5 MB");
        boolean allowed = dataUrl.startsWith("data:image/jpeg;base64,") || dataUrl.startsWith("data:image/png;base64,") || dataUrl.startsWith("data:application/pdf;base64,");
        if (!allowed) throw new IllegalArgumentException("Bukti harus JPG, PNG, atau PDF");
    }
}
