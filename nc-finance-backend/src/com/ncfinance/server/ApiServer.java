/*
 * NC Finance Code Note: Registrasi route HTTP API Java.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.server;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

/** Plain Java HttpServer — no Spring Boot, no framework. */
public class ApiServer {
    private HttpServer server;

    public void start(int port) throws Exception {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/auth", new AuthHandler());
        server.createContext("/api/transaksi", new TransaksiHandler());
        server.createContext("/api/siswa", new SiswaHandler());
        server.createContext("/api/graph", new GraphHandler());
        server.createContext("/api/pendaftaran", new PendaftaranHandler());
        server.createContext("/api/dashboard", new DashboardHandler());
        server.createContext("/api/laporan", new DashboardHandler());
        server.createContext("/api/pengaturan", new PengaturanHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("N.C Finance API Server running at http://localhost:" + port);
    }

    public void stop() {
        if (server != null) server.stop(0);
    }
}
