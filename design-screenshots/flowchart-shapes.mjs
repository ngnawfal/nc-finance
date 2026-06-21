// Shape helpers — ISO 5807 / ANSI standard flowchart symbols.

const STROKE = "#111111";
const FILL = "#ffffff";
const FONT_BASE = "font-family='Calibri, Segoe UI, sans-serif' fill='#111111' text-anchor='middle' dominant-baseline='middle'";
const F14 = `${FONT_BASE} font-size='14'`;
const F12 = `${FONT_BASE} font-size='12'`;

function wrap(text, max) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function label(cx, cy, text, max = 22) {
  const lines = wrap(text, max);
  const lh = 16;
  const startY = cy - ((lines.length - 1) * lh) / 2;
  return lines.map((l, i) => `<text x="${cx}" y="${startY + i * lh}" ${F14}>${escapeXml(l)}</text>`).join("");
}

function escapeXml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
}

// Terminator: rounded rectangle (oval-ish)
export function terminator(cx, cy, text, w = 160, h = 48) {
  const x = cx - w / 2, y = cy - h / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" ry="${h / 2}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>${label(cx, cy, text, 24)}`;
}

// Process: rectangle
export function process(cx, cy, text, w = 200, h = 56) {
  const x = cx - w / 2, y = cy - h / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>${label(cx, cy, text, 30)}`;
}

// Decision: diamond (rhombus)
export function decision(cx, cy, text, w = 200, h = 110) {
  const points = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
  return `<polygon points="${points}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>${label(cx, cy, text, 22)}`;
}

// Input/Output: parallelogram (skewed rectangle)
export function io(cx, cy, text, w = 220, h = 56) {
  const skew = 18;
  const points = `${cx - w / 2 + skew},${cy - h / 2} ${cx + w / 2},${cy - h / 2} ${cx + w / 2 - skew},${cy + h / 2} ${cx - w / 2},${cy + h / 2}`;
  return `<polygon points="${points}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>${label(cx, cy, text, 30)}`;
}

// Document
export function document(cx, cy, text, w = 200, h = 64) {
  const x = cx - w / 2, y = cy - h / 2;
  const path = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h - 14} Q ${x + (w * 3) / 4} ${y + h + 10}, ${x + w / 2} ${y + h - 8} Q ${x + w / 4} ${y + h - 26}, ${x} ${y + h - 14} Z`;
  return `<path d="${path}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>${label(cx, cy - 4, text, 28)}`;
}

// Database (cylinder)
export function database(cx, cy, text, w = 140, h = 70) {
  const x = cx - w / 2, y = cy - h / 2;
  const ry = 10;
  const path = `M ${x} ${y + ry} Q ${x} ${y - ry}, ${x + w / 2} ${y - ry / 2} Q ${x + w} ${y - ry}, ${x + w} ${y + ry} L ${x + w} ${y + h - ry} Q ${x + w} ${y + h + ry / 2}, ${x + w / 2} ${y + h + ry / 2} Q ${x} ${y + h + ry / 2}, ${x} ${y + h - ry} Z`;
  const top = `<ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2}" ry="${ry}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>`;
  return `<path d="${path}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>${top}${label(cx, cy + ry, text, 18)}`;
}

// Connector (small circle)
export function connector(cx, cy, text = "") {
  return `<circle cx="${cx}" cy="${cy}" r="16" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>${text ? `<text x="${cx}" y="${cy}" ${F12} font-weight="600">${escapeXml(text)}</text>` : ""}`;
}

// Arrow line with arrowhead
export function arrow(x1, y1, x2, y2, text = "") {
  const mid = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${STROKE}" stroke-width="1.2" marker-end="url(#arrow)"/>`;
  if (!text) return mid;
  const lx = (x1 + x2) / 2;
  const ly = (y1 + y2) / 2;
  const padX = 6, padY = 4;
  const tw = String(text).length * 7 + padX * 2;
  const th = 18;
  return `${mid}<rect x="${lx - tw / 2}" y="${ly - th / 2}" width="${tw}" height="${th}" fill="#ffffff" stroke="none"/><text x="${lx}" y="${ly + 1}" ${F12}>${escapeXml(text)}</text>`;
}

export function arrowPath(points, text = "") {
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const line = `<path d="${d}" fill="none" stroke="${STROKE}" stroke-width="1.2" marker-end="url(#arrow)"/>`;
  if (!text) return line;
  const mid = points[Math.floor(points.length / 2)];
  const tw = String(text).length * 7 + 12;
  return `${line}<rect x="${mid[0] - tw / 2}" y="${mid[1] - 9}" width="${tw}" height="18" fill="#ffffff"/><text x="${mid[0]}" y="${mid[1] + 1}" ${F12}>${escapeXml(text)}</text>`;
}

export function svgWrap(width, height, title, body) {
  const totalHeight = height + 90;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" font-family="Calibri, Segoe UI, sans-serif">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="${STROKE}"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${width / 2}" y="40" text-anchor="middle" font-family="Cambria, Georgia, serif" font-size="22" fill="#111111">${escapeXml(title)}</text>
  <g transform="translate(0, 60)">
    ${body}
  </g>
</svg>`;
}
