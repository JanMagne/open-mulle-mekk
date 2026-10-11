// Kjøring på kartet sett ovenfra. Piltaster/WASD – eller hold musa der du vil kjøre.
import { game } from '../game.js';
import { shape, rect, rrect, circ, stroke, txt, rrPts, INK, hatch, layer, hq } from '../engine/draw.js';
import { WORLD, SCREEN, OY, LOCATIONS, renderWorld, constrain, nearestRoad } from '../game/world.js';
import { stats, passes } from '../game/car.js';
import { makeTopCar } from '../game/carRender.js';
import { state, save } from '../game/state.js';
import { talk } from '../engine/talk.js';
import { audio } from '../engine/audio.js';

const VIEW_H = SCREEN.h;
// minikartets plass i dashbordet
const MM = { x: 32, y: VIEW_H + 15, w: 84, h: 70 };
let world = null;
let mini = null;
let dashBg = null;

const BLOCK_TEXT = {
  humpete: 'Au! Denne veien er altfor humpete. Bilen må være sterkere – kanskje et karosseri eller en støtfanger?',
  gjorme: 'Vi sitter fast i gjørma! Vi trenger hjul med mye bedre grep.',
  bratt: 'Bakken er for bratt! Motoren er for svak – eller bilen er for tung.',
  tunnel: 'Det er bekmørkt i tunnelen! Vi trenger lykter på bilen.',
};
const OK_TEXT = {
  humpete: 'Humpe-di-dump! Heldigvis er bilen sterk.',
  gjorme: 'Slafs! De store hjulene tar oss gjennom gjørma.',
  bratt: 'Opp, opp, opp! For en kraftig bil!',
  tunnel: 'Godt vi har lykter! Det er mørkt her inne.',
};

function makeDash() {
  return layer(800, 100, 2, (g) => {
    rect(g, -4, 0, 808, 104, { fill: '#9a6436', seed: 1, lw: 3 });
    hatch(g, 0, 0, 800, 100, 'rgba(60,30,10,0.25)', 2, 260, 40, 0, 1.4, 0.05);
    // fartsmåler
    shape(g, rrPts(150, 22, 430, 58, 12), { fill: '#e9e4d0', lw: 3, seed: 3 });
    for (let v = 0; v <= 160; v += 10) {
      const x = 170 + (v / 160) * 390;
      stroke(g, [[x, 62], [x, v % 20 === 0 ? 50 : 56]], { lw: 1.6, j: 0.1 });
      if (v % 20 === 0 && v > 0) txt(g, String(v), x, 38, { size: 15 });
    }
    txt(g, 'km/t', 548, 70, { size: 14 });
    // bensinmåler
    circ(g, 650, 58, 34, { fill: '#e9e4d0', lw: 3, seed: 4 });
    txt(g, 'T', 624, 70, { size: 15, color: '#c8322b' });
    txt(g, 'F', 676, 70, { size: 15 });
    txt(g, 'bensin', 650, 84, { size: 12 });
    // lasterom
    shape(g, rrPts(708, 24, 78, 64, 10), { fill: '#e9e4d0', lw: 3, seed: 5 });
    txt(g, 'last', 747, 80, { size: 13 });
  });
}

function drawCargoIcon(g, item, x, y) {
  if (item === 'melk') {
    rrect(g, x - 11, y - 14, 22, 28, 5, { fill: '#d3dce1', lw: 2 });
    rect(g, x - 7, y - 20, 14, 7, { fill: '#a7b0b5', lw: 1.6 });
    stroke(g, [[x - 11, y - 2], [x + 11, y - 2]], { lw: 1.4 });
  } else if (item === 'kake') {
    rect(g, x - 16, y - 4, 32, 16, { fill: '#f3b6c8', lw: 2 });
    rect(g, x - 16, y - 10, 32, 7, { fill: '#fff6e0', lw: 1.8 });
    stroke(g, [[x, y - 10], [x, y - 20]], { lw: 2, ink: '#e0477a' });
    circ(g, x, y - 22, 3, { fill: '#f4c430', lw: 1 });
  }
}

export const mapScene = {
  t: 0,
  enter(params = {}) {
    if (!world) {
      world = hq(renderWorld);
      mini = layer(MM.w, MM.h, 2, (g) => g.drawImage(world, 0, 0, MM.w, MM.h));
    }
    if (!dashBg) dashBg = makeDash();
    this.st = stats();
    this.top = makeTopCar(this.st);
    this.t = 0;
    this.v = 0;
    this.msgCool = 0;
    this.lastType = null;
    this.okSaid = {};
    this.empty = 0;
    this.shake = 0;
    if (state.fuel > this.st.capacity) state.fuel = this.st.capacity;
    let loc = LOCATIONS[0];
    if (params.from === 'location') loc = LOCATIONS.find((l) => l.key === params.key) || loc;
    this.x = loc.exit[0];
    this.y = loc.exit[1];
    this.a = Math.atan2(loc.exit[1] - loc.y, loc.exit[0] - loc.x);
    this.armed = new Set(LOCATIONS.map((l) => l.key).filter((k) => k !== loc.key));
    this.cam = { x: 0, y: 0 };
    this.snapCam();
    audio.engineStart();
    if (params.from === 'yard' && !state.firstDriveDone) {
      state.firstDriveDone = true;
      save();
      talk.lines([
        { who: 'mulle', text: 'Brrrm! Kjør med piltastene – eller hold musa der du vil kjøre.' },
        { who: 'mulle', text: 'Kjør inn til et sted for å besøke det. Hold øye med bensinmåleren!' },
      ]);
    }
  },
  exit() {
    audio.engineStop();
    save();
  },

  // Velg skjermbildet bilen står i. Kjører den ut av kanten, byttes bildet.
  snapCam() {
    const col = Math.max(0, Math.min(WORLD.cols - 1, Math.floor(this.x / SCREEN.w)));
    const row = Math.max(0, Math.min(WORLD.rows - 1, Math.floor((this.y + OY) / SCREEN.h)));
    this.cam.x = col * SCREEN.w;
    this.cam.y = row * SCREEN.h;
  },

  // bilens posisjon på skjermen
  screenPos() {
    return { x: this.x - this.cam.x, y: this.y + OY - this.cam.y };
  },

  say(text) {
    talk.clear();
    talk.say('mulle', text);
  },

  update(dt) {
    this.t += dt;
    this.msgCool = Math.max(0, this.msgCool - dt);
    this.shake = Math.max(0, this.shake - dt);
    const st = this.st;
    const k = game.keys;
    let throttle = 0, steer = 0;
    if (k.has('arrowup') || k.has('w')) throttle = 1;
    if (k.has('arrowdown') || k.has('s')) throttle = -1;
    if (k.has('arrowleft') || k.has('a')) steer = -1;
    if (k.has('arrowright') || k.has('d')) steer = 1;
    const m = game.mouse;
    if (m.down && m.y < VIEW_H && !throttle && !steer) {
      const wx = m.x + this.cam.x, wy = m.y + this.cam.y - OY;
      const dx = wx - this.x, dy = wy - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 30) {
        let da = Math.atan2(dy, dx) - this.a;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        steer = Math.max(-1, Math.min(1, da * 2.5));
        throttle = Math.abs(da) > 2.2 ? -0.6 : Math.min(1, dist / 120);
      }
    }
    if (state.fuel <= 0) throttle = Math.min(0, throttle) * 0;

    // underlag
    const n = nearestRoad(this.x, this.y);
    const type = n.type;
    let cap = st.topSpeed * 1.6;
    if (type === 'humpete') cap *= 0.65;
    if (type === 'gjorme') cap *= 0.5;
    if (type === 'bratt') cap *= 0.6;
    if (type === 'grus') cap *= 0.9;

    const accel = 60 + st.climb * 520;
    if (throttle > 0) this.v += accel * throttle * dt;
    else if (throttle < 0) this.v += (this.v > 0 ? 320 : 120) * throttle * dt;
    else this.v *= 1 - Math.min(1, 1.8 * dt);
    this.v = Math.max(-cap * 0.35, Math.min(cap, this.v));
    if (Math.abs(this.v) < 1 && !throttle) this.v = 0;

    // bilen kan snus på stedet; i revers svinger den motsatt vei
    const turn = 2.4 * (this.v < -5 ? -1 : 1);
    this.a += steer * turn * dt;
    const ox = this.x, oy = this.y;
    const nx = this.x + Math.cos(this.a) * this.v * dt;
    const ny = this.y + Math.sin(this.a) * this.v * dt;
    const c = constrain(nx, ny);
    if (c.blocked) this.v *= 1 - Math.min(1, 3 * dt);

    // hindringer
    const nt = nearestRoad(c.x, c.y).type;
    if (!passes(st, nt)) {
      this.v = -this.v * 0.25;
      this.shake = 0.3;
      if (this.msgCool <= 0) {
        audio.bump();
        this.say(BLOCK_TEXT[nt]);
        this.msgCool = 6;
      }
    } else {
      this.x = c.x;
      this.y = c.y;
      if (nt !== this.lastType && OK_TEXT[nt] && !this.okSaid[nt] && this.msgCool <= 0) {
        this.okSaid[nt] = true;
        this.say(OK_TEXT[nt]);
        this.msgCool = 3;
      }
      this.lastType = nt;
      if (nt === 'humpete' && Math.abs(this.v) > 20 && Math.random() < dt * 3) {
        this.shake = 0.15;
        audio.bump();
      }
    }

    // bensin
    const moved = Math.hypot(this.x - ox, this.y - oy);
    if (state.fuel > 0) {
      state.fuel = Math.max(0, state.fuel - moved * st.fuelUse * 0.0105);
      if (state.fuel <= 0) {
        this.say('Å nei! Tom tank! Vi må ringe etter hjelp...');
        audio.sad();
      }
    } else {
      this.empty += dt;
      if (this.empty > 4) {
        state.fuel = st.capacity;
        state.mapPos = null;
        save();
        game.go('yard', { towed: true });
        return;
      }
    }
    audio.engineSet(Math.min(1, Math.abs(this.v) / 250));

    // ankomst
    for (const l of LOCATIONS) {
      const d = Math.hypot(this.x - l.x, this.y - l.y);
      if (d > 90) this.armed.add(l.key);
      if (d < 34 && this.armed.has(l.key)) {
        this.armed.delete(l.key);
        this.v = 0;
        save();
        if (l.id === 'hjem') game.go('yard', { from: 'map' });
        else game.go('location', { id: l.id, key: l.key });
        return;
      }
    }

    this.snapCam();
  },

  keydown(e) {
    if (e.key === 'h' || e.key === 'H' || e.key === ' ') {
      if (this.st.horn) audio.honk(this.st.horn);
      else if (e.key !== ' ') this.say('Vi har ikke noe horn på bilen!');
    }
  },

  draw(g) {
    const sx = this.shake ? (Math.random() - 0.5) * 6 : 0;
    const sy = this.shake ? (Math.random() - 0.5) * 6 : 0;
    g.save();
    g.beginPath();
    g.rect(0, 0, 800, VIEW_H);
    g.clip();
    g.translate(sx, sy);
    g.drawImage(world, this.cam.x, this.cam.y, 800, VIEW_H, 0, 0, 800, VIEW_H);
    const { x: cx, y: cy } = this.screenPos();
    // bilen
    g.save();
    g.translate(cx, cy);
    g.rotate(this.a);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.beginPath();
    g.ellipse(4, 5, this.top.w / 2 - 4, this.top.h / 2 - 6, 0, 0, Math.PI * 2);
    g.fill();
    const bob = Math.abs(this.v) > 5 ? Math.sin(this.t * 25) * 0.6 : 0;
    g.drawImage(this.top.c, -this.top.w / 2, -this.top.h / 2 + bob, this.top.w, this.top.h);
    g.restore();
    // last på taket/lasteplanet
    if (state.carried) drawCargoIcon(g, state.carried, cx - Math.cos(this.a) * 12, cy - Math.sin(this.a) * 12 - 6);
    // mørk tunnel
    const n = nearestRoad(this.x, this.y);
    if (n.type === 'tunnel') {
      g.save();
      const gr = g.createRadialGradient(cx + Math.cos(this.a) * 60, cy + Math.sin(this.a) * 60, 10, cx, cy, 160);
      gr.addColorStop(0, 'rgba(10,8,5,0.15)');
      gr.addColorStop(1, 'rgba(10,8,5,0.9)');
      g.fillStyle = gr;
      g.fillRect(-10, -10, 820, VIEW_H + 20);
      g.restore();
    }
    g.restore();

    this.drawDash(g);
  },

  drawDash(g) {
    g.drawImage(dashBg, 0, VIEW_H, 800, 100);
    // minikart med gjeldende skjermbilde markert
    shape(g, rrPts(MM.x - 6, MM.y - 4, MM.w + 12, MM.h + 8, 8), { fill: '#e9e4d0', lw: 2.4, seed: 9 });
    g.drawImage(mini, MM.x, MM.y, MM.w, MM.h);
    const kx = MM.w / WORLD.w, ky = MM.h / WORLD.h;
    g.strokeStyle = 'rgba(255,250,220,0.95)';
    g.lineWidth = 1.5;
    g.strokeRect(MM.x + this.cam.x * kx, MM.y + this.cam.y * ky, SCREEN.w * kx, SCREEN.h * ky);
    for (const l of LOCATIONS) {
      if (l.id === 'hjem') continue;
      g.fillStyle = '#fff6d8';
      g.fillRect(MM.x + l.x * kx - 2, MM.y + (l.y + OY) * ky - 2, 4, 4);
    }
    const home = LOCATIONS[0];
    circ(g, MM.x + home.x * kx, MM.y + (home.y + OY) * ky, 3.5, { fill: '#5d8f4a', lw: 1.2, shade: false });
    if (Math.floor(this.t * 3) % 2 === 0) circ(g, MM.x + this.x * kx, MM.y + (this.y + OY) * ky, 3.5, { fill: '#c8322b', lw: 1.4, shade: false });
    // fart
    const kmh = Math.abs(this.v) / 1.6;
    const fx = 170 + Math.min(1, kmh / 160) * 390;
    g.fillStyle = '#d43c2e';
    g.fillRect(170, VIEW_H + 48, Math.max(0, fx - 170), 10);
    stroke(g, [[fx, VIEW_H + 44], [fx, VIEW_H + 64]], { lw: 3, ink: '#8a1d14', j: 0.1 });
    // bensin
    const f = this.st.capacity ? state.fuel / this.st.capacity : 0;
    const ang = Math.PI * (1.15 + f * 0.7);
    const gx = 650, gy = VIEW_H + 58;
    stroke(g, [[gx, gy], [gx + Math.cos(ang) * 26, gy + Math.sin(ang) * 26]], { lw: 3, ink: f < 0.2 ? '#c8322b' : INK, j: 0.1 });
    circ(g, gx, gy, 4, { fill: '#333', lw: 1 });
    if (f < 0.2 && Math.floor(this.t * 2) % 2 === 0) txt(g, 'Lite bensin!', 650, VIEW_H + 14, { size: 15, color: '#ffe27a', outline: INK, olw: 3 });
    // last
    if (state.carried) drawCargoIcon(g, state.carried, 747, VIEW_H + 54);
    if (this.st.horn) txt(g, 'H = tut', 92, VIEW_H - 14, { size: 15, color: '#fff6d8', outline: INK, olw: 4 });
  },

  speakerAnchor() {
    const p = this.screenPos();
    return { x: p.x, y: p.y - 30 };
  },

  hover() {
    return null;
  },
};

