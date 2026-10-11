// Enkle syntetiske lydeffekter med WebAudio – ingen lydfiler trengs.

let ac = null;
let master = null;
let engine = null;

function pref() {
  try {
    return localStorage.getItem('omm.sound') !== 'off';
  } catch {
    return true;
  }
}

export const audio = {
  on: pref(),

  unlock() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = this.on ? 0.5 : 0;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
  },

  toggle() {
    this.on = !this.on;
    try {
      localStorage.setItem('omm.sound', this.on ? 'on' : 'off');
    } catch {}
    if (master) master.gain.value = this.on ? 0.5 : 0;
  },

  tone(freq, dur, o = {}) {
    if (!ac) return;
    const t0 = ac.currentTime + (o.delay || 0);
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.linearRampToValueAtTime(Math.max(20, freq + o.slide), t0 + dur);
    const v = o.vol === undefined ? 0.25 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + Math.min(0.02, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  noise(dur, o = {}) {
    if (!ac) return;
    const t0 = ac.currentTime + (o.delay || 0);
    const len = Math.ceil(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.value = o.freq || 1000;
    f.Q.value = o.q || 1;
    const g = ac.createGain();
    const v = o.vol === undefined ? 0.3 : o.vol;
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t0);
  },

  pick() {
    this.tone(520, 0.07, { type: 'square', vol: 0.05 });
  },
  clank() {
    this.noise(0.12, { freq: 2600, vol: 0.35, q: 2 });
    this.tone(860, 0.3, { type: 'triangle', vol: 0.12 });
    this.tone(1290, 0.22, { type: 'triangle', vol: 0.07, delay: 0.02 });
  },
  thud() {
    this.noise(0.18, { freq: 260, type: 'lowpass', vol: 0.5 });
    this.tone(95, 0.16, { vol: 0.25, slide: -40 });
  },
  whoosh() {
    this.noise(0.35, { freq: 900, vol: 0.18, q: 0.6 });
  },
  honk(kind) {
    if (kind === 'horn_elg') {
      this.tone(138, 0.7, { type: 'sawtooth', vol: 0.12 });
      this.tone(184, 0.7, { type: 'sawtooth', vol: 0.1 });
    } else {
      this.tone(430, 0.16, { type: 'square', vol: 0.09, slide: -40 });
      this.tone(430, 0.2, { type: 'square', vol: 0.09, slide: -60, delay: 0.24 });
    }
  },
  ring() {
    for (let i = 0; i < 8; i++) {
      this.tone(i % 2 ? 1650 : 1320, 0.06, { type: 'square', vol: 0.05, delay: i * 0.07 });
    }
  },
  fanfare() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i === 3 ? 0.6 : 0.18, { type: 'triangle', vol: 0.18, delay: i * 0.15 }));
  },
  // motoren starter og ruser
  vroom() {
    this.tone(55, 0.9, { type: 'sawtooth', vol: 0.1, slide: 90 });
    this.tone(28, 0.9, { type: 'square', vol: 0.06, slide: 45 });
    this.noise(0.5, { freq: 300, type: 'lowpass', vol: 0.2, delay: 0.05 });
  },
  bump() {
    this.noise(0.08, { freq: 180, type: 'lowpass', vol: 0.4 });
  },
  sad() {
    [392, 349, 311].forEach((f, i) => this.tone(f, 0.25, { type: 'triangle', vol: 0.12, delay: i * 0.22 }));
  },

  engineStart() {
    if (!ac || engine) return;
    const osc = ac.createOscillator();
    const osc2 = ac.createOscillator();
    const f = ac.createBiquadFilter();
    const g = ac.createGain();
    osc.type = 'sawtooth';
    osc2.type = 'square';
    osc.frequency.value = 45;
    osc2.frequency.value = 22;
    f.type = 'lowpass';
    f.frequency.value = 380;
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.07, ac.currentTime + 0.3);
    osc.connect(f);
    osc2.connect(f);
    f.connect(g).connect(master);
    osc.start();
    osc2.start();
    engine = { osc, osc2, f, g };
  },
  engineSet(speed01) {
    if (!engine) return;
    const t = ac.currentTime;
    const fr = 42 + speed01 * 95;
    engine.osc.frequency.setTargetAtTime(fr, t, 0.1);
    engine.osc2.frequency.setTargetAtTime(fr / 2, t, 0.1);
    engine.f.frequency.setTargetAtTime(300 + speed01 * 700, t, 0.1);
  },
  engineStop() {
    if (!engine) return;
    const e = engine;
    engine = null;
    const t = ac.currentTime;
    e.g.gain.setTargetAtTime(0.0001, t, 0.08);
    e.osc.stop(t + 0.4);
    e.osc2.stop(t + 0.4);
  },
};
