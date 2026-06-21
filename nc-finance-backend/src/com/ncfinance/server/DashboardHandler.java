package com.ncfinance.server;

import com.ncfinance.model.Transaksi;
import com.ncfinance.model.User;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** /api/dashboard /api/laporan aggregate ArrayList TreeMap. */
public class DashboardHandler extends BaseHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        User user = requireAuth(ex);
        if (user == null) return;
        try {
            String path = ex.getRequestURI().getPath();
            List<Transaksi> all = AppContext.transaksiManager.tampilSemua();
            List<Transaksi> approved = all.stream().filter(t -> "approved".equals(t.getStatusValidasi())).collect(Collectors.toList());

            if ("GET".equals(ex.getRequestMethod()) && path.equals("/api/dashboard/summary")) {
                double total = approved.stream().mapToDouble(Transaksi::getNominal).sum();
                long pending = all.stream().filter(t -> "pending".equals(t.getStatusValidasi())).count();
                send(ex, 200, "{\"totalPenerimaan\":" + total + ",\"totalTransaksi\":" + all.size() + ",\"jumlahSiswa\":" + AppContext.siswaManager.jumlahSiswa() + ",\"antrianValidasi\":" + pending + "}");
                return;
            }

            if ("GET".equals(ex.getRequestMethod()) && path.equals("/api/dashboard/chart")) { send(ex, 200, monthlyJson(approved)); return; }

            if ("GET".equals(ex.getRequestMethod()) && path.equals("/api/laporan")) {
                send(ex, 200, "{\"summary\":{\"total\":" + approved.stream().mapToDouble(Transaksi::getNominal).sum() + ",\"count\":" + approved.size() + "},\"chartData\":" + monthlyJsonArray(approved) + "}");
                return;
            }

            error(ex, 404, "Dashboard endpoint tidak ditemukan");
        } catch (Exception e) {
            System.err.println("[DASHBOARD] " + e.getMessage());
            error(ex, 500, "Terjadi kesalahan server");
        }
    }

    private String monthlyJson(List<Transaksi> all) { return "{\"data\":" + monthlyJsonArray(all) + "}"; }

    private String monthlyJsonArray(List<Transaksi> all) {
        Map<String, Double> byMonth = new LinkedHashMap<>();
        for (Transaksi t : all) {
            LocalDate d = t.getCreatedAt().toLocalDate();
            String key = d.getYear() + "-" + String.format("%02d", d.getMonthValue());
            byMonth.put(key, byMonth.getOrDefault(key, 0.0) + t.getNominal());
        }
        StringBuilder sb = new StringBuilder("[");
        int i = 0;
        for (Map.Entry<String, Double> e : byMonth.entrySet()) {
            if (i++ > 0) sb.append(',');
            sb.append("{\"label\":").append(JsonUtil.quote(e.getKey())).append(",\"total\":").append(e.getValue()).append('}');
        }
        return sb.append(']').toString();
    }
}
