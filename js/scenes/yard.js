// Gården: huset, garasjen, skraphaugen, postkassa – og veien ut i verden.
import { game } from '../game.js';
import { layer, shape, rect, rrect, stroke, circ, txt, darken, hatch, grain } from '../engine/draw.js';
import { sky, clouds, hills, tree, house, fence, junkMound, flowers } from '../game/scenery.js';
import { woodSign, inside } from '../game/ui.js';
import { drawPerson, drawDog, LOOKS } from '../game/characters.js';
import { drawCar } from '../game/carRender.js';
import { stats } from '../game/car.js';
import { state, save } from '../game/state.js';
import { talk } from '../engine/talk.js';
import { audio } from '../engine/audio.js';
import { hint } from '../game/missions.js';

let bg = null;
const GARAGE_DOOR = { x: 590, y: 200, w: 150, h: 190 };
const JUNK = { x: 440, y: 250, w: 130, h: 120 };
const ROAD = { x: 0, y: 330, w: 110, h: 110 };
const MAILBOX = { x: 40, y: 430, w: 60, h: 110 };
const MULLE = { x: 690, y: 440, w: 80, h: 160 };
const CAR = { x: 220, y: 380, w: 330, h: 150 };

function makeBg() {
  return layer(800, 600, 2, (g) => {
    sky(g, 800, 600, '#86c2e6', '#eef3e6');
    clouds(g, 21, 4, 30, 140);
    hills(g, 250, '#93c070', 22, 40);
    for (let i = 0; i < 7; i++) tree(g, 20 + i * 70, 262, 0.55, 'pine', 70 + i);
    hills(g, 300, '#84b562', 23, 18);
    // gårdsplass (grus)
    shape(g, [[-10, 330], [300, 318], [820, 330], [820, 610], [-10, 610]], { fill: '#d9c49a', lw: 0, ink: null, seed: 24, step: 40, j: 4 });
    grain(g, 0, 320, 800, 280, 25, 2500, 0.06);
    hatch(g, 0, 330, 800, 270, 'rgba(120,90,50,0.18)', 26, 160, 10, 0, 1.2, 0.3);
    // vei ut til venstre
    shape(g, [[-10, 350], [180, 360], [300, 380], [300, 430], [160, 420], [-10, 430]], { fill: '#c9b083', lw: 0, ink: null, seed: 27, j: 3 });
    // huset
    house(g, 190, 330, 220, 120, { wall: '#f5f0e2', roof: '#b8452f', windows: 3, chimney: true, door: '#5d8f4a', seed: 41 });
    fence(g, 0, 170, 345, 3);
    // skraphaug bak
    junkMound(g, 505, 340, 150, 70, 55);
    // garasjen (rød låve)
    shape(g, [[555, 395], [555, 150], [670, 70], [800, 120], [800, 400]], { fill: '#b9412f', seed: 61, lw: 2.8 });
    for (let x = 568; x < 800; x += 16) stroke(g, [[x, 140 - (x - 555) * 0.0], [x, 395]], { lw: 1, ink: darken('#b9412f', 0.25), j: 0.6, seed: x });
    shape(g, [[545, 155], [670, 64], [810, 118], [810, 132], [670, 80], [552, 165]], { fill: '#3d3a3a', seed: 62 });
    // dører
    rect(g, 590, 205, 72, 190, { fill: '#5d8f4a', seed: 63 });
    rect(g, 664, 205, 72, 190, { fill: '#5d8f4a', seed: 64 });
    for (const dx of [590, 664]) {
      stroke(g, [[dx + 4, 210], [dx + 68, 390]], { lw: 3, ink: '#f2eee4', j: 0.3 });
      stroke(g, [[dx + 4, 300], [dx + 68, 300]], { lw: 3, ink: '#f2eee4', j: 0.3 });
    }
    rect(g, 630, 120, 60, 44, { fill: '#bfe3f2', seed: 65 });
    stroke(g, [[660, 120], [660, 164]], { lw: 2 });
    flowers(g, 0, 800, 560, 600, 8, 30);
    // postkasse
    rect(g, 64, 470, 8, 70, { fill: '#7a4f2e' });
    rrect(g, 44, 440, 48, 34, 8, { fill: '#c8322b', seed: 71 });
    rect(g, 50, 446, 36, 10, { fill: '#fff6e0', lw: 1.4, shade: false });
    txt(g, 'MULLE', 68, 452, { size: 11 });
  });
}

export const yardScene = {
  t: 0,
  leaving: 0,
  enter(params = {}) {
    if (!bg) bg = makeBg();
    this.t = 0;
    this.leaving = 0;
    this.st = stats();
    if (!state.introDone) {
      state.introDone = true;
      save();
      talk.lines([
        { who: 'mulle', text: 'Hei! Jeg er Mulle Mekk. Jeg bygger biler av gammelt skrot.' },
        { who: 'mulle', text: 'Bli med inn i garasjen, så bygger vi en bil sammen!' },
      ]);
    } else if (params.towed) {
      talk.say('mulle', 'Puh! Vi gikk tom for bensin og måtte slepes hjem. Heldigvis hadde jeg litt bensin på lager.');
    } else if (params.from === 'map' && state.figgePending) {
      talk.say('mulle', 'Jeg hører telefonen ringe i garasjen!');
    } else if (params.from === 'garage' && this.st.drivable) {
      talk.say('mulle', 'Klikk på bilen når du vil kjøre en tur!');
    }
  },
  update(dt) {
    this.t += dt;
    if (this.leaving) {
      this.leaving += dt;
      if (this.leaving > 1.7) {
        this.leaving = 0;
        game.go('map', { from: 'yard' });
      }
    }
  },
  draw(g) {
    g.drawImage(bg, 0, 0, 800, 600);
    const hot = (r) => inside(game.mouse, r) && !this.leaving;
    woodSign(g, 465, 238, 104, 30, 'Skraphaugen', { post: 40, hot: hot(JUNK), seed: 3 });
    woodSign(g, 14, 312, 104, 30, 'Ut på veien', { dir: 'left', post: 36, hot: hot(ROAD) || hot(CAR), seed: 4 });
    if (hot(GARAGE_DOOR)) {
      g.save();
      g.strokeStyle = 'rgba(255,240,150,0.9)';
      g.lineWidth = 4;
      g.strokeRect(590, 205, 146, 190);
      g.restore();
    }
    if (hot(MAILBOX)) {
      g.save();
      g.strokeStyle = 'rgba(255,240,150,0.9)';
      g.lineWidth = 3;
      g.strokeRect(40, 436, 56, 42);
      g.restore();
    }
    // bilen
    if (this.st.drivable) {
      const k = this.leaving;
      const x = 390 - (k > 0.3 ? (k - 0.3) * (k - 0.3) * 420 : 0);
      const bounce = k ? Math.sin(this.t * 30) * 1.2 : 0;
      // speilvendt: bilen peker mot veien til venstre og kjører forover ut
      g.save();
      g.translate(x, 0);
      g.scale(-1, 1);
      drawCar(g, 0, 520, 0.78, { wheelRot: k * k * 12, bounce });
      g.restore();
      if (k) {
        // eksosrøyk
        for (let i = 0; i < 4; i++) {
          const a = (this.t * 2 + i * 0.25) % 1;
          circ(g, x + 140 + a * 60, 505 - a * 30, 6 + a * 14, { fill: `rgba(200,200,200,${0.5 - a * 0.5})`, ink: null, shade: false, blot: false });
        }
      }
    }
    if (!this.leaving) drawPerson(g, LOOKS.mulle, 730, 590, 0.82, this.t, talk.talking('mulle'));
    drawDog(g, 610, 585, 0.62, this.t, { flip: false });
  },
  speakerAnchor(who) {
    if (who === 'figge') return { x: 650, y: 230 };
    return { x: 730, y: 430 };
  },
  hover(p) {
    if (this.leaving) return null;
    if (inside(p, GARAGE_DOOR)) return { label: 'Garasjen' };
    if (inside(p, JUNK)) return { label: 'Skraphaugen' };
    if (inside(p, MAILBOX)) return { label: 'Medaljer og oppdrag' };
    if (inside(p, MULLE)) return { label: 'Mulle' };
    if (inside(p, ROAD) || (this.st.drivable && inside(p, CAR))) return { label: 'Kjør ut på veien' };
    return null;
  },
  pointerdown(p) {
    if (this.leaving) return;
    if (inside(p, GARAGE_DOOR)) {
      audio.pick();
      game.go('garage', { from: 'yard' });
    } else if (inside(p, JUNK)) {
      audio.pick();
      game.go('junkyard', { pile: 0 });
    } else if (inside(p, MAILBOX)) {
      audio.pick();
      game.go('album', { back: 'yard' });
    } else if (inside(p, MULLE)) {
      talk.clear();
      talk.say('mulle', hint());
    } else if (inside(p, ROAD) || (this.st.drivable && inside(p, CAR))) {
      this.tryDrive();
    }
  },
  tryDrive() {
    const st = this.st;
    talk.clear();
    if (!st.drivable) {
      talk.say('mulle', `Bilen er ikke ferdig ennå. Vi mangler ${st.missing.join(', ')}.`);
      return;
    }
    if (state.fuel <= 0.5) {
      state.fuel = st.capacity;
      save();
      talk.say('mulle', 'Jeg fyller tanken fra tønna mi først. Sånn!');
    }
    if (state.fuel > st.capacity) state.fuel = st.capacity;
    audio.engineStart();
    audio.engineSet(0.6);
    this.leaving = 0.01;
  },
  exit() {
    audio.engineStop();
  },
};

