// Oppstart, hovedløkke og inndata.
import { game, W, H } from './game.js';
import { talk } from './engine/talk.js';
import { audio } from './engine/audio.js';
import { speech } from './engine/speech.js';
import { FONT, Q, stroke, shape, rrPts } from './engine/draw.js';
import { tooltip, inside } from './game/ui.js';
import { load } from './game/state.js';

import { titleScene } from './scenes/title.js';
import { yardScene } from './scenes/yard.js';
import { garageScene } from './scenes/garage.js';
import { junkyardScene } from './scenes/junkyard.js';
import { mapScene } from './scenes/map.js';
import { locationScene } from './scenes/location.js';
import { albumScene } from './scenes/album.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let scale = 1;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = `${Math.floor(W * s)}px`;
  canvas.style.height = `${Math.floor(H * s)}px`;
  canvas.width = Math.round(W * s * dpr);
  canvas.height = Math.round(H * s * dpr);
  scale = (W * s * dpr) / W;
}
window.addEventListener('resize', resize);
resize();

// ---------- knapper i hjørnet: lyd og tale ----------
const SOUND_BTN = { x: 732, y: 8, w: 28, h: 28 };
const SPEECH_BTN = { x: 766, y: 8, w: 28, h: 28 };

function drawCornerButtons(g) {
  const hotS = inside(game.mouse, SOUND_BTN);
  const hotT = inside(game.mouse, SPEECH_BTN);
  for (const [r, hot] of [[SOUND_BTN, hotS], [SPEECH_BTN, hotT]]) {
    shape(g, rrPts(r.x, r.y, r.w, r.h, 8), { fill: hot ? '#fff3c4' : 'rgba(255,246,216,0.85)', lw: 2, shade: false, blot: false, j: 0.3, seed: 3 });
  }
  // høyttaler
  const sx = SOUND_BTN.x + 8, sy = SOUND_BTN.y + 14;
  shape(g, [[sx - 2, sy - 4], [sx + 3, sy - 4], [sx + 9, sy - 9], [sx + 9, sy + 9], [sx + 3, sy + 4], [sx - 2, sy + 4]], { fill: '#2b1e16', lw: 1, j: 0.1, shade: false, blot: false });
  if (audio.on) {
    stroke(g, [[sx + 12, sy - 5], [sx + 14, sy], [sx + 12, sy + 5]], { lw: 1.8, j: 0.1 });
  } else {
    stroke(g, [[sx + 11, sy - 5], [sx + 18, sy + 5]], { lw: 2, ink: '#c8322b', j: 0.1 });
  }
  // snakkeboble
  const bx = SPEECH_BTN.x + 14, by = SPEECH_BTN.y + 13;
  shape(g, [...rrPts(bx - 9, by - 7, 18, 13, 5)], { fill: speech.enabled ? '#fff' : '#ddd', lw: 1.6, j: 0.1, shade: false, blot: false });
  shape(g, [[bx - 4, by + 5], [bx - 6, by + 10], [bx + 1, by + 5]], { fill: '#fff', lw: 1.4, j: 0.1, shade: false, blot: false });
  if (!speech.enabled) stroke(g, [[bx - 10, by - 8], [bx + 10, by + 9]], { lw: 2, ink: '#c8322b', j: 0.1 });
}

function cornerTip() {
  if (inside(game.mouse, SOUND_BTN)) return audio.on ? 'Lyd: på' : 'Lyd: av';
  if (inside(game.mouse, SPEECH_BTN)) {
    if (!speech.available) return 'Opplesing: fant ingen norsk stemme';
    return speech.enabled ? 'Opplesing: på' : 'Opplesing: av';
  }
  return null;
}

// ---------- inndata ----------
function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}

canvas.addEventListener('pointerdown', (e) => {
  audio.unlock();
  const p = toLogical(e);
  game.mouse.x = p.x;
  game.mouse.y = p.y;
  game.mouse.down = true;
  canvas.setPointerCapture(e.pointerId);
  if (game.pending) return;
  if (inside(p, SOUND_BTN)) {
    audio.toggle();
    return;
  }
  if (inside(p, SPEECH_BTN)) {
    speech.toggle();
    return;
  }
  if (talk.click(p)) return;
  game.scene && game.scene.pointerdown && game.scene.pointerdown(p);
});

canvas.addEventListener('pointermove', (e) => {
  const p = toLogical(e);
  game.mouse.x = p.x;
  game.mouse.y = p.y;
  game.scene && game.scene.pointermove && game.scene.pointermove(p);
});

canvas.addEventListener('pointerup', (e) => {
  const p = toLogical(e);
  game.mouse.down = false;
  if (game.pending) return;
  game.scene && game.scene.pointerup && game.scene.pointerup(p);
});
canvas.addEventListener('pointercancel', () => {
  game.mouse.down = false;
  game.scene && game.scene.pointerup && game.scene.pointerup(game.mouse);
});

window.addEventListener('keydown', (e) => {
  audio.unlock();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  game.keys.add(e.key.toLowerCase());
  game.scene && game.scene.keydown && game.scene.keydown(e);
});
window.addEventListener('keyup', (e) => game.keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => game.keys.clear());

// ---------- løkke ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  talk.update(dt);
  const sc = game.scene;
  if (sc && sc.update) sc.update(dt);

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  Q.fast = true;
  if (sc && sc.draw) sc.draw(ctx);
  talk.draw(ctx, sc);
  drawCornerButtons(ctx);

  // musepeker og verktøytips
  let label = cornerTip();
  let pointer = !!label;
  if (!label && sc && sc.hover && !game.pending) {
    const h = sc.hover(game.mouse);
    if (h) {
      label = h.label || null;
      pointer = h.cursor !== 'default';
    }
  }
  if (sc && sc.cursor) pointer = sc.cursor === 'grabbing' ? 'grabbing' : pointer;
  canvas.style.cursor = pointer === 'grabbing' ? 'grabbing' : pointer ? 'pointer' : 'default';
  if (label && !game.mouse.down) tooltip(ctx, game.mouse.x, game.mouse.y, label);

  if (game.fade > 0) {
    ctx.fillStyle = `rgba(20,12,6,${game.fade})`;
    ctx.fillRect(0, 0, W, H);
  }
  requestAnimationFrame(frame);
}

async function boot() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = '#1d1611';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f2c94c';
  ctx.font = `32px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('Henter verktøykassa...', W / 2, H / 2);
  try {
    await Promise.race([document.fonts.load(`24px "Patrick Hand"`), new Promise((r) => setTimeout(r, 2500))]);
  } catch {}
  speech.init();
  load();
  game.register('title', titleScene);
  game.register('yard', yardScene);
  game.register('garage', garageScene);
  game.register('junkyard', junkyardScene);
  game.register('map', mapScene);
  game.register('location', locationScene);
  game.register('album', albumScene);
  game.go('title', {}, true);
  requestAnimationFrame(frame);
}

boot();

// for feilsøking i konsollen
window.__game = game;
