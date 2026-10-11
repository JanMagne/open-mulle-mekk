// Garasjen: dra deler fra gulvet og fest dem på chassiset.
import { game } from '../game.js';
import { layer, shape, rect, stroke, circ, ell, ellPts, txt, rand, darken, hatch, grain, tube, INK } from '../engine/draw.js';
import { bigArrow, inside, statIcon } from '../game/ui.js';
import { drawPerson, drawDog, drawPhone, LOOKS } from '../game/characters.js';
import { drawCar, carHit, drawPart, hitPart, partShadow } from '../game/carRender.js';
import { stats, slotDefs, attach, detach, markDrivable } from '../game/car.js';
import { PARTS } from '../data/parts.js';
import { state, partsAt, movePart, save } from '../game/state.js';
import { talk } from '../engine/talk.js';
import { audio } from '../engine/audio.js';
import { hint, figgeCall } from '../game/missions.js';

let bg = null;
const CAR_X = 400;
const GROUND = 452;
const DOOR_YARD = { x: 0, y: 60, w: 78, h: 270 };
const DOOR_JUNK = { x: 722, y: 60, w: 78, h: 270 };
const PHONE = { x: 452, y: 70, w: 64, h: 100 };
const MULLE = { x: 95, y: 240, w: 80, h: 160 };
const PRAISE = ['Sånn ja!', 'Den passet perfekt!', 'Flott!', 'Det ble fint!', 'Klikk-klakk, der satt den!'];

function makeBg() {
  return layer(800, 600, 2, (g) => {
    // bakvegg av planker
    rect(g, -5, -5, 810, 320, { fill: '#d6a65c', lw: 0, ink: null, seed: 1, blot: true });
    for (let x = 0; x < 800; x += 34) stroke(g, [[x, 0], [x + 2, 306]], { lw: 1.6, ink: darken('#d6a65c', 0.3), j: 0.8, seed: x });
    hatch(g, 0, 0, 800, 300, 'rgba(120,70,20,0.10)', 2, 400, 18, Math.PI / 2, 1.2, 0.1);
    stroke(g, [[0, 306], [800, 302]], { lw: 3, j: 1 });
    // gulv
    shape(g, [[-10, 304], [810, 300], [810, 610], [-10, 610]], { fill: '#cdb68c', lw: 0, ink: null, seed: 3, step: 50, j: 3 });
    grain(g, 0, 300, 800, 300, 4, 3000, 0.06);
    const R = rand(5);
    for (let i = 0; i < 7; i++) ell(g, 120 + R() * 560, 340 + R() * 240, 20 + R() * 40, 6 + R() * 10, { fill: 'rgba(90,70,50,0.12)', ink: null, shade: false, blot: false });
    // vindu
    rect(g, 330, 36, 104, 84, { fill: '#a9d8ec', seed: 6 });
    tree(g, 360, 120);
    stroke(g, [[382, 36], [382, 120]], { lw: 3 });
    stroke(g, [[330, 78], [434, 78]], { lw: 3 });
    rect(g, 324, 118, 116, 8, { fill: '#8a5a2b' });
    // verktøytavle
    rect(g, 104, 36, 196, 112, { fill: '#e9d3a3', seed: 7 });
    for (let i = 0; i < 40; i++) circ(g, 114 + (i % 10) * 19, 46 + Math.floor(i / 10) * 26, 1.4, { fill: '#7a5a3a', ink: null, shade: false, blot: false });
    tube(g, [[124, 60], [124, 110]], 4, '#8f989e', { seed: 8 });
    rect(g, 116, 52, 16, 12, { fill: '#5b636a', lw: 1.6 });
    tube(g, [[150, 56], [170, 120]], 4, '#8f989e', { seed: 9 });
    tube(g, [[178, 120], [196, 56]], 4, '#8f989e', { seed: 10 });
    shape(g, [[204, 60], [236, 60], [232, 72], [208, 72]], { fill: '#c0392b', seed: 11 });
    tube(g, [[220, 72], [220, 128]], 5, '#7a4f2e', { seed: 12 });
    circ(g, 266, 92, 22, { lw: 4, ink: '#2e2c30' });
    // arbeidsbenk
    rect(g, 96, 176, 214, 18, { fill: '#a46d3a', seed: 13 });
    rect(g, 104, 194, 12, 100, { fill: '#8a5a2b' });
    rect(g, 290, 194, 12, 100, { fill: '#8a5a2b' });
    rect(g, 130, 196, 70, 54, { fill: '#5d8f4a', seed: 14 });
    stroke(g, [[130, 222], [200, 222]], { lw: 1.6 });
    rect(g, 156, 206, 18, 6, { fill: '#d3dce1', lw: 1.2 });
    rect(g, 156, 232, 18, 6, { fill: '#d3dce1', lw: 1.2 });
    rect(g, 216, 150, 40, 26, { fill: '#c0392b', seed: 15 });
    rect(g, 260, 158, 30, 18, { fill: '#5b636a', seed: 16 });
    circ(g, 140, 166, 10, { fill: '#e2b422', seed: 17 });
    // dører
    for (const [x, flip] of [[0, 1], [722, -1]]) {
      const pts = flip > 0 ? [[0, 56], [76, 70], [76, 318], [0, 330]] : [[800, 56], [724, 70], [724, 318], [800, 330]];
      shape(g, pts, { fill: '#5d8f4a', seed: 20 + x });
      const mx = flip > 0 ? 38 : 762;
      stroke(g, [[mx, 66], [mx, 322]], { lw: 1.6, ink: darken('#5d8f4a', 0.35) });
      stroke(g, flip > 0 ? [[4, 70], [72, 314]] : [[796, 70], [728, 314]], { lw: 4, ink: '#f2eee4', j: 0.4 });
    }
    // oljefat og dekk i hjørnet
    rect(g, 690, 250, 30, 50, { fill: '#2e6ca8', seed: 30 });
  });
}

function tree(g, x, y) {
  circ(g, x + 20, y - 40, 22, { fill: '#5c9b40', lw: 1.6, seed: 91 });
  circ(g, x + 50, y - 30, 18, { fill: '#4f8f3a', lw: 1.6, seed: 92 });
}

export const garageScene = {
  t: 0,
  drag: null,
  hotSlot: null,
  carInfo: null,
  ringT: 0,
  cursor: null,

  enter(params = {}) {
    if (!bg) bg = makeBg();
    this.t = 0;
    this.drag = null;
    this.st = stats();
    this.ringT = 0;
    if (state.figgePending) {
      audio.ring();
      talk.say('mulle', 'Telefonen ringer! Klikk på den, så svarer jeg.');
    } else if (params.from === 'yard' && !this.st.drivable && !Object.keys(state.car).length) {
      talk.lines([
        { who: 'mulle', text: 'Her er garasjen min. På gulvet står chassiset – det er starten på en bil.' },
        { who: 'mulle', text: 'Vi trenger deler! Gå gjennom døra til høyre for å komme til skraphaugen.' },
      ]);
    }
  },

  update(dt) {
    this.t += dt;
    if (state.figgePending) {
      this.ringT += dt;
      if (this.ringT > 2.6) {
        this.ringT = 0;
        if (!talk.busy()) audio.ring();
      }
    }
  },

  floorParts() {
    return partsAt('garage').sort((a, b) => a.y - b.y);
  },

  draw(g) {
    g.drawImage(bg, 0, 0, 800, 600);
    const t = this.t;
    const ringing = state.figgePending && this.ringT < 0.9 ? this.ringT + 0.01 : 0;
    drawPhone(g, 484, 118, 1, ringing);
    this.drawBoard(g);
    if (state.figgePending) this.drawRingFx(g, 484, 110);

    const hotDoorYard = !this.drag && inside(game.mouse, DOOR_YARD);
    const hotDoorJunk = inside(game.mouse, DOOR_JUNK);
    bigArrow(g, 40, 200, 'left', hotDoorYard, t);
    bigArrow(g, 760, 200, 'right', hotDoorJunk, t);
    txt(g, 'Gården', 40, 240, { size: 18, color: '#fff6d8', outline: INK, olw: 4 });
    txt(g, 'Skrap', 760, 240, { size: 18, color: '#fff6d8', outline: INK, olw: 4 });

    drawPerson(g, LOOKS.mulle, 136, 398, 0.78, t, talk.talking('mulle'));

    const parts = this.floorParts().filter((p) => !this.drag || p !== this.drag.part);
    const behind = parts.filter((p) => p.y < GROUND - 20);
    const front = parts.filter((p) => p.y >= GROUND - 20);
    for (const p of behind) {
      partShadow(g, p.key, p.x, p.y);
      drawPart(g, p.key, p.x, p.y);
    }
    const dragDef = this.drag ? this.drag.def : null;
    this.carInfo = drawCar(g, CAR_X, GROUND, 1, {
      showSlots: dragDef ? dragDef.slot : null,
      hotSlot: this.hotSlot,
      t,
    });
    for (const p of front) {
      partShadow(g, p.key, p.x, p.y);
      drawPart(g, p.key, p.x, p.y);
    }
    drawDog(g, 690, 420, 0.5, t, { flip: true });

    if (this.drag) {
      const d = this.drag;
      g.save();
      g.globalAlpha = 0.25;
      partShadow(g, d.part.key, d.x + 6, d.y + 16, 1.04);
      g.restore();
      drawPart(g, d.part.key, d.x, d.y, 1.05);
    }
  },

  // Synlig ringing: glød, lydbølger og «RING!» rundt telefonen.
  drawRingFx(g, x, y) {
    const k = this.ringT;
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 5);
    g.save();
    const gr = g.createRadialGradient(x, y, 10, x, y, 80);
    gr.addColorStop(0, 'rgba(255,236,120,0.08)');
    gr.addColorStop(0.45, `rgba(255,236,120,${0.3 + pulse * 0.25})`);
    gr.addColorStop(1, 'rgba(255,236,120,0)');
    g.fillStyle = gr;
    g.fillRect(x - 80, y - 80, 160, 160);
    g.restore();
    if (k > 0.9) return;
    for (const side of [-1, 1]) {
      const base = side > 0 ? 0 : Math.PI;
      for (let i = 0; i < 3; i++) {
        const r = 38 + i * 13 + ((k * 50) % 13);
        g.save();
        g.globalAlpha = Math.max(0, 1 - i * 0.3 - k * 0.6);
        stroke(g, ellPts(x, y, r, r, base - 0.55, base + 0.55, 6), { lw: 3.2, ink: '#c8322b', j: 0.4, seed: 40 + i });
        g.restore();
      }
      const hop = Math.abs(Math.sin(k * 14)) * 6;
      g.save();
      g.translate(x + side * 62, y - 62 - hop);
      g.rotate(side * 0.25);
      txt(g, 'RING!', 0, 0, { size: 24, color: '#c8322b', outline: '#fff6d8', olw: 5, bold: true });
      g.restore();
    }
  },

  drawBoard(g) {
    const x = 548, y = 22, w = 158, h = 222;
    rect(g, x, y, w, h, { fill: '#2f4a3a', seed: 81, lw: 3 });
    rect(g, x - 6, y - 6, w + 12, 8, { fill: '#8a5a2b', lw: 2 });
    txt(g, 'Bilen vår', x + w / 2, y + 16, { size: 20, color: '#f6f1e0' });
    const st = this.st;
    const rows = [
      ['fart', 'Fart', st.motorKey ? st.topSpeed / 160 : 0],
      ['kraft', 'Kraft', Math.min(1, st.climb / 0.6)],
      ['styrke', 'Styrke', Math.min(1, st.strength / 9)],
      ['komfort', 'Komfort', Math.min(1, st.comfort / 9)],
      ['grep', 'Grep', Math.min(1, st.grip / 8)],
      ['tank', 'Tank', Math.min(1, st.capacity / 120)],
    ];
    rows.forEach(([icon, label, v], i) => {
      const ry = y + 42 + i * 24;
      g.save();
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.beginPath();
      g.arc(x + 16, ry, 10, 0, Math.PI * 2);
      g.fill();
      g.restore();
      statIcon(g, icon, x + 16, ry);
      txt(g, label, x + 32, ry, { size: 15, color: '#f6f1e0', align: 'left' });
      g.fillStyle = 'rgba(255,255,255,0.15)';
      g.fillRect(x + 86, ry - 5, 62, 10);
      g.fillStyle = ['#e2463a', '#7fc06a', '#b9c3c9', '#e88ab0', '#f2c94c', '#f08a4b'][i];
      g.fillRect(x + 86, ry - 5, 62 * Math.max(0, Math.min(1, v)), 10);
    });
    const yy = y + 42 + 6 * 24;
    const flags = [['Lys', st.lights], ['Horn', !!st.horn], ['Last', st.cargo]];
    flags.forEach(([l, on], i) => {
      txt(g, (on ? '✔ ' : '· ') + l, x + 12 + i * 50, yy, { size: 15, color: on ? '#bff0a0' : 'rgba(246,241,224,0.45)', align: 'left' });
    });
    if (st.drivable) {
      txt(g, 'Klar til å kjøre!', x + w / 2, yy + 26, { size: 18, color: '#ffe27a' });
    } else {
      txt(g, 'Mangler: ' + st.missing.slice(0, 2).join(', ') + (st.missing.length > 2 ? '…' : ''), x + w / 2, yy + 26, { size: 15, color: '#ffb4a0', maxW: w - 10 });
    }
  },

  speakerAnchor(who) {
    if (who === 'figge') return { x: 484, y: 70 };
    return { x: 140, y: 250 };
  },

  // ---------- treff ----------
  partAt(p) {
    const parts = this.floorParts();
    const front = parts.filter((q) => q.y >= GROUND - 20).reverse();
    const behind = parts.filter((q) => q.y < GROUND - 20).reverse();
    for (const q of front) if (hitPart(q.key, q.x, q.y, 1, p.x, p.y)) return { part: q, from: 'floor' };
    if (this.carInfo) {
      const it = carHit(this.carInfo, p.x, p.y);
      if (it) return { part: it.part, from: 'car', slot: it.slot, x: this.carInfo.cx + it.x, y: this.carInfo.oy + it.y };
    }
    for (const q of behind) if (hitPart(q.key, q.x, q.y, 1, p.x, p.y)) return { part: q, from: 'floor' };
    return null;
  },

  hover(p) {
    if (this.drag) return { label: null, cursor: 'pointer' };
    if (inside(p, PHONE)) return { label: state.figgePending ? 'Telefonen ringer!' : 'Telefonen' };
    const h = this.partAt(p);
    if (h) return { label: PARTS[h.part.key].name };
    if (inside(p, DOOR_YARD)) return { label: 'Ut på gården' };
    if (inside(p, DOOR_JUNK)) return { label: 'Til skraphaugen' };
    if (inside(p, MULLE)) return { label: 'Mulle' };
    return null;
  },

  pointerdown(p) {
    const h = this.partAt(p);
    if (h) {
      let ax = h.part.x, ay = h.part.y;
      if (h.from === 'car') {
        ax = h.x;
        ay = h.y;
        detach(h.slot, ax, ay);
        this.refresh();
      }
      this.drag = { part: h.part, def: PARTS[h.part.key], ox: ax - p.x, oy: ay - p.y, x: ax, y: ay };
      this.cursor = 'grabbing';
      audio.pick();
      return;
    }
    if (inside(p, PHONE)) {
      if (state.figgePending) {
        talk.clear();
        const lines = figgeCall();
        if (lines) talk.lines(lines.map((l) => ({ ...l, name: l.who === 'figge' ? 'Figge Ferrum (i telefonen)' : undefined })));
      } else {
        talk.clear();
        talk.say('mulle', 'Ingen ringer akkurat nå. Figge ringer når han har nye deler.');
      }
      return;
    }
    if (inside(p, DOOR_YARD)) return game.go('yard', { from: 'garage' });
    if (inside(p, DOOR_JUNK)) return game.go('junkyard', { pile: 0 });
    if (inside(p, MULLE)) {
      talk.clear();
      talk.say('mulle', hint());
    }
  },

  pointermove(p) {
    if (!this.drag) return;
    const d = this.drag;
    d.x = p.x + d.ox;
    d.y = p.y + d.oy;
    this.hotSlot = this.findSlot(d);
  },

  findSlot(d) {
    const info = this.carInfo;
    if (!info) return null;
    let best = null;
    let bestD = d.def.slot === 'karosseri' ? 110 : 70;
    for (const [name, sd] of Object.entries(slotDefs())) {
      if (sd.accepts !== d.def.slot) continue;
      const sx = info.cx + sd.x * info.s;
      const sy = info.oy + sd.y * info.s;
      const dist = Math.hypot(d.x - sx, d.y - sy);
      // foretrekk ledige plasser litt
      const adj = dist + (state.car[name] ? 18 : 0);
      if (adj < bestD) {
        bestD = adj;
        best = name;
      }
    }
    return best;
  },

  pointerup(p) {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;
    this.cursor = null;
    const slot = this.findSlot(d);
    this.hotSlot = null;
    if (inside(p, DOOR_JUNK)) {
      movePart(d.part, 'pile1');
      audio.whoosh();
      talk.clear();
      talk.say('mulle', `Jeg legger ${d.def.name.toLowerCase()} tilbake i skraphaugen.`);
      return;
    }
    if (slot) {
      const wasDrivable = this.st.drivable;
      attach(d.part, slot);
      audio.clank();
      this.refresh();
      talk.clear();
      if (!wasDrivable && this.st.drivable && markDrivable()) {
        talk.lines([
          { who: 'mulle', text: 'Hurra! Nå har bilen alt den trenger for å kjøre!' },
          { who: 'mulle', text: 'Kom, vi går ut på gården og prøvekjører den.' },
        ]);
      } else if (!wasDrivable && this.st.drivable) {
        talk.say('mulle', 'Nå kan bilen kjøre igjen!');
      } else {
        const R = rand(Math.floor(this.t * 1000));
        talk.say('mulle', R() < 0.6 && d.def.comment ? d.def.comment : PRAISE[Math.floor(R() * PRAISE.length)]);
      }
      return;
    }
    // slipp på gulvet
    const nx = Math.max(30, Math.min(770, d.x));
    const ny = Math.max(318, Math.min(585, d.y));
    movePart(d.part, 'garage', nx, ny);
    audio.thud();
    this.refresh();
  },

  refresh() {
    this.st = stats();
    save();
  },
};

