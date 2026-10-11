// Besøk på et sted: bakgrunn, personen som bor der, og Mulle med bilen.
import { game } from '../game.js';
import { layer, shape, rect, rrect, circ, ell, stroke, txt, rand, lighten, hatch, tube, star, ellPts, INK } from '../engine/draw.js';
import { sky, clouds, hills, tree, house, fence, ground, sign } from '../game/scenery.js';
import { button, inside } from '../game/ui.js';
import { drawPerson, drawDog, drawCow, LOOKS } from '../game/characters.js';
import { drawCar } from '../game/carRender.js';
import { PLACES, arrive } from '../game/missions.js';
import { state } from '../game/state.js';
import { talk } from '../engine/talk.js';
import { audio } from '../engine/audio.js';
import { stats } from '../game/car.js';

const bgs = {};
const BACK = { x: 14, y: 14, w: 170, h: 48 };
const NPC_X = 640;
const NPC_Y = 520;

// ---------- bakgrunner ----------
const PAINT = {
  bensin(g) {
    sky(g, 800, 600, '#8fc6e8', '#eef3e6');
    clouds(g, 301, 3, 30, 120);
    hills(g, 300, '#93c070', 302, 40);
    ground(g, 360, '#9b968c', 303);
    // butikk
    house(g, 470, 380, 300, 130, { wall: '#f0f0ea', roof: '#c8322b', roofH: 30, windows: 3, door: '#3d6fb8', seed: 304 });
    sign(g, 540, 200, 160, 40, 'BENSIN', { post: 0, color: '#f2c94c', size: 26 });
    // tak over pumpene
    rect(g, 360, 210, 12, 180, { fill: '#e8e8e2' });
    rect(g, 760, 210, 12, 180, { fill: '#e8e8e2' });
    rect(g, 340, 190, 450, 30, { fill: '#c8322b', seed: 305 });
    for (const px of [470, 620]) {
      rect(g, px, 300, 40, 90, { fill: '#f2c94c', seed: 306 + px });
      rect(g, px + 8, 312, 24, 18, { fill: '#e9e4d0', lw: 1.6 });
      tube(g, [[px + 40, 330], [px + 54, 350], [px + 50, 380]], 3, '#333', { seed: 307 });
    }
  },
  bakeri(g) {
    sky(g, 800, 600, '#9ccbe8', '#f3efe0');
    clouds(g, 311, 3, 20, 110);
    house(g, -20, 330, 200, 180, { wall: '#e3a37a', roof: '#7a2a20', windows: 2, door: false, seed: 312 });
    house(g, 200, 330, 340, 200, { wall: '#f3e3c3', roof: '#9a5a3a', windows: 0, door: false, seed: 313 });
    house(g, 560, 330, 260, 170, { wall: '#cfe0ea', roof: '#3d3a3a', windows: 2, door: false, seed: 314 });
    ground(g, 330, '#c9bfae', 315);
    for (let x = 0; x < 800; x += 40) stroke(g, [[x, 340], [x + 20, 600]], { lw: 1, ink: 'rgba(80,60,40,0.2)' });
    // markise
    for (let i = 0; i < 8; i++) shape(g, [[220 + i * 40, 200], [260 + i * 40, 200], [262 + i * 40, 236], [218 + i * 40, 236]], { fill: i % 2 ? '#fff6e0' : '#c8322b', lw: 1.8, seed: 316 + i });
    rect(g, 240, 240, 160, 80, { fill: '#bfe3f2', seed: 317 });
    for (let i = 0; i < 4; i++) ell(g, 266 + i * 36, 300, 14, 8, { fill: '#c98a42', lw: 1.6 });
    rect(g, 420, 240, 50, 90, { fill: '#6b8f4a', seed: 318 });
    sign(g, 300, 150, 140, 40, 'BAKERI', { post: 0, color: '#fff6e0', size: 26 });
    // kringle-skilt
    shape(g, [...ellPts(500, 160, 22, 18)], { fill: '#d9a24a', lw: 2.4 });
  },
  fest(g) {
    sky(g, 800, 600, '#8fc6e8', '#f3f3e6');
    clouds(g, 321, 3, 20, 110);
    tree(g, 60, 330, 1.2, 'leaf', 322);
    tree(g, 760, 320, 1.3, 'leaf', 323);
    house(g, 160, 340, 340, 200, { wall: '#f2c94c', roof: '#b8452f', windows: 3, chimney: true, door: '#f6f1e6', seed: 324 });
    ground(g, 340, '#8cbf6a', 325);
    hatch(g, 0, 340, 800, 260, 'rgba(60,110,40,0.25)', 326, 500, 8, -1.3, 1.3, 0.5);
    fence(g, 0, 140, 420, 327);
    // bord med duk
    rect(g, 520, 380, 220, 16, { fill: '#fff', seed: 328 });
    for (const lx of [530, 720]) rect(g, lx, 396, 8, 40, { fill: '#8a5a2b' });
    for (const [x, c] of [[540, '#e0477a'], [580, '#4f7fa8'], [620, '#f4c430'], [700, '#5d8f4a']]) {
      rrect(g, x, 360, 16, 22, 4, { fill: '#fff', lw: 1.4 });
      circ(g, x + 8, 356, 5, { fill: c, lw: 1.2 });
    }
    // ballonger og flaggbånd
    for (const [x, y, c] of [[530, 150, '#e0477a'], [570, 120, '#4f7fa8'], [610, 160, '#f4c430'], [690, 130, '#7a5ae0']]) {
      stroke(g, [[x, y + 30], [x - 10, y + 120]], { lw: 1.2 });
      ell(g, x, y, 20, 26, { fill: c, lw: 2 });
    }
    for (let i = 0; i < 14; i++) shape(g, [[150 + i * 26, 220 + Math.sin(i / 2) * 6], [176 + i * 26, 220 + Math.sin((i + 1) / 2) * 6], [163 + i * 26, 244]], { fill: ['#c8322b', '#f2c94c', '#3d6fb8'][i % 3], lw: 1.4 });
  },
  torg(g) {
    sky(g, 800, 600, '#93c8ea', '#f2efe2');
    clouds(g, 331, 3, 20, 110);
    house(g, -20, 300, 180, 160, { wall: '#cfe0ea', roof: '#5a6a7a', windows: 2, seed: 332 });
    house(g, 620, 300, 200, 170, { wall: '#f1d4d4', roof: '#7a2a20', windows: 2, seed: 333 });
    ground(g, 300, '#d1c8b6', 334);
    for (let y = 320; y < 600; y += 22) for (let x = (y / 22) % 2 ? 0 : 20; x < 800; x += 40) rrect(g, x, y, 34, 16, 5, { fill: 'rgba(160,150,130,0.4)', lw: 1, ink: 'rgba(90,80,60,0.4)', shade: false, blot: false });
    // banner
    stroke(g, [[180, 100], [180, 300]], { lw: 5 });
    stroke(g, [[600, 100], [600, 300]], { lw: 5 });
    shape(g, [[184, 110], [596, 110], [596, 160], [184, 160]], { fill: '#fff6e0', lw: 2.4, seed: 335 });
    txt(g, 'BILUTSTILLING', 390, 137, { size: 34, color: '#c8322b' });
    for (let i = 0; i < 12; i++) shape(g, [[190 + i * 34, 162], [222 + i * 34, 162], [206 + i * 34, 184]], { fill: ['#c8322b', '#f2c94c', '#3d6fb8', '#5d8f4a'][i % 4], lw: 1.4 });
    // pall
    rect(g, 520, 420, 200, 40, { fill: '#3d6fb8', seed: 336 });
    txt(g, '1', 620, 440, { size: 26, color: '#fff' });
  },
  ola(g) {
    sky(g, 800, 600, '#8fc6e8', '#f4f1dc');
    clouds(g, 341, 4, 20, 120);
    hills(g, 280, '#a8cf74', 342, 40);
    // låve
    shape(g, [[420, 360], [420, 180], [560, 110], [700, 180], [700, 360]], { fill: '#b9412f', seed: 343 });
    shape(g, [[410, 185], [560, 100], [710, 185], [700, 195], [560, 116], [420, 195]], { fill: '#3d3a3a', seed: 344 });
    rect(g, 520, 240, 80, 120, { fill: '#6b4426', seed: 345 });
    stroke(g, [[520, 240], [600, 360]], { lw: 3, ink: '#f2eee4' });
    stroke(g, [[600, 240], [520, 360]], { lw: 3, ink: '#f2eee4' });
    // silo
    rect(g, 710, 150, 70, 210, { fill: '#c9c4b8', seed: 346 });
    shape(g, ellPts(745, 150, 35, 26, Math.PI, Math.PI * 2, 10), { fill: '#8a8272', seed: 347 });
    ground(g, 350, '#c9b07a', 348);
    hatch(g, 0, 350, 800, 250, 'rgba(120,90,40,0.25)', 349, 400, 10, -1.2, 1.2, 0.5);
    fence(g, 0, 300, 400, 350, '#e8e0cc');
    // høyballer
    for (const [x, y] of [[90, 450], [150, 470], [120, 420]]) {
      ell(g, x, y, 34, 26, { fill: '#e6c55a', seed: 351 + x });
      for (let k = -2; k <= 2; k++) stroke(g, [[x - 30, y + k * 8], [x + 30, y + k * 8]], { lw: 1, ink: 'rgba(150,110,30,0.5)' });
    }
  },
  sigurd(g) {
    sky(g, 800, 600, '#9cc8dc', '#e8efe2');
    for (let i = 0; i < 16; i++) tree(g, i * 55 - 10, 300 + (i % 3) * 10, 1.1 + (i % 2) * 0.3, 'pine', 361 + i);
    ground(g, 340, '#6f8f4a', 362);
    hatch(g, 0, 340, 800, 260, 'rgba(40,70,20,0.3)', 363, 500, 9, -1.3, 1.3, 0.5);
    // tømmerhytte
    rect(g, 360, 200, 300, 160, { fill: '#7a4f2e', seed: 364 });
    for (let y = 210; y < 360; y += 18) ell(g, 510, y, 156, 8, { fill: '#8a5a33', lw: 1.6, seed: 365 + y, shade: false });
    shape(g, [[340, 210], [510, 110], [680, 210]], { fill: '#4f3420', seed: 366 });
    rect(g, 490, 270, 46, 90, { fill: '#4f3420', seed: 367 });
    rect(g, 400, 250, 50, 40, { fill: '#ffe9a0', seed: 368 });
    // vedstabel
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) circ(g, 120 + c * 22 + (r % 2) * 11, 420 - r * 20, 11, { fill: '#c49a5a', lw: 1.6, seed: 369 + r * 6 + c });
    // stubbe med øks
    ell(g, 300, 470, 30, 12, { fill: '#c49a5a', seed: 380 });
    rect(g, 270, 470, 60, 30, { fill: '#7a4f2e', seed: 381 });
    stroke(g, [[300, 466], [330, 420]], { lw: 5, ink: '#8a5a2b' });
    shape(g, [[318, 412], [340, 418], [334, 434]], { fill: '#8f989e', lw: 1.6 });
  },
  fyr(g) {
    sky(g, 800, 600, '#7fbde6', '#f2f2e6');
    clouds(g, 371, 4, 20, 140);
    shape(g, [[-10, 300], [810, 300], [810, 610], [-10, 610]], { fill: '#4f94c7', lw: 0, ink: null, seed: 372 });
    g.save();
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    g.lineWidth = 2;
    const R = rand(373);
    for (let i = 0; i < 40; i++) {
      const x = R() * 800, y = 310 + R() * 120;
      g.beginPath();
      g.arc(x, y, 10, Math.PI * 1.15, Math.PI * 1.85);
      g.stroke();
    }
    g.restore();
    // svaberg
    shape(g, [[-10, 600], [-10, 380], [200, 350], [450, 370], [700, 340], [810, 360], [810, 600]], { fill: '#b6aa96', seed: 374, step: 30, j: 4 });
    // fyrtårn
    shape(g, [[620, 360], [646, 120], [694, 120], [720, 360]], { fill: '#f6f1e6', seed: 375 });
    for (const y of [160, 240, 320]) shape(g, [[620 + (360 - y) * 0.1, y], [720 - (360 - y) * 0.1, y], [720 - (360 - y - 40) * 0.1 - 4, y + 40], [620 + (360 - y - 40) * 0.1 + 4, y + 40]], { fill: '#c8322b', seed: 376 + y });
    rect(g, 640, 84, 60, 36, { fill: '#ffe680', seed: 377 });
    shape(g, [[632, 84], [670, 52], [708, 84]], { fill: '#3d3a3a', seed: 378 });
    rect(g, 630, 118, 80, 8, { fill: '#3d3a3a' });
    // måker
    for (const [x, y] of [[200, 120], [260, 90], [420, 150]]) stroke(g, [[x - 14, y], [x - 6, y - 6], [x, y], [x + 6, y - 6], [x + 14, y]], { lw: 2.2 });
  },
  topp(g) {
    sky(g, 800, 600, '#6fb3e8', '#eef5f8');
    clouds(g, 381, 3, 30, 110);
    // fjell i det fjerne
    for (const [x, h, c] of [[100, 200, '#b8c4d0'], [300, 260, '#a8b6c4'], [560, 220, '#b8c4d0'], [760, 240, '#a8b6c4']]) {
      shape(g, [[x - 180, 360], [x, 360 - h], [x + 180, 360]], { fill: c, seed: 382 + x, j: 3 });
      shape(g, [[x - 50, 360 - h + 70], [x, 360 - h], [x + 50, 360 - h + 70], [x + 20, 360 - h + 60], [x, 360 - h + 74], [x - 20, 360 - h + 60]], { fill: '#fff', seed: 383 + x, shade: false });
    }
    // dalen langt nede
    shape(g, [[-10, 360], [810, 360], [810, 420], [-10, 420]], { fill: '#8cbf6a', seed: 384, lw: 0, ink: null });
    ground(g, 380, '#a39a86', 385);
    for (let i = 0; i < 12; i++) ell(g, 40 + i * 70, 420 + (i % 3) * 30, 20, 8, { fill: '#8a8272', lw: 1.4, seed: 386 + i });
    // hytte
    house(g, 60, 420, 180, 110, { wall: '#a46d3a', roof: '#7a2a20', windows: 1, door: '#5d3a20', seed: 387 });
    stroke(g, [[300, 420], [300, 230]], { lw: 4 });
    shape(g, [[302, 232], [370, 240], [366, 280], [302, 274]], { fill: '#c8202e', lw: 2, seed: 388 });
    shape(g, [[322, 233], [330, 234], [328, 276], [320, 276]], { fill: '#fff', ink: null, seed: 389, shade: false });
    shape(g, [[302, 250], [368, 257], [367, 265], [302, 258]], { fill: '#fff', ink: null, seed: 390, shade: false });
    shape(g, [[324, 234], [328, 234.5], [326, 275], [322, 275]], { fill: '#1f3a8a', ink: null, seed: 391, shade: false, blot: false, j: 0.05 });
    shape(g, [[302, 252.5], [367, 259.5], [367, 262.5], [302, 255.5]], { fill: '#1f3a8a', ink: null, seed: 392, shade: false, blot: false, j: 0.05 });
  },
};

export const locationScene = {
  t: 0,
  enter(params) {
    this.id = params.id;
    this.key = params.key;
    this.place = PLACES[this.id];
    // hold bare bakgrunnen til dette stedet i minnet
    for (const k of Object.keys(bgs)) if (k !== this.id) delete bgs[k];
    if (!bgs[this.id]) bgs[this.id] = layer(800, 600, 2, PAINT[this.id]);
    this.t = 0;
    this.st = stats();
    const lines = arrive(this.id);
    this.st = stats();
    this.sayLines(lines);
  },
  sayLines(lines) {
    talk.lines(lines.map((l) => ({
      ...l,
      who: l.who === 'npc' ? this.place.npc : 'mulle',
      voice: l.who === 'npc' ? 'npc' : 'mulle',
      name: l.who === 'npc' ? this.place.who : undefined,
      pitch: l.who === 'npc' ? this.pitch() : undefined,
    })));
  },
  pitch() {
    const L = LOOKS[this.place.npc];
    if (!L) return 1;
    return L.female ? 1.25 : L.big ? 0.7 : 0.9;
  },
  update(dt) {
    this.t += dt;
  },
  draw(g) {
    g.drawImage(bgs[this.id], 0, 0, 800, 600);
    const t = this.t;
    drawCar(g, 230, 560, 0.62);
    drawPerson(g, LOOKS.mulle, 430, 560, 0.8, t, talk.talking('mulle'));
    if (this.id === 'ola') drawCow(g, 700, 470, 0.6, t);
    if (this.id === 'fest' && state.missions.kake === 'done') {
      rect(g, 600, 340, 60, 30, { fill: '#f3b6c8', lw: 2 });
      rect(g, 600, 332, 60, 10, { fill: '#fff6e0', lw: 1.8 });
      for (const cx of [612, 630, 648]) {
        stroke(g, [[cx, 332], [cx, 318]], { lw: 2, ink: '#3d6fb8' });
        ell(g, cx, 314 + Math.sin(t * 10 + cx) * 1, 2.5, 4, { fill: '#ffb020', ink: null });
      }
    }
    if (this.id === 'ola' && state.missions.melk === 'none') {
      for (const x of [300, 330]) {
        rrect(g, x, 440, 24, 36, 6, { fill: '#d3dce1', lw: 2 });
        rect(g, x + 5, 432, 14, 9, { fill: '#a7b0b5', lw: 1.6 });
      }
    }
    if (this.id === 'torg' && state.missions.show) {
      const c = { bronse: '#c8874a', solv: '#c9d0d6', gull: '#f4c430' }[state.missions.show];
      circ(g, 740, 380, 22, { fill: c, lw: 2.4 });
      shape(g, star(740, 380, 12, 5), { fill: lighten(c, 0.4), lw: 1.4 });
    }
    drawPerson(g, LOOKS[this.place.npc], NPC_X, NPC_Y, 0.9, t + 1.3, talk.talking(this.place.npc), { flip: true });
    if (this.id === 'sigurd' || this.id === 'ola') drawDog(g, 720, 560, 0.5, t, { flip: true });
    button(g, BACK, '← Kjør videre', inside(game.mouse, BACK), { size: 22 });
    txt(g, this.place.name, 400, 36, { size: 30, color: '#fff6d8', outline: INK, olw: 6 });
  },
  speakerAnchor(who) {
    if (who === 'mulle') return { x: 430, y: 410 };
    return { x: NPC_X, y: NPC_Y - 175 };
  },
  hover(p) {
    if (inside(p, BACK)) return { label: 'Tilbake til kartet' };
    if (Math.abs(p.x - NPC_X) < 45 && p.y > NPC_Y - 190 && p.y < NPC_Y) return { label: this.place.who };
    return null;
  },
  pointerdown(p) {
    if (inside(p, BACK)) {
      audio.pick();
      game.go('map', { from: 'location', key: this.key });
      return;
    }
    if (Math.abs(p.x - NPC_X) < 45 && p.y > NPC_Y - 190 && p.y < NPC_Y) {
      talk.clear();
      this.sayLines(arrive(this.id));
    }
  },
};

