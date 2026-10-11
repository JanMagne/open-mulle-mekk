// Felles grensesnitt-elementer: treskilt, piler, knapper, verktøytips.
import { shape, rect, rrect, stroke, txt, rrPts, INK, FONT, darken, lighten, circ, star } from '../engine/draw.js';

export function woodSign(g, x, y, w, h, label, o = {}) {
  const c = o.color || '#c58b4e';
  if (o.post) {
    rect(g, x + w / 2 - 5, y + h - 4, 10, o.post, { fill: '#8a5a2b', seed: 5 });
  }
  const pts = o.dir === 'right'
    ? [[x, y], [x + w - 16, y], [x + w + 4, y + h / 2], [x + w - 16, y + h], [x, y + h]]
    : o.dir === 'left'
      ? [[x + 16, y], [x + w, y], [x + w, y + h], [x + 16, y + h], [x - 4, y + h / 2]]
      : rrPts(x, y, w, h, 6);
  shape(g, pts, { fill: o.hot ? lighten(c, 0.2) : c, lw: 2.6, seed: o.seed || 9 });
  stroke(g, [[x + 8, y + h * 0.35], [x + w - 10, y + h * 0.38]], { lw: 1, ink: darken(c, 0.25), j: 0.6 });
  stroke(g, [[x + 8, y + h * 0.72], [x + w - 10, y + h * 0.7]], { lw: 1, ink: darken(c, 0.25), j: 0.6 });
  txt(g, label, x + w / 2 + (o.dir === 'right' ? -6 : o.dir === 'left' ? 6 : 0), y + h / 2 + 1, {
    size: o.size || 20, color: '#2b1a0e', maxW: w - 24,
  });
}

export function bigArrow(g, x, y, dir, hot, t = 0) {
  const s = dir === 'left' ? -1 : 1;
  const bob = Math.sin(t * 4) * 3 * s;
  const pts = [[-26, -12], [4, -12], [4, -26], [30, 0], [4, 26], [4, 12], [-26, 12]].map(([px, py]) => [x + (px + bob) * s, y + py]);
  shape(g, pts, { fill: hot ? '#ffe27a' : '#f2c94c', lw: 3, seed: 13 });
}

export function button(g, r, label, hot, o = {}) {
  const c = o.color || '#f2c94c';
  const press = hot ? -2 : 0;
  shape(g, rrPts(r.x + 3, r.y + 5, r.w, r.h, 12), { fill: 'rgba(40,20,0,0.35)', ink: null, shade: false, blot: false });
  shape(g, rrPts(r.x, r.y + press, r.w, r.h, 12), { fill: hot ? lighten(c, 0.25) : c, lw: 3, seed: o.seed || 17 });
  txt(g, label, r.x + r.w / 2, r.y + r.h / 2 + press + 1, { size: o.size || 26, color: INK, maxW: r.w - 16 });
}

export function tooltip(g, x, y, label) {
  g.save();
  g.font = `18px ${FONT}`;
  const w = g.measureText(label).width + 20;
  let tx = x + 16;
  let ty = y + 18;
  if (tx + w > 795) tx = x - w - 10;
  if (ty + 30 > 595) ty = y - 36;
  g.restore();
  shape(g, rrPts(tx, ty, w, 28, 8), { fill: '#fff6d8', lw: 2, seed: 19, shade: false, blot: false, j: 0.4 });
  txt(g, label, tx + w / 2, ty + 15, { size: 18 });
}

// Medalje til albumet/premier.
export function medal(g, x, y, r, color, icon, earned = true) {
  g.save();
  if (!earned) g.globalAlpha = 0.35;
  shape(g, [[x - r * 0.5, y - r * 1.9], [x - r * 0.1, y - r * 1.9], [x + r * 0.15, y - r * 0.6], [x - r * 0.4, y - r * 0.6]], { fill: '#2f5d9a', lw: 2, seed: 21 });
  shape(g, [[x + r * 0.5, y - r * 1.9], [x + r * 0.1, y - r * 1.9], [x - r * 0.15, y - r * 0.6], [x + r * 0.4, y - r * 0.6]], { fill: '#c8322b', lw: 2, seed: 22 });
  circ(g, x, y, r, { fill: earned ? color : '#bbb', lw: 2.6, seed: 23 });
  circ(g, x, y, r * 0.75, { fill: earned ? lighten(color, 0.25) : '#ccc', lw: 1.6, seed: 24 });
  if (earned) txt(g, icon, x, y + 2, { size: r * 0.95 });
  else txt(g, '?', x, y + 2, { size: r, color: '#666' });
  g.restore();
}

export function trophy(g, x, y, s = 1) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  rect(g, -26, 10, 52, 14, { fill: '#6b3d1e', seed: 31 });
  rect(g, -8, -10, 16, 22, { fill: '#e4b83a', seed: 32 });
  shape(g, [[-34, -70], [34, -70], [24, -24], [0, -12], [-24, -24]], { fill: '#f4c430', seed: 33 });
  stroke(g, [[-32, -62], [-48, -58], [-44, -38], [-26, -34]], { lw: 5, ink: '#d9a520', j: 0.3 });
  stroke(g, [[32, -62], [48, -58], [44, -38], [26, -34]], { lw: 5, ink: '#d9a520', j: 0.3 });
  shape(g, star(0, -46, 12, 5), { fill: '#fff6c0', lw: 1.6 });
  g.restore();
}

// Små ikoner for egenskapene på tavla i garasjen.
export function statIcon(g, kind, x, y) {
  switch (kind) {
    case 'fart':
      stroke(g, [[x - 8, y + 5], [x - 2, y - 6], [x + 1, y + 1], [x + 8, y - 8]], { lw: 2.4, ink: '#c8322b' });
      break;
    case 'kraft':
      shape(g, [[x - 8, y + 7], [x + 8, y + 7], [x + 8, y - 8]], { fill: '#7a9a5a', lw: 1.8 });
      break;
    case 'styrke':
      shape(g, [[x - 7, y - 8], [x + 7, y - 8], [x + 7, y + 1], [x, y + 8], [x - 7, y + 1]], { fill: '#8f989e', lw: 1.8 });
      break;
    case 'komfort':
      rrect(g, x - 8, y - 2, 16, 8, 3, { fill: '#c96a8c', lw: 1.6 });
      rrect(g, x - 8, y - 9, 5, 10, 2, { fill: '#c96a8c', lw: 1.6 });
      break;
    case 'grep':
      circ(g, x, y, 8, { fill: '#333', lw: 1.6 });
      circ(g, x, y, 3, { fill: '#aaa', lw: 1 });
      break;
    case 'tank':
      rrect(g, x - 6, y - 8, 12, 16, 2, { fill: '#c0392b', lw: 1.6 });
      break;
    default:
      break;
  }
}

export function inside(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
