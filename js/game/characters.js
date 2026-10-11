// Figurer tegnet med kode: Mulle, hunden Buffa og folkene i bygda.
import { shape, rect, rrect, ell, circ, stroke, ellPts, darken, lighten, INK } from '../engine/draw.js';

export const LOOKS = {
  mulle: { shirt: '#c8322b', pants: '#3d5f9e', overalls: true, hat: 'cap', hatColor: '#232323', hair: '#4a3020', skin: '#f0c09a', nose: 1.25 },
  bjarne: { shirt: '#3f7d4e', pants: '#3f7d4e', overalls: true, hat: 'cap', hatColor: '#d84b2b', hair: '#c9a060', skin: '#efc49e', mustache: true },
  berit: { shirt: '#f6f2ea', pants: '#f6f2ea', dress: true, hat: 'chef', hair: '#8a5a3a', skin: '#f4caa6', apron: '#ffffff', female: true },
  flora: { shirt: '#8a5aa8', pants: '#8a5aa8', dress: true, hat: 'flowerhat', hatColor: '#f3d7e6', hair: '#e8c27a', skin: '#f6cfae', female: true, glasses: false },
  dagny: { shirt: '#2e3f6e', pants: '#2e3f6e', hat: 'none', hair: '#6b6b6b', bun: true, skin: '#f0c7a5', glasses: true, female: true, clipboard: true },
  ola: { shirt: '#b8452f', pants: '#6a4c2e', overalls: true, plaid: true, hat: 'straw', hair: '#a0703f', skin: '#e8b98f', beard: '#a0703f' },
  sigurd: { shirt: '#a82a26', pants: '#3d4a5e', plaid: true, hat: 'beanie', hatColor: '#2f5d8a', hair: '#5a3a22', skin: '#e9b48d', beard: '#5a3a22', big: true },
  frida: { shirt: '#f2c21b', pants: '#2d4f7a', hat: 'souwester', hatColor: '#f2c21b', hair: '#c96a2b', skin: '#f2c9a8', female: true, raincoat: true },
  gudrun: { shirt: '#6e8f6a', pants: '#5b5b7a', dress: true, hat: 'none', hair: '#e8e8e8', bun: true, skin: '#f2cdb0', glasses: true, female: true },
  figge: { shirt: '#6d6d6d', pants: '#4a3a2a', hat: 'cap', hatColor: '#555', hair: '#333', skin: '#e2b08a', beard: '#555' },
};

// Tegn en person med føttene i (x,y). t = tid (animasjon), talking = beveger munnen.
export function drawPerson(g, look, x, y, s = 1, t = 0, talking = false, o = {}) {
  const L = look;
  g.save();
  g.translate(x, y);
  g.scale(s * (o.flip ? -1 : 1), s);
  const breathe = Math.sin(t * 2) * 1.2;
  const big = L.big ? 1.12 : 1;
  g.scale(big, 1);

  // bein + sko
  if (!L.dress) {
    rect(g, -20, -62, 17, 56, { fill: L.pants, seed: 1 });
    rect(g, 3, -62, 17, 56, { fill: L.pants, seed: 2 });
  } else {
    rect(g, -15, -40, 10, 36, { fill: L.skin, seed: 1 });
    rect(g, 5, -40, 10, 36, { fill: L.skin, seed: 2 });
  }
  ell(g, -14, -4, 15, 7, { fill: '#2a1d16', seed: 3 });
  ell(g, 14, -4, 15, 7, { fill: '#2a1d16', seed: 4 });

  g.translate(0, breathe);
  // kropp
  if (L.dress) {
    shape(g, [[-24, -122], [24, -122], [36, -36], [-36, -36]], { fill: L.shirt, seed: 5 });
    if (L.apron) shape(g, [[-16, -100], [16, -100], [22, -42], [-22, -42]], { fill: L.apron, seed: 6, lw: 2 });
  } else {
    rrect(g, -27, -124, 54, 70, 12, { fill: L.raincoat ? L.shirt : L.shirt, seed: 5 });
    if (L.plaid) {
      g.save();
      g.globalAlpha = 0.25;
      for (let i = -24; i < 26; i += 10) stroke(g, [[i, -122], [i, -56]], { lw: 3, ink: '#1c1c1c', j: 0.3, seed: 40 + i });
      for (let i = -118; i < -56; i += 10) stroke(g, [[-26, i], [26, i]], { lw: 3, ink: '#1c1c1c', j: 0.3, seed: 60 + i });
      g.restore();
    }
    if (L.overalls) {
      rect(g, -22, -96, 44, 42, { fill: L.pants, seed: 7 });
      stroke(g, [[-18, -96], [-14, -124]], { lw: 5, ink: L.pants, j: 0.2 });
      stroke(g, [[18, -96], [14, -124]], { lw: 5, ink: L.pants, j: 0.2 });
      circ(g, -14, -92, 3, { fill: '#e0c050', lw: 1.2 });
      circ(g, 14, -92, 3, { fill: '#e0c050', lw: 1.2 });
      rect(g, -9, -84, 18, 12, { fill: darken(L.pants, 0.12), lw: 1.5, seed: 8 });
    }
    if (L.raincoat) {
      for (let i = 0; i < 4; i++) circ(g, 0, -114 + i * 16, 2.5, { fill: '#333', lw: 1 });
    }
  }

  // armer (den ene vinker når personen snakker)
  const wave = talking ? Math.sin(t * 8) * 0.25 - 0.9 : 0;
  armAt(g, -27, -118, 0.15, L);
  armAt(g, 27, -118, -0.15 + wave, L, true);
  if (L.clipboard) {
    rect(g, -44, -96, 26, 34, { fill: '#c49a5a', seed: 9 });
    rect(g, -40, -90, 18, 24, { fill: '#fff', lw: 1.2, seed: 10, shade: false });
  }

  // hode
  const hy = -150;
  circ(g, 0, hy, 27, { fill: L.skin, seed: 11 });
  // hår
  if (L.hair && L.hat !== 'beanie' && L.hat !== 'souwester') {
    shape(g, [...ellPts(0, hy - 4, 27, 24, Math.PI * 1.05, Math.PI * 1.95, 10), [22, hy - 10], [-22, hy - 10]], { fill: L.hair, seed: 12 });
    if (L.female && !L.bun) {
      shape(g, [[-27, hy - 8], [-34, hy + 24], [-20, hy + 18]], { fill: L.hair, seed: 13 });
      shape(g, [[27, hy - 8], [34, hy + 24], [20, hy + 18]], { fill: L.hair, seed: 14 });
    }
    if (L.bun) circ(g, 0, hy - 30, 11, { fill: L.hair, seed: 15 });
  }
  // ører
  ell(g, -27, hy + 2, 5, 8, { fill: L.skin, lw: 2 });
  ell(g, 27, hy + 2, 5, 8, { fill: L.skin, lw: 2 });
  // øyne (blunker av og til)
  const blink = (t * 0.7) % 4 > 3.88;
  for (const ex of [-10, 10]) {
    if (blink) stroke(g, [[ex - 4, hy - 4], [ex + 4, hy - 4]], { lw: 2 });
    else {
      ell(g, ex, hy - 5, 5, 6, { fill: '#fff', lw: 1.6, shade: false, blot: false });
      circ(g, ex + 1, hy - 4, 2.2, { fill: INK, ink: null, shade: false, blot: false });
    }
  }
  if (L.glasses) {
    circ(g, -10, hy - 5, 8, { lw: 1.8 });
    circ(g, 10, hy - 5, 8, { lw: 1.8 });
    stroke(g, [[-2, hy - 6], [2, hy - 6]], { lw: 1.6 });
  }
  // munn
  const open = talking ? Math.abs(Math.sin(t * 14)) : 0;
  if (open > 0.15) ell(g, 0, hy + 14, 6, 2 + open * 5, { fill: '#7a2a20', lw: 1.8, shade: false });
  else stroke(g, [[-8, hy + 12], [0, hy + 16], [8, hy + 12]], { lw: 2 });
  if (L.beard) shape(g, [...ellPts(0, hy + 10, 25, 22, 0.1, Math.PI - 0.1, 10), [-14, hy + 12], [14, hy + 12]], { fill: L.beard, seed: 16 });
  if (L.mustache) ell(g, 0, hy + 8, 12, 4, { fill: L.hair, lw: 1.6 });
  // nese
  const n = L.nose || 1;
  ell(g, 2, hy + 2, 8 * n, 7 * n, { fill: darken(L.skin, 0.08), seed: 17 });
  ell(g, 0, hy, 2.5 * n, 2 * n, { fill: 'rgba(255,255,255,0.5)', ink: null, shade: false, blot: false });
  // kinn
  circ(g, -16, hy + 6, 4, { fill: 'rgba(230,110,90,0.35)', ink: null, shade: false, blot: false });
  circ(g, 16, hy + 6, 4, { fill: 'rgba(230,110,90,0.35)', ink: null, shade: false, blot: false });

  drawHat(g, L, hy);
  g.restore();
}

function armAt(g, x, y, ang, L, right) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  const dir = right ? 1 : -1;
  shape(g, [[-7 * dir, 0], [7 * dir, 0], [8 * dir, 54], [-6 * dir, 54]], { fill: L.shirt, seed: right ? 31 : 32 });
  circ(g, 1 * dir, 60, 8, { fill: L.skin, seed: right ? 33 : 34 });
  g.restore();
}

function drawHat(g, L, hy) {
  switch (L.hat) {
    case 'cap':
      shape(g, [...ellPts(0, hy - 10, 29, 22, Math.PI, Math.PI * 2, 12)], { fill: L.hatColor, seed: 21 });
      shape(g, [[2, hy - 12], [44, hy - 8], [42, hy - 2], [0, hy - 6]], { fill: L.hatColor, seed: 22 });
      break;
    case 'straw':
      ell(g, 0, hy - 16, 48, 9, { fill: '#e6c66a', seed: 23 });
      shape(g, ellPts(0, hy - 18, 26, 20, Math.PI, Math.PI * 2, 12), { fill: '#e6c66a', seed: 24 });
      stroke(g, [[-24, hy - 22], [24, hy - 22]], { lw: 4, ink: '#b8452f', j: 0.2 });
      break;
    case 'chef':
      rect(g, -22, hy - 34, 44, 16, { fill: '#fff', seed: 25 });
      for (const cx of [-16, 0, 16]) circ(g, cx, hy - 44, 14, { fill: '#fff', seed: 26 + cx });
      break;
    case 'beanie':
      shape(g, ellPts(0, hy - 8, 30, 30, Math.PI, Math.PI * 2, 14), { fill: L.hatColor, seed: 27 });
      rect(g, -30, hy - 12, 60, 9, { fill: lighten(L.hatColor, 0.2), seed: 28 });
      circ(g, 0, hy - 40, 7, { fill: lighten(L.hatColor, 0.4), seed: 29 });
      break;
    case 'souwester':
      shape(g, [[-40, hy - 2], [-28, hy - 30], [0, hy - 40], [28, hy - 30], [40, hy - 2], [30, hy + 4], [0, hy - 6], [-30, hy + 4]], { fill: L.hatColor, seed: 30 });
      break;
    case 'flowerhat':
      ell(g, 0, hy - 18, 42, 9, { fill: L.hatColor, seed: 31 });
      shape(g, ellPts(0, hy - 20, 24, 16, Math.PI, Math.PI * 2, 12), { fill: L.hatColor, seed: 32 });
      for (const [fx, c] of [[-12, '#e0477a'], [2, '#f4c430'], [14, '#7a5ae0']]) circ(g, fx, hy - 30, 6, { fill: c, lw: 1.5, seed: 33 + fx });
      break;
    default:
      break;
  }
}

// Hunden Buffa, sittende. Føttene i (x,y).
export function drawDog(g, x, y, s = 1, t = 0, o = {}) {
  const c = '#9a6436';
  g.save();
  g.translate(x, y);
  g.scale(s * (o.flip ? -1 : 1), s);
  // hale som logrer
  const wag = Math.sin(t * 9) * 0.5;
  g.save();
  g.translate(-26, -16);
  g.rotate(-0.6 + wag);
  shape(g, [[0, 0], [-6, -26], [0, -30], [6, -4]], { fill: c, seed: 41 });
  g.restore();
  ell(g, -6, -26, 28, 26, { fill: c, seed: 42 }); // kropp
  ell(g, -18, -6, 16, 8, { fill: c, seed: 43 }); // bakbein
  rect(g, 4, -32, 9, 30, { fill: c, seed: 44 });
  rect(g, 14, -32, 9, 30, { fill: c, seed: 45 });
  ell(g, 9, -3, 7, 4, { fill: darken(c, 0.2), lw: 1.6 });
  ell(g, 19, -3, 7, 4, { fill: darken(c, 0.2), lw: 1.6 });
  ell(g, 10, -40, 12, 10, { fill: lighten(c, 0.35), seed: 46, lw: 1.8 }); // bryst
  // hode
  const tilt = Math.sin(t * 0.8) * 0.06;
  g.translate(16, -62);
  g.rotate(tilt);
  circ(g, 0, 0, 20, { fill: c, seed: 47 });
  ell(g, 18, 6, 14, 10, { fill: lighten(c, 0.25), seed: 48 }); // snute
  circ(g, 30, 2, 5, { fill: '#1d1410', lw: 1.5 });
  ell(g, 4, -6, 4, 5, { fill: '#fff', lw: 1.4, shade: false });
  circ(g, 5, -5, 2, { fill: INK, ink: null });
  shape(g, [[-14, -14], [-24, 2], [-26, 22], [-14, 16], [-8, -6]], { fill: darken(c, 0.35), seed: 49 }); // øre
  if (o.tongue) ell(g, 20, 18, 4, 6, { fill: '#e2687a', lw: 1.4 });
  g.restore();
}

// Ku (til Olas gård)
export function drawCow(g, x, y, s = 1, t = 0) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  for (const lx of [-34, -18, 20, 34]) rect(g, lx - 5, -40, 10, 40, { fill: '#f6f1e6', seed: 60 + lx });
  ell(g, 0, -56, 52, 28, { fill: '#f6f1e6', seed: 61 });
  ell(g, -18, -62, 14, 10, { fill: '#2a2420', ink: null, seed: 62 });
  ell(g, 16, -48, 12, 9, { fill: '#2a2420', ink: null, seed: 63 });
  ell(g, 0, -56, 52, 28, { seed: 61 });
  const chew = Math.sin(t * 5) * 1.5;
  g.translate(56, -72);
  ell(g, 0, 0, 20, 17, { fill: '#f6f1e6', seed: 64 });
  ell(g, 10, 10 + chew, 14, 9, { fill: '#f0b5b0', seed: 65 });
  circ(g, -2, -4, 3, { fill: INK, ink: null });
  stroke(g, [[-10, -14], [-16, -26]], { lw: 3, ink: '#e8e0c8' });
  stroke(g, [[6, -14], [10, -26]], { lw: 3, ink: '#e8e0c8' });
  g.restore();
}

// Gammel veggtelefon (garasjen) – tegnes også når Figge ringer.
export function drawPhone(g, x, y, s = 1, ringing = 0) {
  g.save();
  g.translate(x, y);
  if (ringing) g.rotate(Math.sin(ringing * 40) * 0.06);
  g.scale(s, s);
  rect(g, -22, -30, 44, 60, { fill: '#4e8a46', seed: 71 });
  circ(g, 0, -8, 13, { fill: '#d8d8d0', seed: 72 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    circ(g, Math.cos(a) * 8, -8 + Math.sin(a) * 8, 2, { fill: '#555', ink: null });
  }
  stroke(g, [[-10, -30], [-14, -42]], { lw: 3 });
  stroke(g, [[10, -30], [14, -42]], { lw: 3 });
  rect(g, 22, 4, 10, 6, { fill: '#333', lw: 1.5 });
  // rør
  rrect(g, -34, -24, 10, 40, 4, { fill: '#2b2b2b', seed: 73 });
  stroke(g, [[-30, 16], [-34, 30], [-26, 40], [-16, 32]], { lw: 2, j: 0.4 });
  g.restore();
}
