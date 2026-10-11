// Bilen: festepunkter, montering og utregning av egenskaper.
import { PARTS, SLOT_NAMES } from '../data/parts.js';
import { state, partById, movePart, save } from './state.js';

// Festepunkter på chassiset (bilens koordinater, front mot høyre).
export const BASE_SLOTS = {
  karosseri: { accepts: 'karosseri', x: 0, y: 0, z: 5 },
  motor: { accepts: 'motor', x: 100, y: -20, z: 2 },
  batteri: { accepts: 'batteri', x: 48, y: -16, z: 1 },
  girkasse: { accepts: 'girkasse', x: 26, y: 10, z: 1 },
  tank: { accepts: 'tank', x: -128, y: -18, z: 1 },
  sete: { accepts: 'sete', x: -38, y: -24, z: 3 },
  ratt: { accepts: 'ratt', x: 16, y: -48, z: 4 },
  eksos: { accepts: 'eksos', x: -158, y: 10, z: 6 },
  bakhjul: { accepts: 'hjul', x: -105, y: 18, z: 7 },
  forhjul: { accepts: 'hjul', x: 110, y: 18, z: 7 },
};

export const BODY_SLOTS = ['lykt', 'horn', 'stotfanger', 'pynt'];
export const REQUIRED = ['motor', 'batteri', 'girkasse', 'tank', 'sete', 'ratt', 'forhjul', 'bakhjul'];

export function slotDefs() {
  const out = { ...BASE_SLOTS };
  const bodyId = state.car.karosseri;
  if (bodyId) {
    const b = partById(bodyId);
    const def = b && PARTS[b.key];
    if (def && def.slots) {
      for (const [k, [x, y]] of Object.entries(def.slots)) out[k] = { accepts: k, x, y, z: 8, body: true };
    }
  }
  return out;
}

// slot -> { part, def }
export function carParts() {
  const out = {};
  for (const [slot, id] of Object.entries(state.car)) {
    const p = partById(id);
    if (p) out[slot] = { part: p, def: PARTS[p.key] };
  }
  return out;
}

function detachRaw(slot) {
  const id = state.car[slot];
  delete state.car[slot];
  return id ? partById(id) : null;
}

// Ta en del av bilen. Tar man av karosseriet, faller pynt/lykter osv. av også.
export function detach(slot, x, y) {
  const p = detachRaw(slot);
  if (!p) return [];
  const dropped = [p];
  movePart(p, 'garage', x, y);
  if (slot === 'karosseri') {
    for (const s of BODY_SLOTS) {
      const q = detachRaw(s);
      if (q) {
        movePart(q, 'garage');
        dropped.push(q);
      }
    }
  }
  save();
  return dropped;
}

// Monter en del. Returnerer delen som eventuelt ble byttet ut.
export function attach(p, slot) {
  // fjern fra bilen hvis den allerede sitter et annet sted
  for (const [s, id] of Object.entries(state.car)) if (id === p.id) delete state.car[s];
  let replaced = null;
  if (state.car[slot]) {
    replaced = detachRaw(slot);
    if (replaced) movePart(replaced, 'garage');
  }
  p.loc = 'car';
  state.car[slot] = p.id;
  // nytt karosseri: sjekk at gamle tilbehør fortsatt har plass (alle karosserier har samme typer)
  save();
  return replaced;
}

export function missing() {
  return REQUIRED.filter((s) => !state.car[s]).map((s) => SLOT_NAMES[s]);
}

export function stats() {
  const cp = carParts();
  const d = (s) => (cp[s] ? cp[s].def : null);
  const wheels = [d('forhjul'), d('bakhjul')].filter(Boolean);
  const avg = (f, def = 0) => (wheels.length ? wheels.reduce((a, w) => a + (w[f] || 0), 0) / wheels.length : def);

  let weight = 2;
  let style = 0;
  for (const { def } of Object.values(cp)) {
    weight += def.weight || 0;
    style += def.style || 0;
  }
  const motor = d('motor');
  const body = d('karosseri');
  const gear = d('girkasse');
  const tank = d('tank');
  const exhaust = d('eksos');
  const power = motor ? motor.power + (d('batteri') && d('batteri').power ? d('batteri').power : 0) + (exhaust && exhaust.power ? exhaust.power : 0) : 0;
  const climb = power / weight;
  let top = (30 + power * 11) * (gear ? gear.gear : 1) * avg('speed', 1) * (body && body.speed ? body.speed : 1);
  top *= 1 - Math.max(0, weight - 10) * 0.015;
  top = Math.max(15, Math.min(160, top));

  const miss = missing();
  const drivable = miss.length === 0;
  const strength = 1 + (body ? body.strength : 0) + (d('stotfanger') ? d('stotfanger').strength : 0) + avg('strength');
  const comfort = (d('sete') ? d('sete').comfort : 0) + (body ? body.comfort : 0) + (exhaust ? exhaust.comfort : 0) + avg('comfort');

  return {
    drivable,
    missing: miss,
    weight,
    power,
    climb,
    topSpeed: Math.round(top),
    strength,
    comfort,
    grip: avg('grip'),
    cargo: !!(body && body.cargo),
    capacity: tank ? tank.capacity : 0,
    fuelUse: motor ? motor.fuelUse : 1,
    lights: !!d('lykt'),
    horn: d('horn') ? d('horn').key : null,
    style: style + (drivable ? 2 : 0),
    bodyKey: body ? body.key : null,
    bodyColor: body ? body.color : null,
    wheelKeys: wheels.map((w) => w.key),
    motorKey: motor ? motor.key : null,
  };
}

// Krav for hindringene på kartet.
export const LIMITS = {
  humpete: { stat: 'strength', min: 4 },
  gjorme: { stat: 'grip', min: 6 },
  bratt: { stat: 'climb', min: 0.44 },
  tunnel: { stat: 'lights', min: 1 },
};

export function passes(st, kind) {
  const L = LIMITS[kind];
  if (!L) return true;
  const v = st[L.stat];
  return (typeof v === 'boolean' ? (v ? 1 : 0) : v) >= L.min;
}

export function markDrivable() {
  if (!state.everDrivable) {
    state.everDrivable = true;
    save();
    return true;
  }
  return false;
}
