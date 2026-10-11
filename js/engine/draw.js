// Tegnehjelpere: «håndtegnede» former med skjelvende blekkstrek og akvarell-aktig fyll.

export const INK = '#2b1e16';

// Q.fast = true mens hvert bilde tegnes: dropper de tyngste akvarelleffektene.
// Forhåndstegnede lag (layer/sprites) tegnes alltid i full kvalitet.
export const Q = { fast: false };

export function hq(fn) {
  const prev = Q.fast;
  Q.fast = false;
  try {
    return fn();
  } finally {
    Q.fast = prev;
  }
}
export const FONT = '"Patrick Hand", "Comic Sans MS", "Chalkboard SE", cursive';

// ---------- tilfeldighet med frø (stabil tegning fra gang til gang) ----------
export function rand(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------- farger ----------
function rgb(c) {
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a, b, t) {
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
export const lighten = (c, t) => mix(c, '#ffffff', t);
export const darken = (c, t) => mix(c, '#000000', t);
export function rgba(c, a) {
  const [r, g, b] = rgb(c);
  return `rgba(${r},${g},${b},${a})`;
}

// ---------- lerreter ----------
export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

// Lag et forhåndstegnet lag i høyere oppløsning (res) for skarp skalering.
export function layer(w, h, res, fn) {
  const c = makeCanvas(w * res, h * res);
  const g = c.getContext('2d');
  g.scale(res, res);
  hq(() => fn(g));
  return c;
}

// ---------- geometri ----------
export function rectPts(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

export function ellPts(cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 0) {
  const span = a1 - a0;
  const full = Math.abs(span) >= Math.PI * 2 - 1e-6;
  n = n || Math.max(8, Math.round((Math.abs(span) * Math.max(rx, ry)) / 6));
  const pts = [];
  const last = full ? n - 1 : n;
  for (let i = 0; i <= last; i++) {
    const a = a0 + (span * i) / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

export function rrPts(x, y, w, h, r) {
  r = Math.max(0.1, Math.min(r, w / 2, h / 2));
  const P = Math.PI;
  return [
    ...ellPts(x + w - r, y + r, r, r, -P / 2, 0, 4),
    ...ellPts(x + w - r, y + h - r, r, r, 0, P / 2, 4),
    ...ellPts(x + r, y + h - r, r, r, P / 2, P, 4),
    ...ellPts(x + r, y + r, r, r, P, P * 1.5, 4),
  ];
}

export function rot(pts, a, cx = 0, cy = 0) {
  const c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
}

export function move(pts, dx, dy) {
  return pts.map(([x, y]) => [x + dx, y + dy]);
}

export function bounds(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

// Del opp kantene og skyv punktene litt sidelengs – gir en levende strek.
export function wobble(pts, closed, seed, j, step) {
  const R = rand(seed);
  const out = [];
  const N = pts.length;
  const segs = closed ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % N];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.max(1, Math.round(len / step));
    const nx = -dy / len, ny = dx / len;
    for (let s = 0; s < k; s++) {
      const t = s / k;
      const jit = (R() - 0.5) * 2 * j;
      out.push([a[0] + dx * t + nx * jit, a[1] + dy * t + ny * jit]);
    }
  }
  if (!closed) out.push(pts[N - 1]);
  return out;
}

export function smoothPath(pts, closed) {
  const p = new Path2D();
  const n = pts.length;
  if (n < 3) {
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n; i++) p.lineTo(pts[i][0], pts[i][1]);
    if (closed) p.closePath();
    return p;
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) {
    const m0 = mid(pts[n - 1], pts[0]);
    p.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const m = mid(pts[i], pts[(i + 1) % n]);
      p.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
    }
    p.closePath();
  } else {
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const m = mid(pts[i], pts[i + 1]);
      p.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
    }
    p.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
  return p;
}

// Hovedfunksjonen: fyll + akvarellflekker + skygge + blekkstrek.
export function shape(g, pts, o = {}) {
  const closed = o.closed !== false;
  const fill = o.fill === undefined ? null : o.fill;
  const ink = o.ink === undefined ? INK : o.ink;
  const lw = o.lw === undefined ? 2.4 : o.lw;
  const [x0, y0, x1, y1] = bounds(pts);
  const size = Math.min(x1 - x0, y1 - y0) || 1;
  const j = Math.min(o.j === undefined ? 0.9 : o.j, Math.max(0.15, size * 0.05));
  const seed = o.seed === undefined ? Math.floor(pts[0][0] * 13.7 + pts[0][1] * 7.3 + pts.length * 31) : o.seed;
  const w = wobble(pts, closed, seed, j, o.step || 10);
  const path = smoothPath(w, closed);

  if (fill && closed) {
    g.save();
    if (o.alpha !== undefined) g.globalAlpha = o.alpha;
    g.fillStyle = fill;
    g.fill(path);
    const shade = o.shade !== false;
    const blot = o.blot !== false && !Q.fast;
    if (shade || blot) {
      g.clip(path);
      if (blot) {
        const R = rand(seed * 31 + 5);
        const area = (x1 - x0) * (y1 - y0);
        const n = area > 6000 ? 6 : area > 800 ? 4 : 2;
        for (let i = 0; i < n; i++) {
          const cx = x0 + R() * (x1 - x0);
          const cy = y0 + R() * (y1 - y0);
          const r = (0.25 + R() * 0.45) * Math.max(x1 - x0, y1 - y0);
          const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
          gr.addColorStop(0, R() < 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(60,30,10,0.10)');
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = gr;
          g.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
      }
      if (shade) {
        const gr = g.createLinearGradient(0, y0, 0, y1);
        gr.addColorStop(0, 'rgba(255,255,255,0.22)');
        gr.addColorStop(0.45, 'rgba(255,255,255,0)');
        gr.addColorStop(1, 'rgba(40,20,10,0.24)');
        g.fillStyle = gr;
        g.fillRect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2);
      }
    }
    g.restore();
  }
  if (ink && lw > 0) {
    g.save();
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = ink;
    g.lineWidth = lw;
    g.stroke(path);
    g.restore();
  }
  return path;
}

export function ell(g, cx, cy, rx, ry, o = {}) {
  return shape(g, ellPts(cx, cy, rx, ry), { step: 8, ...o });
}
export function circ(g, cx, cy, r, o = {}) {
  return ell(g, cx, cy, r, r, o);
}
export function rect(g, x, y, w, h, o = {}) {
  return shape(g, rectPts(x, y, w, h), o);
}
export function rrect(g, x, y, w, h, r, o = {}) {
  return shape(g, rrPts(x, y, w, h, r), o);
}
export function stroke(g, pts, o = {}) {
  return shape(g, pts, { ...o, closed: false, fill: null });
}

// Tykk «tube»-strek: mørk kant + farget kjerne (rør, stenger, eksos).
export function tube(g, pts, w, color, o = {}) {
  stroke(g, pts, { lw: w + 3, ink: o.edge || INK, j: o.j === undefined ? 0.4 : o.j, seed: o.seed });
  stroke(g, pts, { lw: w, ink: color, j: o.j === undefined ? 0.4 : o.j, seed: o.seed });
  if (o.shine !== false) {
    stroke(g, pts.map(([x, y]) => [x - w * 0.15, y - w * 0.2]), {
      lw: Math.max(1, w * 0.25), ink: 'rgba(255,255,255,0.45)', j: 0.2, seed: o.seed,
    });
  }
}

// ---------- tekst ----------
export function txt(g, s, x, y, o = {}) {
  const size = o.size || 22;
  g.save();
  g.font = `${o.bold ? 'bold ' : ''}${size}px ${FONT}`;
  g.textAlign = o.align || 'center';
  g.textBaseline = o.base || 'middle';
  if (o.outline) {
    g.lineJoin = 'round';
    g.strokeStyle = o.outline;
    g.lineWidth = o.olw || 4;
    g.strokeText(s, x, y, o.maxW);
  }
  g.fillStyle = o.color || INK;
  g.fillText(s, x, y, o.maxW);
  g.restore();
}

export function wrapText(g, s, maxW, size) {
  g.save();
  g.font = `${size}px ${FONT}`;
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (g.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  const width = Math.max(...lines.map((l) => g.measureText(l).width));
  g.restore();
  return { lines, width };
}

// ---------- teksturer ----------
export function grain(g, x, y, w, h, seed, n = 1500, alpha = 0.05) {
  const R = rand(seed);
  for (let i = 0; i < n; i++) {
    g.fillStyle = R() < 0.5 ? `rgba(40,20,0,${alpha})` : `rgba(255,255,255,${alpha})`;
    const s = 1 + R() * 2.5;
    g.fillRect(x + R() * w, y + R() * h, s, s);
  }
}

// Penselstrøk (gress, åkre, treverk).
export function hatch(g, x, y, w, h, color, seed, n, len, angle = -Math.PI / 2, lw = 1.5, spread = 0.5) {
  const R = rand(seed);
  g.save();
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const px = x + R() * w, py = y + R() * h;
    const a = angle + (R() - 0.5) * spread;
    const l = len * (0.5 + R() * 0.7);
    g.moveTo(px, py);
    g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l);
  }
  g.stroke();
  g.restore();
}

export function star(cx, cy, r1, r2, n = 5, a0 = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = a0 + (i * Math.PI) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

export function inRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
