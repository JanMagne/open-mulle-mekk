// Snakkebobler med kø. Hver scene oppgir hvor den som snakker står (speakerAnchor).
import { FONT, INK, wrapText, rrPts, shape } from './draw.js';
import { speech } from './speech.js';

export const talk = {
  queue: [],
  cur: null,
  t: 0,
  box: null,

  say(who, text, o = {}) {
    this.queue.push({ who, text, ...o });
    if (!this.cur) this.next();
  },

  lines(arr) {
    for (const l of arr) this.say(l.who, l.text, l);
  },

  clear() {
    this.queue = [];
    this.cur = null;
    this.box = null;
    speech.stop();
  },

  busy() {
    return !!this.cur;
  },

  next() {
    const prev = this.cur;
    this.cur = this.queue.shift() || null;
    this.t = 0;
    if (prev && prev.then) prev.then();
    if (this.cur) {
      const c = this.cur;
      c.dur = 1.8 + c.text.length * 0.06;
      c.ended = false;
      c.spoken = speech.say(c.text, c.voice || c.who, c.pitch, () => {
        c.ended = true;
      });
    } else {
      speech.stop();
    }
  },

  update(dt) {
    if (!this.cur) return;
    this.t += dt;
    const c = this.cur;
    const done = c.spoken ? (c.ended && this.t > 0.5) || this.t > c.dur + 10 : this.t > c.dur;
    if (done) this.next();
  },

  // Er denne personen midt i en replikk? (brukes til munnbevegelse)
  talking(who) {
    const c = this.cur;
    if (!c || c.who !== who) return false;
    return c.spoken ? !c.ended : this.t < c.dur - 0.5;
  },

  click(p) {
    if (this.cur && this.box) {
      const b = this.box;
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        speech.stop();
        this.next();
        return true;
      }
    }
    return false;
  },

  draw(g, scene) {
    const c = this.cur;
    if (!c) {
      this.box = null;
      return;
    }
    const a = (scene && scene.speakerAnchor && scene.speakerAnchor(c.who)) || { x: 400, y: 200 };
    const size = 21;
    const { lines, width } = wrapText(g, c.text, 300, size);
    const lh = size * 1.12;
    const w = Math.max(120, width + 34);
    const h = lines.length * lh + 26 + (c.name ? 14 : 0);
    let x = a.x - w / 2;
    let y = a.y - h - 26;
    let below = false;
    if (y < 8) {
      y = a.y + 30;
      below = true;
    }
    x = Math.max(8, Math.min(800 - w - 8, x));
    y = Math.max(8, Math.min(600 - h - 8, y));
    this.box = { x, y, w, h };

    const pop = Math.min(1, this.t * 6);
    g.save();
    g.translate(a.x, a.y);
    g.scale(0.85 + pop * 0.15, 0.85 + pop * 0.15);
    g.translate(-a.x, -a.y);
    g.globalAlpha = pop;

    // hale
    const tx = Math.max(x + 22, Math.min(x + w - 22, a.x));
    const tail = below
      ? [[tx - 12, y + 2], [tx + 12, y + 2], [a.x, a.y + 8]]
      : [[tx - 12, y + h - 2], [tx + 12, y + h - 2], [a.x, a.y - 8]];
    shape(g, [...rrPts(x, y, w, h, 16)], { fill: '#fffaf0', lw: 2.6, j: 0.6, seed: 3, shade: false, blot: false });
    shape(g, tail, { fill: '#fffaf0', lw: 0, ink: null, seed: 4, shade: false, blot: false, j: 0.2 });
    g.save();
    g.strokeStyle = INK;
    g.lineWidth = 2.6;
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(tail[0][0], tail[0][1] + (below ? -1 : 1));
    g.lineTo(tail[2][0], tail[2][1]);
    g.lineTo(tail[1][0], tail[1][1] + (below ? -1 : 1));
    g.stroke();
    g.restore();

    g.fillStyle = INK;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    let ty = y + 12;
    if (c.name) {
      g.font = `15px ${FONT}`;
      g.fillStyle = '#8a5a2b';
      g.fillText(c.name, x + 16, y + 8);
      ty += 14;
      g.fillStyle = INK;
    }
    g.font = `${size}px ${FONT}`;
    lines.forEach((l, i) => g.fillText(l, x + 17, ty + i * lh));
    // liten «klikk for neste»-pil
    if (this.queue.length) {
      g.fillStyle = 'rgba(43,30,22,0.45)';
      g.beginPath();
      const px = x + w - 18, py = y + h - 12;
      g.moveTo(px - 5, py - 4);
      g.lineTo(px + 5, py - 4);
      g.lineTo(px, py + 2);
      g.fill();
    }
    g.restore();
  },
};
