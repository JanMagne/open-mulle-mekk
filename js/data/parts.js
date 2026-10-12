// Alle bildeler: egenskaper + tegnefunksjon (sett fra siden, fronten peker mot høyre).
// (0,0) er festepunktet på bilen.
import { shape, rect, rrect, ell, circ, stroke, tube, ellPts, rot, star, darken, lighten, rand, txt } from '../engine/draw.js';

const MET = '#8f989e';
const DMET = '#5b636a';
const RUB = '#2e2c30';
const CHR = '#d3dce1';
const WOOD = '#b27c45';
const BRASS = '#d0a640';
const GLASS = 'rgba(190,225,240,0.42)';

// ---------- hjelpere ----------
function cutGlass(g, pts) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  shape(g, pts, { fill: '#000', ink: null, shade: false, blot: false, j: 0.3 });
  g.restore();
  shape(g, pts, { fill: GLASS, lw: 2, shade: false, blot: false, j: 0.3 });
  // gjenskinn
  const [a, b] = [pts[0], pts[2]];
  stroke(g, [[a[0] + (b[0] - a[0]) * 0.3, a[1] + (b[1] - a[1]) * 0.15], [a[0] + (b[0] - a[0]) * 0.45, a[1] + (b[1] - a[1]) * 0.6]], {
    lw: 3, ink: 'rgba(255,255,255,0.6)', j: 0.2,
  });
}

function bolts(g, pts, r = 1.8) {
  for (const [x, y] of pts) circ(g, x, y, r, { fill: CHR, lw: 1, shade: false, blot: false, j: 0.1 });
}

// Hjulbuer: punkter langs en halvsirkel over hjulet (fra front mot bak).
function arch(cx, cy, r) {
  return ellPts(cx, cy, r, r, 0, -Math.PI, 12);
}

// ---------- hjul ----------
function drawWheel(g, d) {
  const r = d.r;
  if (d.look === 'sykkel') {
    g.save();
    g.lineWidth = 6;
    g.strokeStyle = RUB;
    g.beginPath();
    g.arc(0, 0, r - 3, 0, Math.PI * 2);
    g.stroke();
    g.restore();
    circ(g, 0, 0, r, { lw: 2, seed: 11 });
    circ(g, 0, 0, r - 6, { lw: 1.6, ink: '#777', seed: 12 });
    g.save();
    g.strokeStyle = '#9aa3a8';
    g.lineWidth = 1.1;
    g.beginPath();
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
      g.lineTo(Math.cos(a + 0.3) * (r - 6), Math.sin(a + 0.3) * (r - 6));
    }
    g.stroke();
    g.restore();
    circ(g, 0, 0, 5, { fill: CHR, lw: 1.6 });
    return;
  }
  if (d.look === 'traktor') {
    const pts = [];
    const n = 22;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const rr = i % 2 ? r : r - 5;
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    shape(g, pts, { fill: RUB, lw: 2.2, j: 0.3, step: 30, seed: 21 });
    circ(g, 0, 0, r * 0.55, { fill: '#e2b422', lw: 2.2, seed: 22 });
    circ(g, 0, 0, r * 0.4, { fill: darken('#e2b422', 0.15), lw: 1.5, seed: 23 });
    circ(g, 0, 0, r * 0.15, { fill: CHR, lw: 1.5, seed: 24 });
    bolts(g, ellPts(0, 0, r * 0.28, r * 0.28, 0, Math.PI * 2, 6));
    return;
  }
  if (d.look === 'tre') {
    g.save();
    g.lineWidth = 5;
    g.strokeStyle = '#3c3a38';
    g.beginPath();
    g.arc(0, 0, r - 2.5, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 7;
    g.strokeStyle = WOOD;
    g.beginPath();
    g.arc(0, 0, r - 8, 0, Math.PI * 2);
    g.stroke();
    g.restore();
    circ(g, 0, 0, r, { lw: 2, seed: 31 });
    circ(g, 0, 0, r - 12, { lw: 1.6, seed: 32 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      stroke(g, [[Math.cos(a) * 6, Math.sin(a) * 6], [Math.cos(a) * (r - 11), Math.sin(a) * (r - 11)]], {
        lw: 4.5, ink: WOOD, j: 0.2, seed: 33 + i,
      });
    }
    circ(g, 0, 0, 7, { fill: darken(WOOD, 0.2), lw: 1.8, seed: 44 });
    return;
  }
  // vanlig / racer
  circ(g, 0, 0, r, { fill: RUB, lw: 2.4, seed: 51 });
  g.save();
  g.strokeStyle = 'rgba(255,255,255,0.13)';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(0, 0, r - 4, Math.PI * 1.1, Math.PI * 1.6);
  g.stroke();
  g.restore();
  const rimR = d.look === 'racer' ? r * 0.7 : r * 0.6;
  circ(g, 0, 0, rimR, { fill: d.rim, lw: 2, seed: 52 });
  if (d.look === 'racer') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      stroke(g, [[0, 0], [Math.cos(a) * rimR * 0.9, Math.sin(a) * rimR * 0.9]], { lw: 5, ink: darken(d.rim, 0.35), j: 0.1, seed: 60 + i });
    }
    circ(g, 0, 0, rimR * 0.3, { fill: CHR, lw: 1.5, seed: 66 });
  } else {
    circ(g, 0, 0, rimR * 0.55, { fill: CHR, lw: 1.6, seed: 53 });
    bolts(g, ellPts(0, 0, rimR * 0.75, rimR * 0.75, 0, Math.PI * 2, 5), 1.6);
  }
}

function wheel(key, name, o) {
  const r = o.r;
  return {
    key, name, slot: 'hjul', r,
    bbox: [-r - 2, -r - 2, r + 2, r + 2],
    weight: o.weight, grip: o.grip, speed: o.speed, strength: o.strength, comfort: o.comfort, style: o.style || 0,
    comment: o.comment,
    look: o.look, rim: o.rim,
    draw(g) { drawWheel(g, this); },
  };
}

// ---------- karosserier ----------
function bodyBottom(r = 38) {
  // fra front-nede til bak-nede, med hjulbuer
  return [[166, 14], [150, 14], ...arch(110, 16, r).slice(1, -1), [70, 14], [-65, 14], ...arch(-105, 16, r).slice(1, -1), [-145, 14], [-158, 14]];
}

const BODIES = {
  kar_boble: {
    name: 'Boble-karosseri', color: '#efb52f', weight: 3, strength: 2, comfort: 1.5, style: 2, cargo: false,
    bbox: [-178, -98, 180, 60],
    slots: { lykt: [156, -36], horn: [126, -60], stotfanger: [176, 2], pynt: [-112, -62] },
    comment: 'En gammel boble! Den er både sterk og koselig.',
    draw(g) {
      const c = this.color;
      const pts = [
        ...bodyBottom(),
        [-170, -4], [-168, -28], [-154, -50], [-128, -62], [-98, -60], [-86, -50], [-80, -44],
        [40, -44], [50, -52], [62, -58], [96, -61], [126, -56], [150, -44], [166, -26], [174, -6], [172, 8],
      ];
      shape(g, pts, { fill: c, lw: 2.8, seed: 101 });
      // dør og detaljer
      stroke(g, [[-72, -40], [-74, 4]], { lw: 2, seed: 102 });
      stroke(g, [[34, -40], [36, 4]], { lw: 2, seed: 103 });
      stroke(g, [[-72, 4], [36, 4]], { lw: 1.8, seed: 104, ink: darken(c, 0.4) });
      rrect(g, -10, -30, 18, 5, 2, { fill: CHR, lw: 1.5, seed: 105 });
      stroke(g, [[-160, -24], [-80, -24]], { lw: 2.2, ink: lighten(c, 0.5), j: 0.3 });
      stroke(g, [[46, -24], [160, -20]], { lw: 2.2, ink: lighten(c, 0.5), j: 0.3 });
      // panser-ribber
      stroke(g, [[70, -54], [150, -40]], { lw: 1.6, ink: darken(c, 0.35), seed: 106 });
      // frontrute
      tube(g, [[50, -50], [36, -94]], 4, CHR, { seed: 107 });
      shape(g, [[48, -52], [35, -92], [24, -90], [36, -48]], { fill: GLASS, lw: 1.6, shade: false, blot: false, j: 0.2 });
      // runde skjermer
      stroke(g, arch(110, 16, 44).slice(2, -2), { lw: 2, ink: darken(c, 0.3), seed: 108 });
      stroke(g, arch(-105, 16, 44).slice(2, -2), { lw: 2, ink: darken(c, 0.3), seed: 109 });
    },
  },
  kar_pickup: {
    name: 'Pickup med lasteplan', color: '#5d8f4a', weight: 4, strength: 3, comfort: 0.5, style: 1, cargo: true,
    bbox: [-170, -116, 182, 60],
    slots: { lykt: [158, -38], horn: [118, -62], stotfanger: [178, 2], pynt: [-18, -112] },
    comment: 'Med lasteplan kan vi frakte ting!',
    draw(g) {
      const c = this.color;
      const pts = [
        ...bodyBottom(),
        [-166, -8], [-166, -50], [-64, -50], [-64, -104], [-52, -110], [18, -110], [46, -62],
        [100, -61], [146, -55], [166, -38], [176, -8], [172, 8],
      ];
      shape(g, pts, { fill: c, lw: 2.8, seed: 111 });
      cutGlass(g, [[-54, -100], [14, -100], [36, -64], [-54, -64]]);
      // lasteplanets kant
      rect(g, -166, -54, 102, 8, { fill: darken(c, 0.25), lw: 2, seed: 112 });
      for (let x = -150; x < -70; x += 22) stroke(g, [[x, -44], [x, 6]], { lw: 1.5, ink: darken(c, 0.3), seed: 113 + x });
      // dør
      stroke(g, [[-58, -60], [-58, 4], [40, 4], [40, -60]], { lw: 2, seed: 114 });
      rrect(g, 20, -50, 14, 5, 2, { fill: CHR, lw: 1.4, seed: 115 });
      // grill
      rect(g, 166, -34, 8, 28, { fill: CHR, lw: 1.6, seed: 116 });
      stroke(g, [[60, -50], [150, -46]], { lw: 1.6, ink: darken(c, 0.35), seed: 117 });
    },
  },
  kar_racer: {
    name: 'Racer-karosseri', color: '#cf2f2a', weight: 2, strength: 1, comfort: 0, style: 5, cargo: false, speed: 1.12,
    bbox: [-172, -92, 188, 60],
    slots: { lykt: [162, -22], horn: [104, -38], stotfanger: [184, 4], pynt: [-138, -84] },
    comment: 'Et ekte racer-karosseri! Det blir fort, det!',
    draw(g) {
      const c = this.color;
      const pts = [
        ...bodyBottom(36),
        [-166, -12], [-160, -34], [-150, -36], [-146, -82], [-128, -84], [-118, -40], [-88, -40], [-80, -34],
        [30, -34], [58, -40], [118, -34], [168, -18], [184, -4], [176, 8],
      ];
      shape(g, pts, { fill: c, lw: 2.8, seed: 121 });
      // stripe
      shape(g, [[-150, -26], [178, -12], [180, -6], [-152, -18]], { fill: '#fff6e0', lw: 1.6, seed: 122, shade: false });
      // startnummer
      circ(g, -20, -10, 16, { fill: '#fff6e0', lw: 2, seed: 123 });
      txt(g, '8', -20, -9, { size: 26, bold: true }); // 8 ser lik ut speilvendt (gården)
      // liten frontrute
      shape(g, [[44, -38], [30, -60], [22, -58], [32, -36]], { fill: GLASS, lw: 1.6, shade: false, blot: false });
      stroke(g, [[60, -36], [150, -24]], { lw: 1.6, ink: darken(c, 0.35), seed: 124 });
    },
  },
  kar_badekar: {
    name: 'Badekar', color: '#f4f1ea', weight: 3.5, strength: 2, comfort: 2.5, style: 4, cargo: true,
    bbox: [-160, -96, 160, 22],
    slots: { lykt: [148, -42], horn: [124, -68], stotfanger: [156, -6], pynt: [-128, -72] },
    comment: 'Et badekar! Det er jo både mykt og morsomt.',
    draw(g) {
      const c = this.color;
      // skumbobler
      const R = rand(7);
      for (let i = 0; i < 9; i++) circ(g, -90 + i * 18 + R() * 6, -70 - R() * 10, 9 + R() * 6, { fill: '#ffffff', lw: 1.6, seed: 130 + i, shade: false });
      // føtter
      for (const fx of [-120, 110]) shape(g, [[fx - 10, -6], [fx + 10, -6], [fx + 14, 12], [fx - 14, 12]], { fill: BRASS, lw: 2, seed: 131 + fx });
      const pts = [[-150, -62], [146, -62], [140, -30], [120, -6], [-120, -6], [-146, -30]];
      shape(g, pts, { fill: c, lw: 2.8, seed: 132 });
      rrect(g, -158, -70, 312, 12, 6, { fill: lighten(c, 0.3), lw: 2.2, seed: 133 });
      // kraner
      tube(g, [[-140, -70], [-140, -88], [-124, -88]], 4, CHR, { seed: 134 });
      circ(g, -146, -90, 5, { fill: '#d84b3a', lw: 1.5 });
      stroke(g, [[-120, -40], [110, -40]], { lw: 1.6, ink: 'rgba(120,140,160,0.5)', seed: 135 });
    },
  },
};

// ---------- motorer ----------
const ENGINES = {
  motor_totakt: {
    name: 'Liten totaktsmotor', power: 2, weight: 1, fuelUse: 0.5, style: 0,
    bbox: [-26, -30, 36, 28],
    comment: 'En liten totakter. Den durer som en moped!',
    draw(g) {
      rect(g, -20, -4, 40, 28, { fill: '#4f7fa8', seed: 201 });
      rect(g, -13, -20, 26, 17, { fill: MET, seed: 202 });
      for (let y = -16; y < -4; y += 4) stroke(g, [[-15, y], [15, y]], { lw: 1.4, seed: 203 + y });
      tube(g, [[0, -20], [0, -26]], 3, CHR, { seed: 204 });
      circ(g, 25, 8, 8, { fill: DMET, seed: 205 });
      circ(g, 25, 8, 3, { fill: CHR, lw: 1.2 });
    },
  },
  motor_v4: {
    name: 'Gammel firesylindret motor', power: 4, weight: 3, fuelUse: 1, style: 0,
    bbox: [-40, -54, 50, 28],
    comment: 'En god gammel motor. Den holder i mange år til!',
    draw(g) {
      rect(g, -34, -24, 66, 40, { fill: '#6f8070', seed: 211 });
      rect(g, -30, -36, 58, 13, { fill: DMET, seed: 212 });
      rect(g, -28, 16, 54, 9, { fill: '#454b50', seed: 213 });
      ell(g, -4, -44, 21, 7, { fill: '#3d4246', seed: 214 });
      for (let i = 0; i < 4; i++) circ(g, -22 + i * 14, -22, 2.6, { fill: CHR, lw: 1.3 });
      circ(g, 38, -2, 9, { fill: MET, seed: 215 });
      circ(g, 38, -2, 3, { fill: DMET, lw: 1.3 });
      stroke(g, [[-24, 2], [-10, 6], [4, 2], [18, 6]], { lw: 3, ink: '#7a4a2a', seed: 216 });
    },
  },
  motor_traktor: {
    name: 'Traktormotor', power: 6, weight: 5, fuelUse: 1.3, style: 1,
    bbox: [-40, -92, 44, 28],
    comment: 'En seig traktormotor. Den drar alt!',
    draw(g) {
      tube(g, [[-22, -30], [-22, -84]], 7, '#3a3a3a', { seed: 221 });
      rect(g, -27, -88, 10, 6, { fill: '#555', lw: 1.6 });
      rect(g, -32, -30, 64, 54, { fill: '#4f8a3c', seed: 222 });
      rect(g, -28, -42, 56, 13, { fill: darken('#4f8a3c', 0.25), seed: 223 });
      for (let i = 0; i < 3; i++) rect(g, -20 + i * 16, -12, 10, 26, { fill: darken('#4f8a3c', 0.15), lw: 1.4, seed: 224 + i });
      circ(g, 36, 0, 8, { fill: MET, seed: 227 });
    },
  },
  motor_v8: {
    name: 'Kraftig V8-motor', power: 9, weight: 5, fuelUse: 1.8, style: 2,
    bbox: [-46, -70, 58, 28],
    comment: 'Wroom! En ordentlig V8. Nå blir det fart!',
    draw(g) {
      rect(g, -38, -26, 76, 42, { fill: '#b8342b', seed: 231 });
      rect(g, -34, 16, 64, 9, { fill: '#3f3f44', seed: 232 });
      rrect(g, -37, -38, 35, 13, 5, { fill: CHR, seed: 233 });
      rrect(g, 2, -38, 35, 13, 5, { fill: CHR, seed: 234 });
      rect(g, -14, -56, 28, 18, { fill: DMET, seed: 235 });
      rect(g, -19, -66, 38, 10, { fill: '#2f2f33', seed: 236 });
      for (let i = 0; i < 4; i++) stroke(g, [[-30 + i * 8, -6], [-30 + i * 8, 8]], { lw: 1.4, ink: darken('#b8342b', 0.4) });
      circ(g, 46, -4, 10, { fill: MET, seed: 237 });
      circ(g, 46, -4, 3.5, { fill: DMET, lw: 1.3 });
      txt(g, 'V8', 14, -2, { size: 16, color: '#fff2c0', bold: true });
    },
  },
};

const PARTS_LIST = [];
function add(key, def) {
  def.key = key;
  PARTS_LIST.push(def);
  return def;
}

for (const [k, d] of Object.entries(ENGINES)) add(k, { slot: 'motor', ...d });
for (const [k, d] of Object.entries(BODIES)) add(k, { slot: 'karosseri', ...d });

// ---------- batterier ----------
add('batteri_lite', {
  name: 'Lite batteri', slot: 'batteri', weight: 1, style: 0,
  bbox: [-18, -22, 18, 14],
  comment: 'Et batteri, så motoren kan starte.',
  draw(g) {
    rect(g, -15, -12, 30, 24, { fill: '#33383c', seed: 301 });
    rect(g, -13, -4, 26, 6, { fill: '#e6c23a', lw: 1.4, seed: 302, shade: false });
    rect(g, -11, -18, 6, 6, { fill: '#c0392b', lw: 1.4 });
    rect(g, 5, -18, 6, 6, { fill: '#222', lw: 1.4 });
  },
});
add('batteri_stort', {
  name: 'Stort batteri', slot: 'batteri', weight: 1.5, style: 0, power: 0.5,
  bbox: [-23, -26, 23, 16],
  comment: 'Et kraftig batteri. Motoren får litt ekstra futt!',
  draw(g) {
    rect(g, -20, -16, 40, 30, { fill: '#2c4a7a', seed: 311 });
    rect(g, -18, -6, 36, 7, { fill: '#9fd0ff', lw: 1.4, seed: 312, shade: false });
    rect(g, -14, -22, 7, 6, { fill: '#c0392b', lw: 1.4 });
    rect(g, 7, -22, 7, 6, { fill: '#222', lw: 1.4 });
  },
});

// ---------- girkasser ----------
add('gir_3', {
  name: 'Tretrinns girkasse', slot: 'girkasse', weight: 1, gear: 1, style: 0,
  bbox: [-28, -18, 36, 18],
  comment: 'En girkasse med tre gir.',
  draw(g) {
    circ(g, -12, 0, 14, { fill: MET, seed: 401 });
    rect(g, -6, -9, 30, 18, { fill: MET, seed: 402 });
    tube(g, [[24, 0], [34, 0]], 4, DMET, { seed: 403 });
  },
});
add('gir_5', {
  name: 'Femtrinns girkasse', slot: 'girkasse', weight: 1.2, gear: 1.3, style: 1,
  bbox: [-28, -62, 36, 18],
  comment: 'Fem gir! Nå kan vi kjøre fortere.',
  draw(g) {
    tube(g, [[6, -6], [-2, -50]], 3, CHR, { seed: 411 });
    circ(g, -3, -54, 6, { fill: '#222', lw: 1.6 });
    circ(g, -12, 0, 14, { fill: '#a7b0b5', seed: 412 });
    rect(g, -6, -9, 30, 18, { fill: '#a7b0b5', seed: 413 });
    tube(g, [[24, 0], [34, 0]], 4, DMET, { seed: 414 });
  },
});

// ---------- bensintanker ----------
add('tank_kanne', {
  name: 'Bensinkanne', slot: 'tank', weight: 0.5, capacity: 60, style: 0,
  bbox: [-18, -30, 18, 20],
  comment: 'En bensinkanne. Det holder til en tur ut til fyret og hjem igjen.',
  draw(g) {
    rrect(g, -15, -20, 30, 38, 4, { fill: '#c0392b', seed: 501 });
    stroke(g, [[-11, -16], [11, 14]], { lw: 1.6, ink: darken('#c0392b', 0.35) });
    stroke(g, [[11, -16], [-11, 14]], { lw: 1.6, ink: darken('#c0392b', 0.35) });
    rrect(g, -10, -27, 14, 7, 3, { lw: 2.2, seed: 502 });
    rect(g, 7, -27, 6, 7, { fill: '#f0d040', lw: 1.5 });
  },
});
add('tank_tonne', {
  name: 'Oljetønne', slot: 'tank', weight: 1.5, capacity: 80, style: 0,
  bbox: [-23, -30, 23, 22],
  comment: 'En hel oljetønne med bensin!',
  draw(g) {
    rect(g, -20, -26, 40, 46, { fill: '#2e6ca8', seed: 511 });
    stroke(g, [[-20, -12], [20, -12]], { lw: 2.2 });
    stroke(g, [[-20, 6], [20, 6]], { lw: 2.2 });
    ell(g, 0, -26, 20, 4, { fill: lighten('#2e6ca8', 0.2), lw: 1.8 });
  },
});
add('tank_stor', {
  name: 'Stor bensintank', slot: 'tank', weight: 1.2, capacity: 120, style: 1,
  bbox: [-36, -24, 36, 18],
  comment: 'En stor tank. Nå kan vi kjøre kjempelangt!',
  draw(g) {
    rrect(g, -34, -14, 68, 30, 14, { fill: CHR, seed: 521 });
    stroke(g, [[-14, -14], [-14, 16]], { lw: 2 });
    stroke(g, [[14, -14], [14, 16]], { lw: 2 });
    rect(g, 4, -21, 10, 7, { fill: '#e2b422', lw: 1.6 });
  },
});

// ---------- seter ----------
add('sete_kasse', {
  name: 'Trekasse', slot: 'sete', weight: 0.5, comfort: 0, style: 0,
  bbox: [-24, -14, 24, 20],
  comment: 'En trekasse å sitte på. Litt hard i baken...',
  draw(g) {
    rect(g, -22, -12, 44, 30, { fill: WOOD, seed: 601 });
    stroke(g, [[-22, -2], [22, -2]], { lw: 1.6 });
    stroke(g, [[-22, 8], [22, 8]], { lw: 1.6 });
    stroke(g, [[-14, -10], [-14, 16]], { lw: 1.2, ink: darken(WOOD, 0.3) });
  },
});
add('sete_bil', {
  name: 'Bilsete', slot: 'sete', weight: 1, comfort: 2, style: 1,
  bbox: [-34, -62, 28, 20],
  comment: 'Et ordentlig bilsete. Det er godt å sitte i!',
  draw(g) {
    const c = '#7b4a2e';
    rect(g, -14, 8, 28, 10, { fill: DMET, seed: 611 });
    shape(g, [[-32, -56], [-18, -58], [-12, 2], [-26, 4]], { fill: c, seed: 612 });
    rrect(g, -26, -6, 52, 16, 6, { fill: c, seed: 613 });
    stroke(g, [[-20, -46], [-16, -6]], { lw: 1.4, ink: lighten(c, 0.3) });
  },
});
add('sete_sofa', {
  name: 'Blomstersofa', slot: 'sete', weight: 2.5, comfort: 4, style: 2,
  bbox: [-44, -58, 46, 20],
  comment: 'Bestemors gamle sofa! Det er som å kjøre i en sky.',
  draw(g) {
    const c = '#c96a8c';
    rrect(g, -44, -54, 18, 62, 8, { fill: c, seed: 621 });
    rrect(g, -38, -6, 76, 22, 8, { fill: c, seed: 622 });
    circ(g, 34, -6, 10, { fill: lighten(c, 0.1), seed: 623 });
    const R = rand(5);
    for (let i = 0; i < 9; i++) {
      const x = -36 + R() * 66, y = -2 + R() * 12;
      circ(g, x, y, 2.6, { fill: '#fff3a0', lw: 1, shade: false, blot: false });
    }
    for (let i = 0; i < 4; i++) circ(g, -36 + R() * 6, -46 + i * 12, 2.4, { fill: '#fff3a0', lw: 1, shade: false, blot: false });
  },
});

// ---------- ratt ----------
function steering(g, color, seed) {
  tube(g, [[6, 4], [24, 38]], 4, DMET, { seed });
  const pts = rot(ellPts(0, 0, 5, 19, 0, Math.PI * 2, 18), -0.3);
  g.save();
  g.lineWidth = 6;
  g.strokeStyle = color;
  g.lineJoin = 'round';
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.stroke();
  g.restore();
  shape(g, rot(ellPts(0, 0, 8, 22, 0, Math.PI * 2, 18), -0.3), { lw: 2, seed: seed + 1 });
  shape(g, rot(ellPts(0, 0, 2.5, 16, 0, Math.PI * 2, 14), -0.3), { lw: 1.6, seed: seed + 2 });
}
add('ratt_vanlig', {
  name: 'Ratt', slot: 'ratt', weight: 0.2, style: 0,
  bbox: [-14, -26, 30, 44],
  comment: 'Et ratt, så vi kan svinge.',
  draw(g) { steering(g, '#2a2a2a', 701); },
});
add('ratt_gull', {
  name: 'Gyllent ratt', slot: 'ratt', weight: 0.3, style: 3,
  bbox: [-14, -26, 30, 44],
  comment: 'Et gyllent ratt! Så fint det skinner.',
  draw(g) { steering(g, '#e4b83a', 711); },
});
add('ratt_styre', {
  name: 'Sykkelstyre', slot: 'ratt', weight: 0.2, style: 1,
  bbox: [-24, -24, 30, 44],
  comment: 'Et sykkelstyre! Det går an, det også.',
  draw(g) {
    tube(g, [[4, -4], [24, 38]], 4, DMET, { seed: 721 });
    tube(g, [[-16, -14], [-4, -8], [8, -8], [10, -14]], 4, CHR, { seed: 722 });
    rrect(g, -22, -20, 10, 9, 4, { fill: '#222', lw: 1.6 });
  },
});

// ---------- hjul ----------
add('hjul_vanlig', wheel('hjul_vanlig', 'Vanlig hjul', {
  r: 30, look: 'vanlig', rim: '#c9473b', weight: 1, grip: 3, speed: 1, strength: 1.5, comfort: 1,
  comment: 'Et helt vanlig hjul. Det ruller fint.',
}));
add('hjul_sykkel', wheel('hjul_sykkel', 'Sykkelhjul', {
  r: 27, look: 'sykkel', weight: 0.3, grip: 1, speed: 1.08, strength: 0, comfort: 0,
  comment: 'Et sykkelhjul! Lett, men litt skjørt.',
}));
add('hjul_traktor', wheel('hjul_traktor', 'Traktorhjul', {
  r: 40, look: 'traktor', weight: 2, grip: 8, speed: 0.8, strength: 3, comfort: 0.5,
  comment: 'Store traktorhjul! De kommer seg gjennom alt.',
}));
add('hjul_racer', wheel('hjul_racer', 'Racerhjul', {
  r: 30, look: 'racer', rim: '#e8e8e8', weight: 0.8, grip: 4, speed: 1.3, strength: 1, comfort: 0.5, style: 1,
  comment: 'Racerhjul! Wroom!',
}));
add('hjul_tre', wheel('hjul_tre', 'Vognhjul av tre', {
  r: 34, look: 'tre', weight: 1.2, grip: 2, speed: 0.8, strength: 1, comfort: 0, style: 1,
  comment: 'Et gammelt vognhjul av tre. Det skrangler!',
}));

// ---------- eksos ----------
add('eksos_vanlig', {
  name: 'Eksosrør', slot: 'eksos', weight: 0.4, comfort: 1, style: 0,
  bbox: [-30, -10, 26, 12],
  comment: 'Et eksosrør. Da bråker det ikke så fælt.',
  draw(g) {
    tube(g, [[22, 0], [6, 2], [-24, 2]], 6, MET, { seed: 801 });
    rrect(g, -6, -5, 22, 12, 5, { fill: DMET, seed: 802 });
    ell(g, -25, 2, 2.5, 4, { fill: '#222', lw: 1.4 });
  },
});
add('eksos_sport', {
  name: 'Sportseksos', slot: 'eksos', weight: 0.6, comfort: 1, style: 2, power: 0.5,
  bbox: [-36, -14, 26, 14],
  comment: 'Sportseksos! Hør så tøft det låter!',
  draw(g) {
    tube(g, [[22, -4], [-30, -4]], 6, CHR, { seed: 811 });
    tube(g, [[22, 6], [-30, 6]], 6, CHR, { seed: 812 });
    ell(g, -31, -4, 2.5, 4, { fill: '#222', lw: 1.4 });
    ell(g, -31, 6, 2.5, 4, { fill: '#222', lw: 1.4 });
  },
});

// ---------- lykter ----------
function lamp(g, y, seed) {
  circ(g, 0, y, 11, { fill: CHR, seed });
  ell(g, 5, y, 5, 9, { fill: '#ffe680', lw: 1.6, seed: seed + 1, shade: false });
}
add('lykt_enkel', {
  name: 'Lykt', slot: 'lykt', weight: 0.3, style: 1, light: 1,
  bbox: [-14, -14, 16, 18],
  comment: 'En lykt! Nå kan vi kjøre i mørket.',
  draw(g) {
    rect(g, -10, 6, 7, 10, { fill: DMET, lw: 1.5 });
    lamp(g, 0, 901);
  },
});
add('lykt_dobbel', {
  name: 'Dobbel lykt', slot: 'lykt', weight: 0.5, style: 2, light: 2,
  bbox: [-14, -24, 16, 26],
  comment: 'To lykter! Det lyser som en fyrstikkeske... nei, som et fyr!',
  draw(g) {
    rect(g, -12, -10, 7, 34, { fill: DMET, lw: 1.5 });
    lamp(g, -11, 911);
    lamp(g, 11, 913);
  },
});

// ---------- horn ----------
add('horn_tut', {
  name: 'Tutehorn', slot: 'horn', weight: 0.2, style: 1,
  bbox: [-20, -30, 36, 6],
  comment: 'Et tutehorn! Tut-tut! (Trykk H når du kjører.)',
  draw(g) {
    tube(g, [[0, 0], [0, -12], [12, -16], [20, -16]], 4, BRASS, { seed: 1001 });
    shape(g, [[18, -21], [32, -28], [32, -4], [18, -11]], { fill: BRASS, lw: 2, seed: 1002 });
    circ(g, -6, -16, 9, { fill: '#c0392b', seed: 1003 });
  },
});
add('horn_elg', {
  name: 'Elgehorn', slot: 'horn', weight: 0.5, style: 3,
  bbox: [-40, -56, 40, 4],
  comment: 'Et elgehorn! Det brøler som en elg i skogen.',
  draw(g) {
    const c = '#dcc193';
    for (const s of [-1, 1]) {
      const pts = [
        [0, 0], [s * 8, -10], [s * 14, -14], [s * 18, -34], [s * 22, -16], [s * 28, -46], [s * 32, -22],
        [s * 38, -40], [s * 36, -12], [s * 20, -4], [s * 4, 2],
      ];
      shape(g, pts.map(([x, y]) => [x, y]), { fill: c, seed: 1010 + s, j: 0.6 });
    }
    rrect(g, -6, -6, 12, 10, 3, { fill: DMET, lw: 1.6 });
  },
});

// ---------- støtfangere ----------
add('stot_vanlig', {
  name: 'Støtfanger', slot: 'stotfanger', weight: 0.5, strength: 1.5, style: 0,
  bbox: [-10, -20, 12, 18],
  comment: 'En støtfanger gjør bilen sterkere.',
  draw(g) {
    rrect(g, -6, -16, 14, 30, 6, { fill: CHR, seed: 1101 });
  },
});
add('stot_kufanger', {
  name: 'Kufanger', slot: 'stotfanger', weight: 1, strength: 3, style: 1,
  bbox: [-14, -38, 24, 20],
  comment: 'En kufanger! Nå tåler bilen nesten hva som helst.',
  draw(g) {
    tube(g, [[-8, -30], [10, -30], [16, -12], [16, 14], [-8, 14]], 5, '#3a3d40', { seed: 1111 });
    tube(g, [[10, -30], [10, 14]], 4, '#3a3d40', { seed: 1112 });
    tube(g, [[-8, -8], [16, -8]], 4, '#3a3d40', { seed: 1113 });
  },
});

// ---------- pynt ----------
add('pynt_flagg', {
  name: 'Flagg', slot: 'pynt', weight: 0.2, style: 2,
  bbox: [-6, -64, 42, 4],
  comment: 'Et flagg! Det blafrer så fint.',
  draw(g) {
    tube(g, [[0, 0], [0, -60]], 2.5, '#bbb', { seed: 1201, shine: false });
    shape(g, [[2, -60], [38, -58], [36, -36], [2, -38]], { fill: '#c8202e', lw: 2, seed: 1202, shade: false });
    shape(g, [[12, -59], [18, -59], [18, -37], [12, -37]], { fill: '#fff', ink: null, seed: 1203, shade: false, blot: false, j: 0.1 });
    shape(g, [[2, -51], [37, -50], [37, -45], [2, -46]], { fill: '#fff', ink: null, seed: 1204, shade: false, blot: false, j: 0.1 });
    shape(g, [[14, -59], [16, -59], [16, -37], [14, -37]], { fill: '#1f3a8a', ink: null, seed: 1205, shade: false, blot: false, j: 0.05 });
    shape(g, [[2, -49], [37, -48.5], [37, -46.5], [2, -47]], { fill: '#1f3a8a', ink: null, seed: 1206, shade: false, blot: false, j: 0.05 });
    shape(g, [[2, -60], [38, -58], [36, -36], [2, -38]], { lw: 2, seed: 1202 });
  },
});
add('pynt_blomst', {
  name: 'Solsikke', slot: 'pynt', weight: 0.3, style: 2,
  bbox: [-24, -68, 24, 4],
  comment: 'En solsikke i potte! Så koselig.',
  draw(g) {
    tube(g, [[0, -14], [2, -40]], 3, '#4f8a3c', { seed: 1211, shine: false });
    ell(g, 9, -28, 8, 4, { fill: '#5fa04a', lw: 1.5 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ell(g, 2 + Math.cos(a) * 12, -48 + Math.sin(a) * 12, 6, 6, { fill: '#f2c21b', lw: 1.4, seed: 1212 + i, shade: false });
    }
    circ(g, 2, -48, 9, { fill: '#6b3d1e', lw: 1.6 });
    shape(g, [[-12, -16], [12, -16], [9, 2], [-9, 2]], { fill: '#c0643a', seed: 1230 });
  },
});
add('pynt_antenne', {
  name: 'Antenne', slot: 'pynt', weight: 0.1, style: 1,
  bbox: [-8, -82, 16, 4],
  comment: 'En antenne! Nå kan vi høre radio.',
  draw(g) {
    stroke(g, [[0, 0], [6, -74]], { lw: 2, j: 0.3 });
    circ(g, 6, -76, 5, { fill: '#e04040', lw: 1.5 });
    rect(g, -4, -6, 8, 6, { fill: DMET, lw: 1.4 });
  },
});
add('pynt_stjerne', {
  name: 'Gullstjerne', slot: 'pynt', weight: 0.2, style: 3,
  bbox: [-22, -70, 22, 4],
  comment: 'En gullstjerne fra fjelltoppen!',
  draw(g) {
    tube(g, [[0, 0], [0, -30]], 2.5, '#bbb', { seed: 1301, shine: false });
    shape(g, star(0, -48, 20, 9), { fill: '#f4c430', seed: 1302, j: 0.4 });
  },
});

export const PARTS = Object.fromEntries(PARTS_LIST.map((d) => [d.key, d]));

// Bøyde former til replikker: [bestemt, ubestemt] («bensinkanna», «ei bensinkanne»).
const FORMS = {
  motor_totakt: ['den lille totaktsmotoren', 'en liten totaktsmotor'],
  motor_v4: ['den gamle motoren', 'en gammel firesylindret motor'],
  motor_traktor: ['traktormotoren', 'en traktormotor'],
  motor_v8: ['V8-motoren', 'en kraftig V8-motor'],
  kar_boble: ['boble-karosseriet', 'et boble-karosseri'],
  kar_pickup: ['pickupen', 'en pickup med lasteplan'],
  kar_racer: ['racer-karosseriet', 'et racer-karosseri'],
  kar_badekar: ['badekaret', 'et badekar'],
  batteri_lite: ['det lille batteriet', 'et lite batteri'],
  batteri_stort: ['det store batteriet', 'et stort batteri'],
  gir_3: ['girkassa', 'en tretrinns girkasse'],
  gir_5: ['femtrinns-girkassa', 'en femtrinns girkasse'],
  tank_kanne: ['bensinkanna', 'ei bensinkanne'],
  tank_tonne: ['oljetønna', 'ei oljetønne'],
  tank_stor: ['den store bensintanken', 'en stor bensintank'],
  sete_kasse: ['trekassa', 'ei trekasse'],
  sete_bil: ['bilsetet', 'et bilsete'],
  sete_sofa: ['blomstersofaen', 'en blomstersofa'],
  ratt_vanlig: ['rattet', 'et ratt'],
  ratt_gull: ['det gylne rattet', 'et gyllent ratt'],
  ratt_styre: ['sykkelstyret', 'et sykkelstyre'],
  hjul_vanlig: ['hjulet', 'et vanlig hjul'],
  hjul_sykkel: ['sykkelhjulet', 'et sykkelhjul'],
  hjul_traktor: ['traktorhjulet', 'et traktorhjul'],
  hjul_racer: ['racerhjulet', 'et racerhjul'],
  hjul_tre: ['vognhjulet', 'et vognhjul av tre'],
  eksos_vanlig: ['eksosrøret', 'et eksosrør'],
  eksos_sport: ['sportseksosen', 'en sportseksos'],
  lykt_enkel: ['lykta', 'ei lykt'],
  lykt_dobbel: ['den doble lykta', 'ei dobbel lykt'],
  horn_tut: ['tutehornet', 'et tutehorn'],
  horn_elg: ['elgehornet', 'et elgehorn'],
  stot_vanlig: ['støtfangeren', 'en støtfanger'],
  stot_kufanger: ['kufangeren', 'en kufanger'],
  pynt_flagg: ['flagget', 'et flagg'],
  pynt_blomst: ['solsikka', 'ei solsikke'],
  pynt_antenne: ['antenna', 'ei antenne'],
  pynt_stjerne: ['gullstjerna', 'ei gullstjerne'],
};
for (const d of PARTS_LIST) {
  const f = FORMS[d.key] || [d.name.toLowerCase(), d.name.toLowerCase()];
  d.def = f[0];
  d.indef = f[1];
}

// Chassiset er alltid i garasjen og kan ikke flyttes.
export const CHASSIS = {
  key: 'chassi',
  bbox: [-164, -12, 166, 22],
  draw(g) {
    rrect(g, -158, -6, 318, 12, 4, { fill: '#4a5157', seed: 1401 });
    for (const x of [-140, -60, 20, 90, 150]) stroke(g, [[x, -5], [x, 5]], { lw: 1.6, ink: '#7f888e' });
    // bladfjærer ved akslingene
    for (const cx of [110, -105]) {
      stroke(g, [[cx - 24, 6], [cx - 10, 13], [cx + 10, 13], [cx + 24, 6]], { lw: 3, j: 0.3, seed: 1402 + cx });
      rect(g, cx - 5, 6, 10, 12, { fill: '#3a3f44', lw: 1.6, seed: 1403 + cx });
    }
    bolts(g, [[-150, 0], [152, 0], [0, 0]]);
  },
};

export const SLOT_NAMES = {
  motor: 'motor', batteri: 'batteri', girkasse: 'girkasse', tank: 'bensintank', sete: 'sete', ratt: 'ratt',
  forhjul: 'forhjul', bakhjul: 'bakhjul', karosseri: 'karosseri', eksos: 'eksos', lykt: 'lykt', horn: 'horn',
  stotfanger: 'støtfanger', pynt: 'pynt',
};

