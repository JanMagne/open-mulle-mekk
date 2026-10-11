// Malte bakgrunnselementer: himmel, åser, trær, hus, gjerder, skrothauger.
import { shape, rect, rrect, ell, circ, stroke, rand, darken, hatch, grain, INK, tube } from '../engine/draw.js';

export function sky(g, w, h, top = '#8fc6e8', bottom = '#e7f2ef') {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, top);
  gr.addColorStop(1, bottom);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

export function clouds(g, seed, n, y0, y1, w = 800) {
  const R = rand(seed);
  for (let i = 0; i < n; i++) {
    const x = R() * w, y = y0 + R() * (y1 - y0), s = 0.6 + R() * 0.8;
    g.save();
    g.globalAlpha = 0.85;
    for (let k = 0; k < 4; k++) {
      ell(g, x + (k - 1.5) * 26 * s, y - (k % 2) * 10 * s, 30 * s, 20 * s, { fill: '#ffffff', ink: 'rgba(120,150,170,0.5)', lw: 1.4, seed: seed + i * 7 + k, shade: false });
    }
    g.restore();
  }
}

export function hills(g, y, color, seed, amp = 40, w = 800, h = 600) {
  const R = rand(seed);
  const pts = [[-20, h + 10]];
  let x = -20;
  while (x < w + 40) {
    pts.push([x, y - R() * amp]);
    x += 60 + R() * 80;
  }
  pts.push([w + 20, h + 10]);
  shape(g, pts, { fill: color, lw: 2, seed, step: 30, j: 3 });
  hatch(g, 0, y - amp, w, h - y + amp, darken(color, 0.12), seed + 1, 220, 7, -1.2, 1.2, 0.4);
}

export function tree(g, x, y, s = 1, kind = 'leaf', seed = 1) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  if (kind === 'pine') {
    rect(g, -5, -16, 10, 18, { fill: '#6b4426', seed });
    for (let i = 0; i < 3; i++) {
      const yy = -16 - i * 26, ww = 40 - i * 9;
      shape(g, [[-ww, yy], [ww, yy], [0, yy - 46]], { fill: i % 2 ? '#2f6b3a' : '#2a6034', seed: seed + i, j: 1.6 });
    }
  } else {
    stroke(g, [[0, 0], [-2, -40]], { lw: 12, ink: '#5b3a22' });
    stroke(g, [[0, 0], [-2, -40]], { lw: 8, ink: '#7a4f2e' });
    const R = rand(seed);
    const c = ['#4f8f3a', '#5c9b40', '#467f33'][Math.floor(R() * 3)];
    for (let i = 0; i < 5; i++) {
      circ(g, -24 + R() * 48, -50 - R() * 50, 22 + R() * 14, { fill: c, seed: seed + i * 3, lw: 2 });
    }
  }
  g.restore();
}

export function house(g, x, y, w, h, o = {}) {
  const wall = o.wall || '#f3ede0';
  const roof = o.roof || '#b8452f';
  // vegg
  rect(g, x, y - h, w, h, { fill: wall, seed: o.seed || 31 });
  for (let i = 1; i < 8; i++) stroke(g, [[x + 3, y - h + (h * i) / 8], [x + w - 3, y - h + (h * i) / 8]], { lw: 1, ink: darken(wall, 0.15), j: 0.5 });
  // tak
  const over = 14;
  shape(g, [[x - over, y - h + 4], [x + w + over, y - h + 4], [x + w / 2, y - h - (o.roofH || h * 0.7)]], { fill: roof, seed: (o.seed || 31) + 1 });
  if (o.chimney) rect(g, x + w * 0.68, y - h - h * 0.6, 14, 28, { fill: '#9a4030' });
  // vinduer
  const nw = o.windows === undefined ? 2 : o.windows;
  for (let i = 0; i < nw; i++) {
    const wx = x + ((i + 1) * w) / (nw + 1) - 13;
    rect(g, wx, y - h * 0.72, 26, 26, { fill: '#bfe3f2', seed: (o.seed || 31) + 10 + i });
    stroke(g, [[wx + 13, y - h * 0.72], [wx + 13, y - h * 0.72 + 26]], { lw: 1.6 });
    stroke(g, [[wx, y - h * 0.72 + 13], [wx + 26, y - h * 0.72 + 13]], { lw: 1.6 });
  }
  if (o.door !== false) rect(g, x + w / 2 - 12, y - 42, 24, 42, { fill: o.door || '#6b8f4a', seed: (o.seed || 31) + 20 });
}

export function fence(g, x0, x1, y, seed = 1, color = '#f2eee4') {
  stroke(g, [[x0, y - 26], [x1, y - 26]], { lw: 4, ink: darken(color, 0.4) });
  stroke(g, [[x0, y - 12], [x1, y - 12]], { lw: 4, ink: darken(color, 0.4) });
  for (let x = x0; x <= x1; x += 18) shape(g, [[x - 5, y], [x - 5, y - 34], [x, y - 40], [x + 5, y - 34], [x + 5, y]], { fill: color, lw: 1.8, seed: seed + x });
}

export function ground(g, y, color, seed, w = 800, h = 600) {
  shape(g, [[-10, y], [w + 10, y - 4], [w + 10, h + 10], [-10, h + 10]], { fill: color, lw: 0, ink: null, seed, step: 40, j: 4 });
  grain(g, 0, y, w, h - y, seed + 3, 1800, 0.05);
}

// Skrothaug: rustne biter, dekk og planker i en haug.
export function junkMound(g, x, y, w, h, seed) {
  const R = rand(seed);
  const pts = [[x - w / 2, y]];
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    pts.push([x - w / 2 + t * w, y - Math.sin(t * Math.PI) * h * (0.8 + R() * 0.35)]);
  }
  pts.push([x + w / 2, y]);
  shape(g, pts, { fill: '#a0603a', seed, j: 3, step: 16 });
  for (let i = 0; i < 26; i++) {
    const t = 0.1 + R() * 0.8;
    const px = x - w / 2 + t * w;
    const py = y - Math.sin(t * Math.PI) * h * R() * 0.85 - 6;
    const k = R();
    if (k < 0.3) circ(g, px, py, 7 + R() * 9, { fill: '#2e2c30', lw: 1.8, seed: seed + i });
    else if (k < 0.55) rect(g, px - 14, py - 4, 22 + R() * 18, 7, { fill: ['#8f989e', '#7a4f2e', '#5b636a'][Math.floor(R() * 3)], lw: 1.6, seed: seed + i });
    else if (k < 0.75) shape(g, [[px - 10, py + 6], [px + 4, py - 10], [px + 14, py + 4]], { fill: ['#c56a2f', '#b8452f', '#d0a640'][Math.floor(R() * 3)], lw: 1.6, seed: seed + i });
    else tube(g, [[px - 16, py], [px + 16, py - 6 + R() * 12]], 3, '#8f989e', { seed: seed + i });
  }
}

export function sign(g, x, y, w, h, text, o = {}) {
  rect(g, x + w / 2 - 4, y + h - 2, 8, o.post || 40, { fill: '#7a4f2e' });
  rrect(g, x, y, w, h, 5, { fill: o.color || '#fff6e0', lw: 2.4 });
  g.save();
  g.font = `${o.size || 18}px "Patrick Hand", cursive`;
  g.fillStyle = o.ink || INK;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, x + w / 2, y + h / 2 + 1, w - 10);
  g.restore();
}

export function flowers(g, x0, x1, y0, y1, seed, n = 30) {
  const R = rand(seed);
  const cols = ['#f4c430', '#e0477a', '#ffffff', '#7a5ae0', '#ff7a3a'];
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
    stroke(g, [[x, y], [x, y - 8]], { lw: 1.2, ink: '#3f7a30', j: 0.2 });
    circ(g, x, y - 10, 3, { fill: cols[Math.floor(R() * cols.length)], lw: 1, shade: false, blot: false });
  }
}

