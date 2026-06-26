"use client";
// NC Finance Code Note: Halaman fitur aplikasi sesuai folder route.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
import { useEffect, useMemo, useState } from "react";
import { GraphNode } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { MagnifyingGlass, ArrowsCounterClockwise, GraduationCap, BookOpen, ArrowRight } from "@phosphor-icons/react";
import { getGraph } from "@/lib/api";

type Edge = { nim: string; kodeKursus: string };

const ROW_H = 56;
const COL_W = 320;
const GAP = 240;
const PAD_TOP = 32;
const PAD_X = 24;

export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => { getGraph().then(g => { setNodes(g.nodes); setEdges(g.edges); }); }, []);

  const peserta = useMemo(() => nodes.filter(n => n.type === "siswa"), [nodes]);
  const kursus = useMemo(() => nodes.filter(n => n.type === "kursus"), [nodes]);
  const qLower = q.trim().toLowerCase();

  const matchedPesertaIds = useMemo(() => {
    if (!qLower) return new Set<string>();
    return new Set(peserta.filter(p => p.label.toLowerCase().includes(qLower) || p.id.toLowerCase().includes(qLower)).map(p => p.id));
  }, [qLower, peserta]);

  const matchedKursusIds = useMemo(() => {
    if (!qLower) return new Set<string>();
    return new Set(kursus.filter(k => k.label.toLowerCase().includes(qLower) || k.id.toLowerCase().includes(qLower)).map(k => k.id));
  }, [qLower, kursus]);

  const filteredEdges = useMemo(() => {
    if (!qLower) return edges;
    return edges.filter(e => matchedPesertaIds.has(e.nim) || matchedKursusIds.has(e.kodeKursus));
  }, [qLower, edges, matchedPesertaIds, matchedKursusIds]);

  const visiblePeserta = useMemo(() => {
    if (!qLower) return peserta;
    const connected = new Set(filteredEdges.map(e => e.nim));
    return peserta.filter(p => matchedPesertaIds.has(p.id) || connected.has(p.id));
  }, [qLower, peserta, matchedPesertaIds, filteredEdges]);

  const visibleKursus = useMemo(() => {
    if (!qLower) return kursus;
    const connected = new Set(filteredEdges.map(e => e.kodeKursus));
    return kursus.filter(k => matchedKursusIds.has(k.id) || connected.has(k.id));
  }, [qLower, kursus, matchedKursusIds, filteredEdges]);

  // group peserta by kursus → so they cluster near their kursus row
  const sortedPeserta = useMemo(() => {
    const kursusOrder = new Map(visibleKursus.map((k, i) => [k.id, i]));
    return [...visiblePeserta].sort((a, b) => {
      const aK = filteredEdges.find(e => e.nim === a.id)?.kodeKursus ?? "";
      const bK = filteredEdges.find(e => e.nim === b.id)?.kodeKursus ?? "";
      return (kursusOrder.get(aK) ?? 99) - (kursusOrder.get(bK) ?? 99);
    });
  }, [visiblePeserta, filteredEdges, visibleKursus]);

  const pesertaPos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    sortedPeserta.forEach((p, i) => { m.set(p.id, { x: PAD_X, y: PAD_TOP + i * ROW_H }); });
    return m;
  }, [sortedPeserta]);

  const kursusPos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    // center kursus vertically along the peserta column
    const totalH = Math.max(sortedPeserta.length * ROW_H, visibleKursus.length * ROW_H * 1.5);
    const kStep = visibleKursus.length > 0 ? totalH / (visibleKursus.length + 1) : ROW_H;
    visibleKursus.forEach((k, i) => { m.set(k.id, { x: PAD_X + COL_W + GAP, y: PAD_TOP + (i + 1) * kStep }); });
    return m;
  }, [visibleKursus, sortedPeserta]);

  const svgH = Math.max(sortedPeserta.length * ROW_H + PAD_TOP * 2, visibleKursus.length * ROW_H * 1.5 + PAD_TOP * 2, 400);
  const svgW = PAD_X * 2 + COL_W * 2 + GAP;

  const activeId = selected ?? hover;
  const isHighlighted = (id: string) => {
    if (!activeId) return false;
    if (id === activeId) return true;
    return edges.some(e => (e.nim === activeId && e.kodeKursus === id) || (e.kodeKursus === activeId && e.nim === id));
  };
  const isDimmed = (id: string) => activeId !== null && !isHighlighted(id);

  function reset() { setSelected(null); setHover(null); setQ(""); }

  const kursusStats = useMemo(() => {
    return visibleKursus.map(k => ({ ...k, count: edges.filter(e => e.kodeKursus === k.id).length }));
  }, [visibleKursus, edges]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <FadeIn>
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Cari peserta / pelatihan…"
              className="pl-9 pr-4 py-2 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f8] focus:outline-none focus:border-[#111111] w-64"
            />
          </div>
          {(selected || q) && (
            <Button variant="outline" size="sm" onClick={reset}><ArrowsCounterClockwise size={13} /> Reset</Button>
          )}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <FadeIn>
          <Card padding="sm" className="overflow-hidden">
            {/* column headers */}
            <div className="grid grid-cols-2 px-6 py-3 border-b border-[#eaeaea] bg-[#f9f9f8]">
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-[#787774]" />
                <span className="text-xs text-[#787774] uppercase tracking-widest font-medium">Peserta</span>
                <span className="text-xs text-[#787774]">({peserta.length})</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-[#787774]">({kursus.length})</span>
                <span className="text-xs text-[#787774] uppercase tracking-widest font-medium">Pelatihan</span>
                <BookOpen size={14} className="text-[#787774]" />
              </div>
            </div>

            <div className="overflow-auto bg-white" style={{ maxHeight: 640 }}>
              {peserta.length === 0 && kursus.length === 0 ? (
                <div className="h-80 flex flex-col items-center justify-center text-sm text-[#787774] gap-2">
                  <p>Belum ada data relasi.</p>
                  <p className="text-xs">Tambahkan peserta dan pelatihan terlebih dulu.</p>
                </div>
              ) : (
                <svg width={svgW} height={svgH} className="block" style={{ minWidth: svgW }}>
                  <defs>
                    <linearGradient id="edge-active" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1f6c9f" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#d4b46a" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* edges */}
                  {filteredEdges.map((e, i) => {
                    const a = pesertaPos.get(e.nim);
                    const b = kursusPos.get(e.kodeKursus);
                    if (!a || !b) return null;
                    const x1 = a.x + COL_W;
                    const y1 = a.y + ROW_H / 2;
                    const x2 = b.x;
                    const y2 = b.y + ROW_H / 2;
                    const cx = (x1 + x2) / 2;
                    const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
                    const active = activeId && (e.nim === activeId || e.kodeKursus === activeId);
                    const dimmed = activeId && !active;
                    return (
                      <path
                        key={`${e.nim}-${e.kodeKursus}-${i}`}
                        d={path}
                        fill="none"
                        stroke={active ? "url(#edge-active)" : "#cdd1d6"}
                        strokeWidth={active ? 2 : 1}
                        strokeOpacity={dimmed ? 0.08 : active ? 1 : 0.55}
                        style={{ transition: "stroke-opacity 200ms, stroke-width 200ms" }}
                      />
                    );
                  })}

                  {/* peserta nodes */}
                  {sortedPeserta.map(p => {
                    const pos = pesertaPos.get(p.id);
                    if (!pos) return null;
                    const dim = isDimmed(p.id);
                    const hi = isHighlighted(p.id);
                    return (
                      <g
                        key={p.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onMouseEnter={() => setHover(p.id)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => setSelected(selected === p.id ? null : p.id)}
                        style={{ cursor: "pointer", opacity: dim ? 0.25 : 1, transition: "opacity 200ms" }}
                      >
                        <rect
                          width={COL_W}
                          height={ROW_H - 8}
                          rx={10}
                          fill={hi ? "#edf3ec" : "#f9f9f8"}
                          stroke={hi ? "#346538" : "#eaeaea"}
                          strokeWidth={hi ? 1.5 : 1}
                          style={{ transition: "all 200ms" }}
                        />
                        <circle cx={20} cy={(ROW_H - 8) / 2} r={12} fill="#ffffff" stroke="#eaeaea" />
                        <text x={20} y={(ROW_H - 8) / 2} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600} fill="#346538" fontFamily="ui-sans-serif, system-ui">
                          {p.label.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                        </text>
                        <text x={44} y={(ROW_H - 8) / 2 - 6} fontSize={13} fontWeight={500} fill="#111111" fontFamily="ui-sans-serif, system-ui">
                          {p.label.length > 24 ? p.label.slice(0, 24) + "…" : p.label}
                        </text>
                        <text x={44} y={(ROW_H - 8) / 2 + 10} fontSize={11} fill="#787774" fontFamily="ui-monospace, monospace">
                          {p.id}
                        </text>
                      </g>
                    );
                  })}

                  {/* kursus nodes */}
                  {kursus.map(k => {
                    const pos = kursusPos.get(k.id);
                    if (!pos) return null;
                    const dim = isDimmed(k.id);
                    const hi = isHighlighted(k.id);
                    const count = edges.filter(e => e.kodeKursus === k.id).length;
                    return (
                      <g
                        key={k.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onMouseEnter={() => setHover(k.id)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => setSelected(selected === k.id ? null : k.id)}
                        style={{ cursor: "pointer", opacity: dim ? 0.25 : 1, transition: "opacity 200ms" }}
                      >
                        <rect
                          width={COL_W}
                          height={ROW_H - 8}
                          rx={10}
                          fill={hi ? "#fbf3db" : "#111111"}
                          stroke={hi ? "#d4b46a" : "#111111"}
                          strokeWidth={hi ? 1.5 : 1}
                          style={{ transition: "all 200ms" }}
                        />
                        <text x={16} y={(ROW_H - 8) / 2 - 6} fontSize={13} fontWeight={600} fill={hi ? "#956400" : "#ffffff"} fontFamily="ui-sans-serif, system-ui" style={{ transition: "fill 200ms" }}>
                          {k.label.length > 26 ? k.label.slice(0, 26) + "…" : k.label}
                        </text>
                        <text x={16} y={(ROW_H - 8) / 2 + 10} fontSize={10} fill={hi ? "#956400" : "#cdd1d6"} fontFamily="ui-monospace, monospace" style={{ transition: "fill 200ms" }}>
                          {k.id} · {count} peserta
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={60}>
          <aside className="space-y-4 lg:sticky lg:top-20">
            <Card padding="md">
              <p className="text-xs text-[#787774] uppercase tracking-widest mb-3">Legend</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-[#f9f9f8] border border-[#eaeaea] shrink-0" />
                  <span className="text-[#111111]">Peserta</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-[#111111] shrink-0" />
                  <span className="text-[#111111]">Pelatihan</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-8 h-px bg-gradient-to-r from-[#1f6c9f] to-[#d4b46a] shrink-0" />
                  <span className="text-xs text-[#787774]">Relasi aktif</span>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <p className="text-xs text-[#787774] uppercase tracking-widest mb-3">Distribusi Pelatihan</p>
              {kursusStats.length === 0 ? (
                <p className="text-xs text-[#787774]">Belum ada pelatihan</p>
              ) : (
                <div className="space-y-2">
                  {kursusStats.map(k => {
                    const max = Math.max(...kursusStats.map(x => x.count), 1);
                    const pct = (k.count / max) * 100;
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setSelected(selected === k.id ? null : k.id)}
                        onMouseEnter={() => setHover(k.id)}
                        onMouseLeave={() => setHover(null)}
                        className={`w-full text-left p-2.5 rounded-lg transition-colors ${selected === k.id ? "bg-[#fbf3db]" : "hover:bg-[#f7f6f3]"}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#111111] truncate" title={k.label}>{k.label}</p>
                            <p className="text-[10px] font-mono text-[#787774] truncate mt-0.5">{k.id}</p>
                          </div>
                          <span className="text-xs font-mono text-[#787774] shrink-0 px-1.5 py-0.5 bg-white border border-[#eaeaea] rounded">{k.count}</span>
                        </div>
                        <div className="h-1 bg-[#eaeaea] rounded-full overflow-hidden">
                          <div className="h-full bg-[#111111] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {selected && (
              <Card padding="md">
                <p className="text-xs text-[#787774] uppercase tracking-widest mb-2">Node Dipilih</p>
                {(() => {
                  const n = nodes.find(x => x.id === selected);
                  if (!n) return null;
                  const relasi = n.type === "siswa"
                    ? edges.filter(e => e.nim === n.id).map(e => kursus.find(k => k.id === e.kodeKursus)).filter(Boolean)
                    : edges.filter(e => e.kodeKursus === n.id).map(e => peserta.find(p => p.id === e.nim)).filter(Boolean);
                  return (
                    <>
                      <p className="font-medium text-sm text-[#111111]">{n.label}</p>
                      <p className="font-mono text-xs text-[#787774] mt-0.5">{n.id}</p>
                      <p className="text-xs text-[#787774] mt-1 capitalize">{n.type === "siswa" ? "Peserta" : "Pelatihan"}</p>
                      <div className="mt-3 pt-3 border-t border-[#eaeaea]">
                        <p className="text-xs text-[#787774] mb-2 flex items-center gap-1.5">
                          <ArrowRight size={11} /> {relasi.length} relasi
                        </p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {relasi.map(r => r && (
                            <p key={r.id} className="text-xs text-[#111111] truncate">{r.label}</p>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </Card>
            )}
          </aside>
        </FadeIn>
      </div>
    </div>
  );
}
