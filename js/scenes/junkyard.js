// Skraphaugen: tre hauger med deler. Dra deler til garasjen.
import { game } from '../game.js';
import { layer, shape, txt, grain, hatch, INK } from '../engine/draw.js';
import { sky, clouds, hills, tree, junkMound, fence, flowers } from '../game/scenery.js';
import { bigArrow, woodSign, inside } from '../game/ui.js';
import { drawDog, drawPerson, LOOKS } from '../game/characters.js';
import { drawPart, hitPart, partShadow } from '../game/carRender.js';
import { PARTS } from '../data/parts.js';
import { partsAt, movePart } from '../game/state.js';
import { talk } from '../engine/talk.js';
import { audio } from '../engine/audio.js';

const PILES = ['pile1', 'pile2', 'pile3'];
const bgs = [];
const LEFT = { x: 0, y: 250, w: 80, h: 110 };
const RIGHT = { x: 720, y: 250, w: 80, h: 110 };
const GARAGE = { x: 10, y: 150, w: 130, h: 80 };

function makeBg(i) {
  return layer(800, 600, 2, (g) => {
    sky(g, 800, 600, ['#8cc4e8', '#9ccbe0', '#a9c9e6'][i], '#f1eedc');
    clouds(g, 100 + i, 4, 30, 150);
    hills(g, 260, ['#8ab868', '#7fae60', '#93bf72'][i], 110 + i, 50);
    for (let k = 0; k < 8; k++) tree(g, 40 + k * 100 + i * 20, 280 + (k % 2) * 6, 0.65 + ((k + i) % 3) * 0.12, (k + i) % 3 ? 'pine' : 'leaf', 120 + k + i * 10);
    shape(g, [[-10, 300], [810, 296], [810, 610], [-10, 610]], { fill: '#b98b5a', lw: 0, ink: null, seed: 130 + i, step: 50, j: 4 });
    grain(g, 0, 300, 800, 300, 131 + i, 3000, 0.07);
    hatch(g, 0, 300, 800, 300, 'rgba(90,50,20,0.2)', 132 + i, 200, 10, 0, 1.2, 0.4);
    const mounds = [
      [[200, 340, 340, 110], [600, 330, 300, 90]],
      [[400, 330, 420, 120], [100, 345, 200, 60]],
      [[250, 335, 300, 80], [620, 340, 360, 120]],
    ][i];
    mounds.forEach(([x, y, w, h], k) => junkMound(g, x, y, w, h, 140 + i * 10 + k));
    if (i === 2) fence(g, 600, 800, 300, 5, '#d9d0bc');
    flowers(g, 0, 800, 580, 600, 150 + i, 14);
  });
}

export const junkyardScene = {
  t: 0,
  pile: 0,
  drag: null,
  cursor: null,

  enter(params = {}) {
    this.pile = params.pile || 0;
    if (!bgs[this.pile]) bgs[this.pile] = makeBg(this.pile);
    this.t = 0;
    this.drag = null;
    if (!this.visited) {
      this.visited = true;
      talk.lines([
        { who: 'mulle', text: 'Her i skraphaugen ligger det masse fine deler!' },
        { who: 'mulle', text: 'Dra en del til skiltet «Garasjen», så tar vi den med hjem. Pilene tar oss til de andre haugene.' },
      ]);
    }
  },

  update(dt) {
    this.t += dt;
  },

  parts() {
    return partsAt(PILES[this.pile]).sort((a, b) => a.y - b.y);
  },

  draw(g) {
    g.drawImage(bgs[this.pile], 0, 0, 800, 600);
    const t = this.t;
    const m = game.mouse;
    txt(g, `Skraphaug ${this.pile + 1} av 3`, 400, 28, { size: 24, color: '#fff6d8', outline: INK, olw: 5 });
    woodSign(g, GARAGE.x, GARAGE.y + 20, GARAGE.w, 40, '← Garasjen', { post: 60, hot: inside(m, GARAGE), size: 22, seed: 7 });
    if (this.pile > 0) bigArrow(g, 40, 305, 'left', inside(m, LEFT), t);
    if (this.pile < 2) bigArrow(g, 760, 305, 'right', inside(m, RIGHT), t);

    drawPerson(g, LOOKS.mulle, 740, 590, 0.72, t, talk.talking('mulle'), { flip: true });
    drawDog(g, 660, 592, 0.55, t, { flip: true });

    for (const p of this.parts()) {
      if (this.drag && this.drag.part === p) continue;
      partShadow(g, p.key, p.x, p.y);
      drawPart(g, p.key, p.x, p.y);
    }
    if (this.drag) {
      const d = this.drag;
      drawPart(g, d.part.key, d.x, d.y, 1.05);
    }
  },

  speakerAnchor() {
    return { x: 730, y: 450 };
  },

  partAt(p) {
    const parts = this.parts().reverse();
    for (const q of parts) if (hitPart(q.key, q.x, q.y, 1, p.x, p.y)) return q;
    return null;
  },

  hover(p) {
    if (this.drag) return { label: null };
    if (inside(p, GARAGE)) return { label: 'Tilbake til garasjen' };
    const q = this.partAt(p);
    if (q) return { label: PARTS[q.key].name };
    if (this.pile > 0 && inside(p, LEFT)) return { label: `Skraphaug ${this.pile}` };
    if (this.pile < 2 && inside(p, RIGHT)) return { label: `Skraphaug ${this.pile + 2}` };
    return null;
  },

  pointerdown(p) {
    const q = this.partAt(p);
    if (q) {
      this.drag = { part: q, ox: q.x - p.x, oy: q.y - p.y, x: q.x, y: q.y };
      this.cursor = 'grabbing';
      audio.pick();
      return;
    }
    if (inside(p, GARAGE)) return game.go('garage', { from: 'junk' });
    if (this.pile > 0 && inside(p, LEFT)) return game.go('junkyard', { pile: this.pile - 1 });
    if (this.pile < 2 && inside(p, RIGHT)) return game.go('junkyard', { pile: this.pile + 1 });
  },

  pointermove(p) {
    if (!this.drag) return;
    this.drag.x = p.x + this.drag.ox;
    this.drag.y = p.y + this.drag.oy;
  },

  pointerup(p) {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;
    this.cursor = null;
    const name = PARTS[d.part.key].name.toLowerCase();
    if (inside(p, GARAGE)) {
      movePart(d.part, 'garage');
      audio.whoosh();
      talk.clear();
      talk.say('mulle', `Vi tar med ${name} til garasjen!`);
      return;
    }
    if (this.pile > 0 && inside(p, LEFT)) {
      movePart(d.part, PILES[this.pile - 1]);
      audio.whoosh();
      return;
    }
    if (this.pile < 2 && inside(p, RIGHT)) {
      movePart(d.part, PILES[this.pile + 1]);
      audio.whoosh();
      return;
    }
    movePart(d.part, PILES[this.pile], Math.max(30, Math.min(770, d.x)), Math.max(320, Math.min(585, d.y)));
    audio.thud();
  },
};
