package com.ncfinance.server;

import com.ncfinance.model.User;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;

/** /api/graph Graph adjacency list BFS DFS. */
public class GraphHandler extends BaseHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        User user = requireAuth(ex);
        if (user == null) return;
        try {
            String path = ex.getRequestURI().getPath();
            if ("GET".equals(ex.getRequestMethod()) && path.equals("/api/graph/siswa-kursus")) {
                AppContext.graphManager.loadFromDatabase();
                send(ex, 200, JsonUtil.graph(AppContext.graphManager.getAdjacencyList()));
                return;
            }
            if ("GET".equals(ex.getRequestMethod()) && path.startsWith("/api/graph/bfs/")) {
                String start = path.substring("/api/graph/bfs/".length());
                send(ex, 200, "{\"visited\":" + JsonUtil.stringList(AppContext.graphManager.bfs(start)) + "}");
                return;
            }
            if ("GET".equals(ex.getRequestMethod()) && path.startsWith("/api/graph/dfs/")) {
                String start = path.substring("/api/graph/dfs/".length());
                send(ex, 200, "{\"visited\":" + JsonUtil.stringList(AppContext.graphManager.dfs(start)) + "}");
                return;
            }
            if ("GET".equals(ex.getRequestMethod()) && path.startsWith("/api/graph/rekan-sekursus/")) {
                String nim = path.substring("/api/graph/rekan-sekursus/".length());
                send(ex, 200, "{\"siswaList\":" + JsonUtil.stringList(AppContext.graphManager.findAllInSameKursus(nim)) + "}");
                return;
            }
            error(ex, 404, "Graph endpoint tidak ditemukan");
        } catch (Exception e) {
            System.err.println("[GRAPH] " + e.getMessage());
            error(ex, 500, "Terjadi kesalahan server");
        }
    }
}
