// Tittelskjerm.
import { game } from '../game.js';
import { layer, txt, shape, rand, FONT } from '../engine/draw.js';
import { sky, clouds, hills, tree, ground, flowers } from '../game/scenery.js';
import { button, inside } from '../game/ui.js';
import { drawPerson, drawDog, LOOKS } from '../game/characters.js';
import { drawPart } from '../game/carRender.js';
import { hasSave, reset, state } from '../game/state.js';
import { audio } from '../engine/audio.js';

let bg = null;
const BTN_CONT = { x: 290, y: 430, w: 220, h: 56 };
const BTN_NEW = { x: 290, y: 500, w: 220, h: 50 };
let canContinue = false;
let confirmNew = false;

function makeBg() {
  return layer(800, 600, 2, (g) => {
    sky(g, 800, 600, '#7fbde6', '#f4efd8');
    clouds(g, 4, 5, 40, 160);
    hills(g, 330, '#8cbf6a', 11, 50);
    for (let i = 0; i < 9; i++) tree(g, 30 + i * 95, 335 + (i % 2) * 8, 0.7 + (i % 3) * 0.1, i % 3 ? 'pine' : 'leaf', 40 + i);
    hills(g, 390, '#79ad55', 12, 30);
    ground(g, 420, '#d8c49a', 13);
    flowers(g, 0, 800, 560, 600, 5, 40);
  });
}

function logo(g, t) {
  const wob = Math.sin(t * 1.5) * 2;
  g.save();
  g.translate(400, 78 + wob);
  g.rotate(-0.03);
  const word = 'OPEN MULLE MEKK';
  const R = rand(9);
  g.save();
  g.font = `bold 74px ${FONT}`;
  const widths = word.split('').map((ch) => (ch === ' ' ? 26 : g.measureText(ch).width + 4));
  g.restore();
  let x = -widths.reduce((a, b) => a + b, 0) / 2;
  word.split('').forEach((ch, i) => {
    const w = widths[i];
    if (ch !== ' ') {
      const a = (R() - 0.5) * 0.25;
      g.save();
      g.translate(x + w / 2, 30 + Math.sin(t * 3 + i) * 2.5);
      g.rotate(a);
      txt(g, ch, 0, 0, { size: 74, color: '#c8322b', outline: '#2b1e16', olw: 12, bold: true });
      txt(g, ch, 0, 0, { size: 74, color: '#e2463a', outline: '#fff6d8', olw: 3, bold: true });
      g.restore();
    }
    x += w;
  });
  g.restore();
  txt(g, 'inspirert av klassikeren Bygg Biler med Mulle-Mekk', 400, 160, { size: 22, color: '#5a3a22' });
}

export const titleScene = {
  t: 0,
  enter() {
    if (!bg) bg = makeBg();
    canContinue = hasSave();
    confirmNew = false;
  },
  update(dt) {
    this.t += dt;
  },
  draw(g) {
    g.drawImage(bg, 0, 0, 800, 600);
    logo(g, this.t);
    // liten bil + Mulle + Buffa
    const roll = this.t * 2;
    drawPart(g, 'kar_boble', 590, 380, 0.7);
    drawPart(g, 'hjul_vanlig', 590 + 110 * 0.7, 380 + 18 * 0.7, 0.7, roll);
    drawPart(g, 'hjul_vanlig', 590 - 105 * 0.7, 380 + 18 * 0.7, 0.7, roll);
    drawPerson(g, LOOKS.mulle, 170, 470, 0.95, this.t, false);
    drawDog(g, 260, 470, 0.8, this.t);

    if (confirmNew) {
      shape(g, [[230, 395], [570, 395], [570, 565], [230, 565]], { fill: '#fff6d8', lw: 3, seed: 5 });
      txt(g, 'Starte på nytt? Bilen og alle', 400, 420, { size: 22 });
      txt(g, 'delene dine blir borte.', 400, 446, { size: 22 });
      button(g, { x: 255, y: 480, w: 140, h: 52 }, 'Ja, nytt', inside(game.mouse, { x: 255, y: 480, w: 140, h: 52 }), { color: '#e98a6a' });
      button(g, { x: 405, y: 480, w: 140, h: 52 }, 'Nei', inside(game.mouse, { x: 405, y: 480, w: 140, h: 52 }));
      return;
    }
    if (canContinue) {
      button(g, BTN_CONT, 'Fortsett', inside(game.mouse, BTN_CONT));
      button(g, BTN_NEW, 'Nytt spill', inside(game.mouse, BTN_NEW), { size: 22, color: '#e8d6a8' });
    } else {
      button(g, BTN_CONT, 'Start!', inside(game.mouse, BTN_CONT));
    }
    txt(g, 'Ikke offisielt • all grafikk og lyd er laget fra bunnen av', 400, 588, { size: 15, color: 'rgba(43,30,22,0.6)' });
  },
  hover(p) {
    if (confirmNew) return inside(p, { x: 255, y: 480, w: 290, h: 52 }) ? { label: null } : null;
    if (inside(p, BTN_CONT) || (canContinue && inside(p, BTN_NEW))) return { label: null };
    return null;
  },
  pointerdown(p) {
    if (confirmNew) {
      if (inside(p, { x: 255, y: 480, w: 140, h: 52 })) {
        reset();
        audio.clank();
        game.go('yard');
      } else if (inside(p, { x: 405, y: 480, w: 140, h: 52 })) confirmNew = false;
      return;
    }
    if (inside(p, BTN_CONT)) {
      audio.clank();
      game.go(state.introDone ? 'garage' : 'yard');
    } else if (canContinue && inside(p, BTN_NEW)) {
      confirmNew = true;
    }
  },
};
