// Albumet i postkassa: medaljer og oppdragsliste.
import { game } from '../game.js';
import { layer, shape, stroke, txt, hatch, rrPts, INK } from '../engine/draw.js';
import { button, inside, medal, trophy } from '../game/ui.js';
import { MEDALS, hint } from '../game/missions.js';
import { state } from '../game/state.js';
import { talk } from '../engine/talk.js';

let bg = null;
const BACK = { x: 20, y: 530, w: 160, h: 50 };

function makeBg() {
  return layer(800, 600, 2, (g) => {
    g.fillStyle = '#5a3a22';
    g.fillRect(0, 0, 800, 600);
    hatch(g, 0, 0, 800, 600, 'rgba(0,0,0,0.2)', 1, 300, 60, 0, 2, 0.05);
    shape(g, rrPts(40, 30, 720, 490, 14), { fill: '#f6efd8', lw: 3, seed: 2 });
    stroke(g, [[400, 36], [400, 514]], { lw: 2, ink: 'rgba(90,60,30,0.4)' });
    for (let y = 110; y < 500; y += 32) {
      stroke(g, [[60, y], [380, y]], { lw: 1, ink: 'rgba(80,120,180,0.25)', j: 0.3 });
      stroke(g, [[420, y], [740, y]], { lw: 1, ink: 'rgba(80,120,180,0.25)', j: 0.3 });
    }
    txt(g, 'Medaljer', 220, 70, { size: 34 });
    txt(g, 'Oppdrag', 580, 70, { size: 34 });
  });
}

export const albumScene = {
  t: 0,
  enter(params = {}) {
    if (!bg) bg = makeBg();
    this.back = params.back || 'yard';
    this.t = 0;
  },
  update(dt) {
    this.t += dt;
  },
  draw(g) {
    g.drawImage(bg, 0, 0, 800, 600);
    const ids = Object.keys(MEDALS);
    ids.forEach((id, i) => {
      const m = MEDALS[id];
      const x = 110 + (i % 3) * 110;
      const y = 170 + Math.floor(i / 3) * 150;
      let earned = state.medals.includes(id);
      let color = m.color;
      let icon = m.icon;
      if (id === 'show' && state.missions.show) {
        earned = true;
        color = { bronse: '#c8874a', solv: '#c9d0d6', gull: '#f4c430' }[state.missions.show];
        icon = { bronse: '3', solv: '2', gull: '1' }[state.missions.show];
      }
      medal(g, x, y, 30, color, icon, earned);
      txt(g, earned ? m.name : '???', x, y + 50, { size: 17, maxW: 105 });
    });
    if (state.won) {
      trophy(g, 220, 490, 0.8);
    }
    // oppdragsliste
    ids.forEach((id, i) => {
      const m = MEDALS[id];
      const done = id === 'show' ? state.missions.show === 'gull' : state.medals.includes(id);
      const y = 126 + i * 64;
      shape(g, rrPts(428, y - 12, 22, 22, 4), { fill: '#fff', lw: 2, seed: 30 + i, shade: false, blot: false });
      if (done) stroke(g, [[431, y], [438, y + 7], [452, y - 14]], { lw: 3.2, ink: '#3f8a3a', j: 0.2 });
      txt(g, m.task, 462, y, { size: 19, align: 'left', maxW: 280, color: done ? 'rgba(43,30,22,0.55)' : INK });
      if (done) stroke(g, [[462, y + 1], [462 + Math.min(280, m.task.length * 7.5), y + 1]], { lw: 1.5, ink: 'rgba(43,30,22,0.5)' });
    });
    button(g, BACK, '← Tilbake', inside(game.mouse, BACK), { size: 22 });
    const hbtn = { x: 560, y: 530, w: 200, h: 50 };
    button(g, hbtn, 'Hva nå, Mulle?', inside(game.mouse, hbtn), { size: 22, color: '#a8d06a' });
  },
  speakerAnchor() {
    return { x: 660, y: 520 };
  },
  hover(p) {
    if (inside(p, BACK) || inside(p, { x: 560, y: 530, w: 200, h: 50 })) return { label: null };
    return null;
  },
  pointerdown(p) {
    if (inside(p, BACK)) game.go(this.back, { from: 'album' });
    else if (inside(p, { x: 560, y: 530, w: 200, h: 50 })) {
      talk.clear();
      talk.say('mulle', hint());
    }
  },
};

