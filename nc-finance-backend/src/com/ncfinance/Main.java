/*
 * NC Finance Code Note: Entry point aplikasi: load manager, menjalankan demo struktur data, lalu start API server.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.manager.GraphManager;
import com.ncfinance.manager.PencarianManager;
import com.ncfinance.manager.SiswaManager;
import com.ncfinance.manager.TransaksiManager;
import com.ncfinance.model.Transaksi;
import com.ncfinance.server.ApiServer;
import com.ncfinance.server.AppContext;
import com.ncfinance.server.SessionManager;
import com.ncfinance.util.HashUtil;

import java.time.LocalDate;
import java.util.List;

/** Entry point N.C Finance Backend. */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== N.C Finance Backend ===");

        if (!DatabaseConnection.testConnection()) {
            System.err.println("DB belum siap. Import db/schema.sql db/seed.sql MySQL lalu jalankan ulang.");
            System.err.println("Server tidak dijalankan agar error lebih jelas.");
            return;
        }

        AppContext.ensureSchemaUpgrades();
        SessionManager.cleanupExpired();

        TransaksiManager transaksiManager = AppContext.transaksiManager;
        SiswaManager siswaManager = AppContext.siswaManager;
        PencarianManager pencarianManager = AppContext.pencarianManager;
        GraphManager graphManager = AppContext.graphManager;

        siswaManager.loadFromDatabase();
        transaksiManager.loadFromDatabase();
        AppContext.pendaftaranManager.loadFromDatabase();
        siswaManager.indexTransaksi(transaksiManager.tampilSemua());
        pencarianManager.indexSemua(transaksiManager.tampilSemua());
        graphManager.loadFromDatabase();

        demoStrukturData(transaksiManager, siswaManager, pencarianManager, graphManager);

        ApiServer api = new ApiServer();
        api.start(8080);
    }

    private static void demoStrukturData(TransaksiManager tm, SiswaManager sm, PencarianManager pm, GraphManager gm) {
        System.out.println("\n=== Demo Struktur Data ===");
        System.out.println("ArrayList transaksi count: " + tm.jumlahTransaksi());
        System.out.println("HashMap siswa lookup NC-2026-001: " + sm.cari("NC-2026-001"));
        System.out.println("LinkedList histori NC-2026-002 count: " + sm.getHistori("NC-2026-002").size());
        System.out.println("Queue pending validation count: " + tm.jumlahAntrian());
        System.out.println("Stack undo available count: " + tm.jumlahUndoTersedia());
        System.out.println("TreeMap range Jan-Jun 2026 count: " + pm.cariByRentangTanggal(LocalDate.of(2026,1,1), LocalDate.of(2026,6,30)).size());
        System.out.println("Graph BFS NC-2026-002: " + gm.bfs("NC-2026-002"));
        System.out.println("Graph DFS NC-2026-002: " + gm.dfs("NC-2026-002"));
        System.out.println("SHA-256 admin123: " + HashUtil.hashSHA256("admin123"));
        List<Transaksi> sorted = pm.semuaTerurut();
        System.out.println("Comparable/Tree sorted first txn: " + (sorted.isEmpty() ? "-" : sorted.get(0).getId()));
        System.out.println("==========================\n");
    }
}
