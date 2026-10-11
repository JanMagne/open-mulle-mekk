// Spilltilstand og lagring i nettleseren (localStorage).
import { PARTS } from '../data/parts.js';

const KEY = 'open-mulle-mekk.save.v1';

export let state = null;

const START_PILES = {
  pile1: ['motor_v4', 'batteri_lite', 'gir_3', 'hjul_vanlig', 'hjul_vanlig', 'tank_kanne'],
  pile2: ['kar_boble', 'sete_kasse', 'sete_bil', 'ratt_vanlig', 'lykt_enkel', 'hjul_sykkel', 'hjul_sykkel'],
  pile3: ['kar_pickup', 'stot_vanlig', 'eksos_vanlig', 'horn_tut', 'motor_totakt', 'ratt_styre'],
};

function freshState() {
  const s = {
    v: 1,
    nextId: 1,
    parts: [],
    car: {},
    fuel: 0,
    carried: null,
    missions: { melk: 'none', kake: 'none', sigurd: false, fyr: false, topp: false, show: null },
    medals: [],
    figgePending: 0,
    figgeIndex: 0,
    won: false,
    introDone: false,
    everDrivable: false,
    mapPos: null,
  };
  state = s;
  for (const [pile, keys] of Object.entries(START_PILES)) {
    keys.forEach((k) => addPart(k, pile));
  }
  return s;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1) {
        // fjern deler som ikke finnes lenger
        s.parts = s.parts.filter((p) => PARTS[p.key]);
        state = s;
        return true;
      }
    }
  } catch {}
  freshState();
  return false;
}

export function hasSave() {
  try {
    const raw = localStorage.getItem(KEY);
    return !!raw && JSON.parse(raw).introDone;
  } catch {
    return false;
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function reset() {
  freshState();
  save();
}

export function partById(id) {
  return state.parts.find((p) => p.id === id);
}

export function partsAt(loc) {
  return state.parts.filter((p) => p.loc === loc);
}

// Finn en ledig plass for en del på et sted (garasjegulv eller skraphaug).
export function freeSpot(loc, key) {
  const def = PARTS[key];
  const others = partsAt(loc);
  const big = def.slot === 'karosseri';
  const cands = [];
  if (loc === 'garage') {
    if (big) {
      cands.push([400, 560], [200, 545], [600, 545], [420, 340]);
    } else {
      for (const y of [500, 545, 580, 455]) for (const x of [70, 150, 650, 730, 230, 570]) cands.push([x, y]);
      for (const x of [260, 340, 420, 500]) cands.push([x, 575]);
    }
  } else {
    if (big) cands.push([260, 430], [540, 430], [400, 520], [220, 540], [580, 540]);
    else for (const y of [390, 450, 510, 560]) for (const x of [110, 230, 350, 470, 590, 700]) if (!(x > 600 && y > 420)) cands.push([x, y]);
  }
  let best = cands[0];
  let bestScore = -Infinity;
  cands.forEach(([x, y], i) => {
    let d = Infinity;
    for (const o of others) d = Math.min(d, Math.hypot(o.x - x, o.y - y));
    const score = Math.min(d, 400) - i * 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = [x, y];
    }
  });
  // hold hele delen innenfor skjermen
  const [bx0, by0, bx1, by1] = def.bbox;
  const x = Math.max(8 - bx0, Math.min(792 - bx1, best[0] + (Math.random() - 0.5) * 16));
  const y = Math.max(318, Math.min(594 - by1, best[1] + (Math.random() - 0.5) * 10));
  return { x, y: Math.max(y, 8 - by0) };
}

export function addPart(key, loc) {
  const pos = freeSpot(loc, key);
  const p = { id: state.nextId++, key, loc, x: pos.x, y: pos.y };
  state.parts.push(p);
  return p;
}

export function movePart(p, loc, x, y) {
  p.loc = loc;
  if (x === undefined) {
    const pos = freeSpot(loc, p.key);
    p.x = pos.x;
    p.y = pos.y;
  } else {
    p.x = x;
    p.y = y;
  }
  save();
}
