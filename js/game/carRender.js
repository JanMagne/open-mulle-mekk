// Tegning av deler (forhåndstegnet til «sprites») og hele bilen.
import { PARTS, CHASSIS } from '../data/parts.js';
import { hq, makeCanvas, rect, shape, rrPts, ellPts, circ, darken, lighten } from '../engine/draw.js';
import { slotDefs, carParts } from './car.js';

const SPR = 2.5;
const PAD = 6;
const cache = new Map();

export function sprite(key) {
  let sp = cache.get(key);
  if (sp) return sp;
  const def = key === 'chassi' ? CHASSIS : PARTS[key];
  const [x0, y0, x1, y1] = def.bbox;
  const w = x1 - x0 + PAD * 2;
  const h = y1 - y0 + PAD * 2;
  const c = makeCanvas(w * SPR, h * SPR);
  const g = c.getContext('2d');
  g.scale(SPR, SPR);
  g.translate(PAD - x0, PAD - y0);
  hq(() => def.draw(g));
  // alfamaske for presis klikking
  const mw = Math.ceil(w), mh = Math.ceil(h);
  const small = makeCanvas(mw, mh);
  const sg = small.getContext('2d');
  sg.drawImage(c, 0, 0, mw, mh);
  const data = sg.getImageData(0, 0, mw, mh).data;
  const mask = new Uint8Array(mw * mh);
  for (let i = 0; i < mw * mh; i++) mask[i] = data[i * 4 + 3] > 40 ? 1 : 0;
  sp = { c, ox: x0 - PAD, oy: y0 - PAD, w, h, mask, mw, mh };
  cache.set(key, sp);
  return sp;
}

export function drawPart(g, key, x, y, s = 1, angle = 0, alpha = 1) {
  const sp = sprite(key);
  g.save();
  if (alpha !== 1) g.globalAlpha *= alpha;
  g.translate(x, y);
  if (angle) g.rotate(angle);
  g.scale(s, s);
  g.drawImage(sp.c, sp.ox, sp.oy, sp.w, sp.h);
  g.restore();
}

// Treffer punktet (px,py) en synlig piksel i delen?
export function hitPart(key, x, y, s, px, py) {
  const sp = sprite(key);
  const lx = Math.floor((px - x) / s - sp.ox);
  const ly = Math.floor((py - y) / s - sp.oy);
  if (lx < 0 || ly < 0 || lx >= sp.mw || ly >= sp.mh) return false;
  // litt romslig: sjekk et lite område rundt punktet
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const xx = lx + dx, yy = ly + dy;
      if (xx >= 0 && yy >= 0 && xx < sp.mw && yy < sp.mh && sp.mask[yy * sp.mw + xx]) return true;
    }
  }
  return false;
}

export function partShadow(g, key, x, y, s = 1) {
  const def = PARTS[key];
  const [x0, , x1, y1] = def.bbox;
  g.save();
  g.fillStyle = 'rgba(40,25,10,0.18)';
  g.beginPath();
  g.ellipse(x + ((x0 + x1) / 2) * s, y + y1 * s + 2, ((x1 - x0) / 2) * s * 0.9, 6 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function rideHeight(cp) {
  const rs = ['forhjul', 'bakhjul'].map((s) => (cp[s] ? cp[s].def.r : 0));
  const r = Math.max(...rs);
  return r ? 18 + r : 46;
}

// Liste over monterte deler med posisjon og lag (z), sortert for tegning.
export function carLayout() {
  const cp = carParts();
  const slots = slotDefs();
  const items = [];
  for (const [slot, { part, def }] of Object.entries(cp)) {
    const sd = slots[slot];
    if (!sd) continue;
    items.push({ slot, part, def, key: def.key, x: sd.x, y: sd.y, z: sd.z });
  }
  items.sort((a, b) => a.z - b.z);
  return { items, cp, slots };
}

// Tegn bilen. groundY = bakkens høyde. Returnerer info til treff-testing.
export function drawCar(g, cx, groundY, s = 1, o = {}) {
  const { items, cp, slots } = carLayout();
  const rh = rideHeight(cp);
  const oy = groundY - rh * s + (o.bounce || 0);
  // skygge
  g.save();
  g.fillStyle = 'rgba(40,25,10,0.22)';
  g.beginPath();
  g.ellipse(cx, groundY + 2, 175 * s, 9 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  // klosser under akslingene når hjul mangler
  for (const w of ['forhjul', 'bakhjul']) {
    if (!cp[w]) {
      const sx = cx + slots[w].x * s;
      const top = oy + 8 * s;
      g.save();
      g.translate(sx, top);
      g.scale(s, s);
      rect(g, -16, 0, 32, (groundY - top) / s, { fill: '#a46d3a', seed: 77 + slots[w].x, lw: 2 });
      g.restore();
    }
  }
  g.save();
  g.translate(cx, oy);
  g.scale(s, s);
  const sp = sprite('chassi');
  g.drawImage(sp.c, sp.ox, sp.oy, sp.w, sp.h);
  for (const it of items) {
    if (o.hide && o.hide === it.part.id) continue;
    const ang = it.slot === 'forhjul' || it.slot === 'bakhjul' ? (o.wheelRot || 0) : 0;
    drawPart(g, it.key, it.x, it.y, 1, ang);
  }
  // markér ledige festepunkter under dra-og-slipp
  if (o.showSlots) {
    for (const [name, sd] of Object.entries(slots)) {
      if (sd.accepts !== o.showSlots) continue;
      const hot = o.hotSlot === name;
      const pulse = 0.5 + 0.5 * Math.sin((o.t || 0) * 6);
      g.save();
      g.strokeStyle = hot ? 'rgba(255,240,120,0.95)' : `rgba(255,255,255,${0.35 + pulse * 0.4})`;
      g.lineWidth = hot ? 5 : 3;
      g.setLineDash(hot ? [] : [6, 5]);
      g.beginPath();
      g.arc(sd.x, sd.y, hot ? 26 : 20, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }
  }
  g.restore();
  return { cx, oy, s, items, slots };
}

export function carHit(info, px, py) {
  for (let i = info.items.length - 1; i >= 0; i--) {
    const it = info.items[i];
    const x = info.cx + it.x * info.s;
    const y = info.oy + it.y * info.s;
    if (hitPart(it.key, x, y, info.s, px, py)) return it;
  }
  return null;
}

// ---------- bilen sett ovenfra (kartet) ----------
export function makeTopCar(st) {
  return hq(() => makeTopCarHQ(st));
}

function makeTopCarHQ(st) {
  const L = 54, Wd = 28;
  const c = makeCanvas((L + 16) * 2, (Wd + 20) * 2);
  const g = c.getContext('2d');
  g.scale(2, 2);
  g.translate((L + 16) / 2, (Wd + 20) / 2);
  const col = st.bodyColor || '#6d757b';
  const wheelLook = (k) => (k === 'hjul_traktor' ? [16, 9] : k === 'hjul_sykkel' ? [12, 3] : [12, 6]);
  const [fw, fh] = wheelLook(st.wheelKeys[0]);
  const [bw, bh] = wheelLook(st.wheelKeys[1] || st.wheelKeys[0]);
  for (const [x, y, w, h] of [[16, -Wd / 2 - 1, fw, fh], [16, Wd / 2 + 1, fw, fh], [-17, -Wd / 2 - 1, bw, bh], [-17, Wd / 2 + 1, bw, bh]]) {
    shape(g, rrPts(x - w / 2, y - h / 2, w, h, 2), { fill: '#222', lw: 1.4, shade: false, blot: false, j: 0.2 });
  }
  if (st.bodyKey === 'kar_pickup') {
    shape(g, rrPts(-L / 2, -Wd / 2, L, Wd, 6), { fill: col, lw: 2, j: 0.3 });
    shape(g, rrPts(-L / 2 + 3, -Wd / 2 + 4, 22, Wd - 8, 2), { fill: darken(col, 0.3), lw: 1.4, j: 0.2, shade: false });
    shape(g, rrPts(-1, -Wd / 2 + 3, 16, Wd - 6, 3), { fill: lighten(col, 0.15), lw: 1.4, j: 0.2 });
    shape(g, rrPts(13, -Wd / 2 + 4, 5, Wd - 8, 2), { fill: '#bfe3f2', lw: 1.2, j: 0.1, shade: false });
  } else if (st.bodyKey === 'kar_racer') {
    shape(g, [[-L / 2, -Wd / 2], [L / 2 - 8, -Wd / 2 + 3], [L / 2 + 4, 0], [L / 2 - 8, Wd / 2 - 3], [-L / 2, Wd / 2]], { fill: col, lw: 2, j: 0.3 });
    shape(g, rrPts(-L / 2 - 3, -Wd / 2 - 2, 7, Wd + 4, 2), { fill: darken(col, 0.2), lw: 1.4, j: 0.2 });
    shape(g, [[-L / 2 + 4, -2], [L / 2, -2], [L / 2, 2], [-L / 2 + 4, 2]], { fill: '#fff6e0', ink: null, j: 0.1, shade: false });
    circ(g, -6, 0, 6, { fill: '#333', lw: 1.4 });
  } else if (st.bodyKey === 'kar_badekar') {
    shape(g, ellPts(0, 0, L / 2, Wd / 2), { fill: '#f4f1ea', lw: 2 });
    shape(g, ellPts(0, 0, L / 2 - 5, Wd / 2 - 4), { fill: '#8cc6e8', lw: 1.4, shade: false });
    for (const [x, y] of [[-10, -4], [6, 5], [12, -6], [-16, 6]]) circ(g, x, y, 3, { fill: '#fff', lw: 1, shade: false, blot: false });
  } else if (st.bodyKey === 'kar_boble') {
    shape(g, rrPts(-L / 2, -Wd / 2, L, Wd, 12), { fill: col, lw: 2, j: 0.3 });
    shape(g, rrPts(-8, -Wd / 2 + 4, 18, Wd - 8, 5), { fill: darken(col, 0.25), lw: 1.4, j: 0.2, shade: false });
    circ(g, -2, 0, 5, { fill: '#222', lw: 1.2 });
    shape(g, rrPts(10, -Wd / 2 + 4, 4, Wd - 8, 2), { fill: '#bfe3f2', lw: 1.2, j: 0.1, shade: false });
  } else {
    // bare chassis
    shape(g, rrPts(-L / 2, -Wd / 2 + 6, L, 4, 2), { fill: '#4a5157', lw: 1.4, j: 0.1, shade: false });
    shape(g, rrPts(-L / 2, Wd / 2 - 10, L, 4, 2), { fill: '#4a5157', lw: 1.4, j: 0.1, shade: false });
    if (st.motorKey) shape(g, rrPts(10, -8, 16, 16, 3), { fill: st.motorKey === 'motor_v8' ? '#b8342b' : '#6f8070', lw: 1.6, j: 0.2 });
    shape(g, rrPts(-12, -8, 14, 16, 4), { fill: '#7b4a2e', lw: 1.4, j: 0.2 });
    circ(g, -5, 0, 5, { fill: '#222', lw: 1.2 });
  }
  if (st.lights) {
    circ(g, L / 2 - 1, -Wd / 2 + 5, 3, { fill: '#ffe680', lw: 1.2, shade: false });
    circ(g, L / 2 - 1, Wd / 2 - 5, 3, { fill: '#ffe680', lw: 1.2, shade: false });
  }
  return { c, w: L + 16, h: Wd + 20 };
}

