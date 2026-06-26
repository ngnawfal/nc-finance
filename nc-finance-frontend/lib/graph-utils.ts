// NC Finance Code Note: Helper transformasi data graph untuk visualisasi.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
import { GraphEdge } from "./types";

export function buildAdjacencyList(edges: GraphEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.nim)) adj.set(e.nim, []);
    if (!adj.has(e.kodeKursus)) adj.set(e.kodeKursus, []);
    adj.get(e.nim)!.push(e.kodeKursus);
    adj.get(e.kodeKursus)!.push(e.nim);
  }
  return adj;
}

export function bfs(start: string, adj: Map<string, string[]>): string[] {
  const visited: string[] = [];
  const queue: string[] = [start];
  const seen = new Set<string>([start]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    visited.push(current);
    for (const neighbor of adj.get(current) ?? []) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}
