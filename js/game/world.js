// Verdenskartet: veinett, steder og forhåndstegning av landskapet sett ovenfra.
import { makeCanvas, shape, rect, circ, ell, stroke, txt, rand, darken, hatch, star, INK, rrPts, ellPts } from '../engine/draw.js';

// Verden er delt i skjermbilder (SCREEN) som i originalspillet: kjører man ut av
// kanten, lastes neste bilde. Koordinatene i dataene under er «designkoordinater»;
// på det tegnede kartet ligger de OY piksler lenger ned.
export const SCREEN = { w: 800, h: 500 };
export const OY = 150;
export const WORLD = { w: 2400, h: 2000, cols: 3, rows: 4 };

export const ROAD_STYLE = {
  asfalt: { half: 24, color: '#8a8780', edge: '#5f5c56' },
  grus: { half: 22, color: '#d8c08a', edge: '#a88d5a' },
  humpete: { half: 22, color: '#cdb17a', edge: '#97794a' },
  gjorme: { half: 22, color: '#7a5532', edge: '#4f3420' },
  bratt: { half: 22, color: '#b9a98a', edge: '#7b6e58' },
  tunnel: { half: 22, color: '#55524d', edge: '#2b2926' },
};

export const ROADS = [
  { type: 'asfalt', pts: [[250, 1500], [550, 1500], [850, 1420], [1050, 1270], [1250, 1120]] },
  { type: 'asfalt', pts: [[1250, 1120], [1500, 1060], [1750, 960], [1840, 820]] },
  { type: 'tunnel', pts: [[1840, 820], [1900, 735], [1985, 655]] },
  { type: 'grus', pts: [[1985, 655], [2100, 620], [2200, 590], [2260, 560]] },
  { type: 'asfalt', pts: [[550, 1500], [600, 1600], [680, 1650]] },
  { type: 'asfalt', pts: [[1250, 1120], [1170, 1040], [1110, 975]] },
  { type: 'grus', pts: [[1250, 1120], [1350, 1220], [1450, 1290]] },
  { type: 'asfalt', pts: [[1250, 1120], [1280, 1030], [1330, 990]] },
  { type: 'grus', pts: [[850, 1420], [820, 1300]] },
  { type: 'humpete', pts: [[820, 1300], [780, 1180], [720, 1080]] },
  { type: 'grus', pts: [[720, 1080], [650, 1000], [560, 960], [500, 950]] },
  { type: 'grus', pts: [[650, 1000], [610, 880], [560, 820]] },
  { type: 'gjorme', pts: [[560, 820], [505, 690], [470, 565]] },
  { type: 'grus', pts: [[470, 565], [420, 440], [390, 300], [360, 220]] },
  { type: 'asfalt', pts: [[1500, 1060], [1480, 900], [1520, 805]] },
  { type: 'bratt', pts: [[1520, 805], [1545, 715], [1400, 640], [1530, 545], [1440, 455]] },
  { type: 'grus', pts: [[1440, 455], [1470, 360], [1480, 280]] },
  { type: 'asfalt', pts: [[1750, 960], [1800, 1060], [1820, 1125]] },
];

// Steder på kartet. exit = der bilen settes når man kjører videre.
export const LOCATIONS = [
  { id: 'hjem', name: 'Mulles gård', x: 250, y: 1500, exit: [330, 1500] },
  { id: 'bensin', name: 'Bensinstasjon', x: 680, y: 1650, exit: [612, 1612] },
  { id: 'bensin', name: 'Bensinstasjon', x: 1820, y: 1125, exit: [1798, 1050], key: 'bensin2' },
  { id: 'bakeri', name: 'Bakeriet', x: 1110, y: 975, exit: [1172, 1042] },
  { id: 'fest', name: 'Den gule villaen', x: 1450, y: 1290, exit: [1360, 1228] },
  { id: 'torg', name: 'Bilutstilling', x: 1330, y: 990, exit: [1272, 1052] },
  { id: 'ola', name: 'Olas gård', x: 500, y: 950, exit: [570, 962] },
  { id: 'sigurd', name: 'Sigurds hytte', x: 360, y: 220, exit: [392, 296] },
  { id: 'fyr', name: 'Fyret', x: 2260, y: 560, exit: [2190, 592] },
  { id: 'topp', name: 'Fjelltoppen', x: 1480, y: 280, exit: [1468, 362] },
];
LOCATIONS.forEach((l) => (l.key = l.key || l.id));

const COAST = [[2290, -170], [2340, 250], [2350, 450], [2290, 620], [2150, 760], [2080, 900], [2120, 1100], [2000, 1300], [1850, 1450], [1750, 1650], [1680, 1870]];
const SEA = [...COAST, [2420, 1870], [2420, -170]];
const MOUNTAIN = [[1100, -170], [1950, -170], [2050, 200], [2030, 450], [1960, 650], [1900, 850], [1780, 760], [1650, 880], [1450, 850], [1300, 600], [1150, 400], [1050, 200]];
const FOREST = [[-20, -170], [1060, -170], [1000, 220], [820, 420], [720, 650], [420, 820], [-20, 860]];
const LAKE = { x: 850, y: 520, rx: 110, ry: 70 };
const FIELDS = [
  [[80, 1180], [420, 1160], [440, 1390], [100, 1420]],
  [[60, 1560], [400, 1560], [380, 1760], [40, 1770]],
  [[430, 1180], [700, 1150], [760, 1380], [470, 1400]],
  [[700, 1500], [1000, 1460], [1050, 1700], [760, 1740]],
  [[380, 1010], [560, 1030], [540, 1150], [370, 1140]],
  [[760, 860], [1000, 820], [1040, 1050], [820, 1080]],
  [[1560, 1150], [1820, 1200], [1760, 1420], [1520, 1380]],
  [[1080, 1450], [1400, 1400], [1450, 1650], [1120, 1700]],
];
const FIELD_COLORS = ['#e6c55a', '#9ccb5e', '#c48a52', '#d9b04a', '#a8d06a', '#e0b860'];

export function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Nærmeste punkt på veinettet.
export function nearestRoad(x, y) {
  let best = { d: Infinity };
  for (const r of ROADS) {
    for (let i = 0; i < r.pts.length - 1; i++) {
      const [ax, ay] = r.pts[i], [bx, by] = r.pts[i + 1];
      const dx = bx - ax, dy = by - ay;
      const l2 = dx * dx + dy * dy;
      let t = ((x - ax) * dx + (y - ay) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      const px = ax + dx * t, py = ay + dy * t;
      const d = Math.hypot(x - px, y - py);
      if (d < best.d) best = { d, px, py, road: r, type: r.type, half: ROAD_STYLE[r.type].half };
    }
  }
  return best;
}

// Hold bilen på veien: skyv den tilbake innenfor veikanten.
export function constrain(x, y) {
  const n = nearestRoad(x, y);
  const lim = n.half - 6;
  if (n.d <= lim) return { x, y, type: n.type };
  for (const l of LOCATIONS) if (Math.hypot(x - l.x, y - l.y) < 30) return { x, y, type: 'asfalt' };
  const k = lim / n.d;
  return { x: n.px + (x - n.px) * k, y: n.py + (y - n.py) * k, type: n.type, blocked: true };
}

// ---------- tegning ----------
function smoothRoad(g, pts, width, color) {
  g.save();
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke();
  g.restore();
}

function treeTop(g, x, y, s, seed, pine) {
  g.save();
  g.fillStyle = 'rgba(30,50,20,0.25)';
  g.beginPath();
  g.ellipse(x + 6 * s, y + 6 * s, 16 * s, 12 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  if (pine) {
    shape(g, star(x, y, 17 * s, 9 * s, 7, seed), { fill: '#2f6b3a', lw: 1.6, seed, j: 0.6, step: 20 });
    circ(g, x - 2 * s, y - 2 * s, 4 * s, { fill: '#3f8048', ink: null, shade: false, blot: false });
  } else {
    circ(g, x, y, 16 * s, { fill: ['#4f8f3a', '#5c9b40', '#467f33'][seed % 3], lw: 1.6, seed, step: 14 });
    circ(g, x - 5 * s, y - 5 * s, 6 * s, { fill: 'rgba(255,255,255,0.18)', ink: null, shade: false, blot: false });
  }
}

function houseTop(g, x, y, w, h, wall, roof, seed) {
  rect(g, x - w / 2, y - h / 2 + h * 0.45, w, h * 0.55, { fill: wall, lw: 1.8, seed });
  shape(g, [[x - w / 2 - 4, y - h / 2 + h * 0.5], [x - w / 2 + 6, y - h / 2], [x + w / 2 - 6, y - h / 2], [x + w / 2 + 4, y - h / 2 + h * 0.5]], { fill: roof, lw: 1.8, seed: seed + 1 });
  stroke(g, [[x - w / 2 + 2, y - h / 2 + h * 0.25], [x + w / 2 - 2, y - h / 2 + h * 0.25]], { lw: 1.2, ink: darken(roof, 0.3) });
  rect(g, x - 4, y + h / 2 - 12, 8, 12, { fill: darken(wall, 0.4), lw: 1.2 });
}

function building(g, l) {
  const [ex, ey] = l.exit;
  const dx = l.x - ex, dy = l.y - ey;
  const len = Math.hypot(dx, dy);
  const bx = l.x + (dx / len) * 50;
  const by = l.y + (dy / len) * 50;
  // gårdsplass
  ell(g, l.x + (dx / len) * 18, l.y + (dy / len) * 18, 44, 34, { fill: '#d6c49c', lw: 1.4, seed: 7, shade: false });
  switch (l.id) {
    case 'hjem':
      houseTop(g, bx - 30, by - 40, 70, 54, '#f5f0e2', '#b8452f', 11);
      houseTop(g, bx + 10, by + 30, 66, 52, '#b9412f', '#3d3a3a', 12);
      break;
    case 'bensin':
      rect(g, bx - 40, by - 30, 80, 26, { fill: '#f0f0f0', lw: 1.8 });
      rect(g, bx - 46, by - 10, 92, 40, { fill: 'rgba(230,60,50,0.85)', lw: 2 });
      for (const px of [-20, 20]) rect(g, bx + px - 5, by + 6, 10, 16, { fill: '#f2c94c', lw: 1.4 });
      break;
    case 'bakeri':
      houseTop(g, bx, by, 80, 60, '#f3e3c3', '#9a5a3a', 13);
      rect(g, bx - 40, by + 8, 80, 8, { fill: '#f2c94c', lw: 1.4 });
      break;
    case 'fest':
      houseTop(g, bx + 10, by, 90, 66, '#f2c94c', '#b8452f', 14);
      for (const [tx, ty] of [[-50, 30], [-30, 50], [-60, 60]]) circ(g, bx + tx, by + ty, 8, { fill: '#fff', lw: 1.4 });
      for (const [tx, ty, c] of [[-40, -30, '#e0477a'], [-56, -16, '#4f7fa8'], [-30, -44, '#f4c430']]) circ(g, bx + tx, by + ty, 6, { fill: c, lw: 1.2 });
      break;
    case 'torg':
      shape(g, rrPts(bx - 60, by - 44, 120, 88, 10), { fill: '#d9d2c2', lw: 2, seed: 15 });
      for (let i = 0; i < 5; i++) {
        const fx = bx - 50 + i * 25;
        stroke(g, [[fx, by - 40], [fx, by - 64]], { lw: 1.6 });
        shape(g, [[fx, by - 64], [fx + 14, by - 60], [fx, by - 54]], { fill: ['#c8322b', '#f2c94c', '#3d6fb8', '#5d8f4a', '#e0477a'][i], lw: 1.2 });
      }
      rect(g, bx - 18, by - 10, 36, 20, { fill: '#b8452f', lw: 1.6 });
      break;
    case 'ola':
      houseTop(g, bx - 30, by - 10, 74, 60, '#b9412f', '#5a4a3a', 16);
      houseTop(g, bx + 40, by + 20, 50, 40, '#f5f0e2', '#3d3a3a', 17);
      for (const [cx, cy] of [[-10, 60], [14, 74], [-30, 80]]) {
        ell(g, bx + cx, by + cy, 11, 7, { fill: '#f6f1e6', lw: 1.4 });
        ell(g, bx + cx - 3, by + cy - 1, 4, 3, { fill: '#2a2420', ink: null });
        circ(g, bx + cx + 12, by + cy, 4, { fill: '#f6f1e6', lw: 1.2 });
      }
      break;
    case 'sigurd':
      houseTop(g, bx, by, 64, 50, '#7a4f2e', '#4f3420', 18);
      for (let i = 0; i < 4; i++) ell(g, bx + 44, by - 10 + i * 8, 10, 4, { fill: '#b27c45', lw: 1.2 });
      break;
    case 'fyr':
      circ(g, bx, by, 22, { fill: '#f6f1e6', lw: 2.2 });
      circ(g, bx, by, 16, { fill: '#c8322b', lw: 1.6 });
      circ(g, bx, by, 9, { fill: '#f6f1e6', lw: 1.6 });
      circ(g, bx, by, 5, { fill: '#ffe680', lw: 1.4 });
      houseTop(g, bx - 46, by + 16, 40, 32, '#f6f1e6', '#c8322b', 19);
      break;
    case 'topp':
      houseTop(g, bx, by, 56, 44, '#a46d3a', '#7a2a20', 20);
      stroke(g, [[bx + 36, by - 20], [bx + 36, by - 52]], { lw: 2 });
      shape(g, [[bx + 36, by - 52], [bx + 58, by - 46], [bx + 36, by - 40]], { fill: '#c8202e', lw: 1.4 });
      break;
    default:
      break;
  }
  // navneskilt
  txt(g, l.name, bx, by - 64, { size: 22, color: INK, outline: 'rgba(255,250,235,0.95)', olw: 6 });
}

function obstacleSign(g, x, y, label, color) {
  stroke(g, [[x, y], [x, y + 26]], { lw: 3, ink: '#5b3a22' });
  shape(g, [[x, y - 26], [x + 20, y + 6], [x - 20, y + 6]], { fill: '#fff6d8', lw: 2.4, seed: 3 });
  shape(g, [[x, y - 18], [x + 13, y + 1], [x - 13, y + 1]], { fill: color, lw: 1.6, seed: 4 });
  txt(g, label, x, y + 40, { size: 17, color: INK, outline: 'rgba(255,250,235,0.9)', olw: 5 });
}

export function renderWorld() {
  // Stort lerret: hold det i vanlig minne (ikke grafikkminne), ellers kan nettleseren
  // miste innholdet når grafikkminnet blir trangt. Skjermbildene kuttes ut ved behov.
  const c = makeCanvas(WORLD.w, WORLD.h);
  const g = c.getContext('2d', { willReadFrequently: true });
  const R = rand(2024);
  // gress
  g.fillStyle = '#93c46c';
  g.fillRect(0, 0, WORLD.w, WORLD.h);
  hatch(g, 0, 0, WORLD.w, WORLD.h, 'rgba(60,110,40,0.22)', 1, 9000, 8, -1.3, 1.3, 0.6);
  hatch(g, 0, 0, WORLD.w, WORLD.h, 'rgba(220,240,160,0.18)', 2, 5000, 6, -1.0, 1.2, 0.6);
  g.translate(0, OY);
  // jorder
  FIELDS.forEach((f, i) => {
    const col = FIELD_COLORS[i % FIELD_COLORS.length];
    shape(g, f, { fill: col, lw: 2, seed: 30 + i, step: 30, j: 2 });
    g.save();
    g.clip(new Path2D(`M${f.map((p) => p.join(',')).join('L')}Z`));
    const [x0, y0] = f[0];
    const ang = i % 2 ? 0.3 : -0.4;
    g.strokeStyle = darken(col, 0.15);
    g.lineWidth = 3;
    g.beginPath();
    for (let k = -40; k < 40; k++) {
      const ox = x0 + k * 14 * Math.cos(ang + Math.PI / 2), oy = y0 + k * 14 * Math.sin(ang + Math.PI / 2);
      g.moveTo(ox - Math.cos(ang) * 600, oy - Math.sin(ang) * 600);
      g.lineTo(ox + Math.cos(ang) * 600, oy + Math.sin(ang) * 600);
    }
    g.stroke();
    g.restore();
  });
  // skog-bunn
  shape(g, FOREST, { fill: '#5f9a4a', lw: 0, ink: null, seed: 40, step: 40, j: 10 });
  // innsjø
  shape(g, ellPts(LAKE.x, LAKE.y, LAKE.rx + 10, LAKE.ry + 10), { fill: '#e6d6a8', lw: 0, ink: null, seed: 41, step: 20, j: 4 });
  shape(g, ellPts(LAKE.x, LAKE.y, LAKE.rx, LAKE.ry), { fill: '#5aa0cf', lw: 2.4, seed: 42, step: 20, j: 4 });
  // hav med strand
  shape(g, SEA.map(([x, y]) => [x - 26, y]), { fill: '#ecd9a8', lw: 0, ink: null, seed: 43, step: 30, j: 6 });
  shape(g, SEA, { fill: '#4f94c7', lw: 2.6, seed: 44, step: 30, j: 6 });
  g.save();
  g.strokeStyle = 'rgba(255,255,255,0.45)';
  g.lineWidth = 2;
  g.lineCap = 'round';
  for (let i = 0; i < 160; i++) {
    const x = 1650 + R() * 750, y = -OY + R() * WORLD.h;
    if (!pointInPoly(x, y, SEA) || !pointInPoly(x - 30, y, SEA)) continue;
    g.beginPath();
    g.arc(x, y, 8, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
  }
  g.restore();
  // tunnelvei (under fjellet)
  const tun = ROADS.find((r) => r.type === 'tunnel');
  smoothRoad(g, tun.pts, 48, '#2b2926');
  // fjell
  shape(g, MOUNTAIN, { fill: '#9c9483', lw: 3, seed: 50, step: 40, j: 8 });
  for (let i = 0; i < 60; i++) {
    const x = 1100 + R() * 950, y = -OY + R() * (850 + OY);
    if (!pointInPoly(x, y, MOUNTAIN)) continue;
    const s = 20 + R() * 40;
    shape(g, [[x - s, y + s * 0.5], [x - s * 0.1, y - s * 0.7], [x + s, y + s * 0.5]], { fill: R() < 0.5 ? '#8a8272' : '#aaa290', lw: 1.6, seed: 51 + i, j: 2 });
    if (y < 350) shape(g, [[x - s * 0.35, y - s * 0.2], [x - s * 0.1, y - s * 0.7], [x + s * 0.3, y - s * 0.2]], { fill: '#f6f6f2', lw: 1.2, seed: 52 + i, j: 1, shade: false });
  }
  // tunnelportaler + stiplet tunnel
  g.save();
  g.setLineDash([10, 10]);
  smoothRoad(g, tun.pts, 6, 'rgba(30,25,20,0.6)');
  g.restore();
  for (const [px, py, a] of [[1840, 820, -0.95], [1985, 655, -0.75]]) {
    g.save();
    g.translate(px, py);
    g.rotate(a);
    shape(g, [[-30, -8], [30, -8], [30, 8], [-30, 8]], { fill: '#6a6258', lw: 2.4, seed: 60 });
    ell(g, 0, 0, 22, 6, { fill: '#141210', lw: 1.6, seed: 61 });
    g.restore();
  }
  // veier: kant først, så midten
  const roads = ROADS.filter((r) => r.type !== 'tunnel');
  for (const r of roads) smoothRoad(g, r.pts, ROAD_STYLE[r.type].half * 2 + 6, ROAD_STYLE[r.type].edge);
  for (const r of roads) smoothRoad(g, r.pts, ROAD_STYLE[r.type].half * 2, ROAD_STYLE[r.type].color);
  for (const r of roads) {
    if (r.type === 'asfalt') {
      g.save();
      g.setLineDash([16, 18]);
      smoothRoad(g, r.pts, 3, 'rgba(255,250,230,0.8)');
      g.restore();
    }
    decorateRoad(g, r, R);
  }
  for (const l of LOCATIONS) smoothRoad(g, [[l.x, l.y], [l.x, l.y]], 60, ROAD_STYLE.asfalt.edge);
  // trær
  const road = (x, y, m) => nearestRoad(x, y).d < m;
  const nearLoc = (x, y, m) => LOCATIONS.some((l) => Math.hypot(l.x - x, l.y - y) < m);
  for (let i = 0; i < 1700; i++) {
    const x = R() * WORLD.w, y = -OY + R() * WORLD.h;
    const inForest = pointInPoly(x, y, FOREST);
    if (!inForest && R() < 0.75) continue;
    if (pointInPoly(x, y, SEA) || pointInPoly(x, y, MOUNTAIN) || FIELDS.some((f) => pointInPoly(x, y, f))) continue;
    if (Math.hypot((x - LAKE.x) / (LAKE.rx + 20), (y - LAKE.y) / (LAKE.ry + 20)) < 1) continue;
    if (road(x, y, 40) || nearLoc(x, y, 110)) continue;
    if (x > 1000 && x < 1560 && y > 840 && y < 1360) continue; // byen
    treeTop(g, x, y, 0.8 + R() * 0.6, i, inForest ? R() < 0.7 : R() < 0.2);
  }
  // byhus
  for (let i = 0; i < 70; i++) {
    const x = 1010 + R() * 540, y = 850 + R() * 500;
    if (road(x, y, 46) || nearLoc(x, y, 120)) continue;
    houseTop(g, x, y, 34 + R() * 16, 28 + R() * 10, ['#f5f0e2', '#f2c94c', '#e3a37a', '#cfe0ea', '#f1d4d4'][Math.floor(R() * 5)], ['#b8452f', '#7a2a20', '#3d3a3a', '#5a6a7a'][Math.floor(R() * 4)], 300 + i);
  }
  // steder
  for (const l of LOCATIONS) building(g, l);
  // hindringsskilt
  obstacleSign(g, 860, 1300, 'Humpete vei', '#e2b422');
  obstacleSign(g, 615, 785, 'Gjørme!', '#7a5532');
  obstacleSign(g, 1440, 800, 'Bratt bakke', '#c8322b');
  obstacleSign(g, 1790, 840, 'Tunnel', '#222');
  return c;
}

function decorateRoad(g, r, R) {
  const along = (fn, every) => {
    for (let i = 0; i < r.pts.length - 1; i++) {
      const [ax, ay] = r.pts[i], [bx, by] = r.pts[i + 1];
      const len = Math.hypot(bx - ax, by - ay);
      for (let d = every / 2; d < len; d += every) {
        const t = d / len;
        fn(ax + (bx - ax) * t, ay + (by - ay) * t, Math.atan2(by - ay, bx - ax));
      }
    }
  };
  if (r.type === 'humpete') {
    along((x, y) => {
      for (let k = 0; k < 3; k++) circ(g, x + (R() - 0.5) * 30, y + (R() - 0.5) * 30, 3 + R() * 3, { fill: '#8f8473', lw: 1.2, shade: false });
    }, 16);
  } else if (r.type === 'gjorme') {
    along((x, y) => ell(g, x + (R() - 0.5) * 20, y + (R() - 0.5) * 20, 9 + R() * 6, 5 + R() * 3, { fill: '#5a3c22', lw: 1, ink: '#3d2814', shade: false }), 22);
  } else if (r.type === 'bratt') {
    along((x, y, a) => {
      g.save();
      g.translate(x, y);
      g.rotate(a);
      stroke(g, [[-5, -10], [5, 0], [-5, 10]], { lw: 2.4, ink: 'rgba(80,60,40,0.6)', j: 0.2 });
      g.restore();
    }, 26);
  } else if (r.type === 'grus') {
    along((x, y) => circ(g, x + (R() - 0.5) * 30, y + (R() - 0.5) * 30, 1.5, { fill: '#a88d5a', ink: null, shade: false, blot: false }), 10);
  }
}

