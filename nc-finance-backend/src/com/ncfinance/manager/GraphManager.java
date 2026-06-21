package com.ncfinance.manager;

import com.ncfinance.database.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.Stack;

/**
 * STRUKTUR DATA 6 — GRAPH (Adjacency List)
 * Bipartite Graph: Siswa(NIM) ↔ Kursus(kode).
 * - addNode: O(1)
 * - addEdge: O(1)
 * - BFS/DFS: O(V + E)
 */
public class GraphManager {

    private final HashMap<String, List<String>> adjacencyList = new HashMap<>();

    public void clear() {
        adjacencyList.clear();
    }

    public void addNode(String node) {
        adjacencyList.putIfAbsent(node, new ArrayList<>());
    }

    public void addEdge(String node1, String node2) {
        addNode(node1);
        addNode(node2);
        if (!adjacencyList.get(node1).contains(node2)) adjacencyList.get(node1).add(node2);
        if (!adjacencyList.get(node2).contains(node1)) adjacencyList.get(node2).add(node1);
    }

    public List<String> getNeighbors(String node) {
        return new ArrayList<>(adjacencyList.getOrDefault(node, new ArrayList<>()));
    }

    public List<String> bfs(String start) {
        List<String> visited = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        Set<String> seen = new HashSet<>();
        queue.offer(start);
        seen.add(start);
        while (!queue.isEmpty()) {
            String current = queue.poll();
            visited.add(current);
            for (String neighbor : adjacencyList.getOrDefault(current, new ArrayList<>())) {
                if (!seen.contains(neighbor)) {
                    seen.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }
        return visited;
    }

    public List<String> dfs(String start) {
        List<String> visited = new ArrayList<>();
        Stack<String> stack = new Stack<>();
        Set<String> seen = new HashSet<>();
        stack.push(start);
        seen.add(start);
        while (!stack.isEmpty()) {
            String current = stack.pop();
            visited.add(current);
            for (String neighbor : adjacencyList.getOrDefault(current, new ArrayList<>())) {
                if (!seen.contains(neighbor)) {
                    seen.add(neighbor);
                    stack.push(neighbor);
                }
            }
        }
        return visited;
    }

    public List<String> findAllInSameKursus(String nim) {
        Set<String> result = new HashSet<>();
        for (String kursus : getNeighbors(nim)) {
            for (String siswa : getNeighbors(kursus)) {
                if (!siswa.equals(nim)) result.add(siswa);
            }
        }
        return new ArrayList<>(result);
    }

    public HashMap<String, List<String>> getAdjacencyList() {
        return adjacencyList;
    }

    public void loadFromDatabase() throws SQLException {
        clear();
        String sql = "SELECT s.nim, sk.kursus_kode FROM siswa_kursus sk JOIN siswa s ON s.id = sk.siswa_id";
        try (Connection c = DatabaseConnection.get();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) addEdge(rs.getString("nim"), rs.getString("kursus_kode"));
        }
        System.out.println("[GraphManager] Loaded graph nodes=" + adjacencyList.size());
    }
}
