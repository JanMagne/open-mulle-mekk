// Opplesing av replikker med nettleserens talesyntese (norsk stemme hvis den finnes).

const VOICE_STYLE = {
  mulle: { pitch: 0.75, rate: 0.95 },
  figge: { pitch: 0.55, rate: 1.0 },
  npc: { pitch: 1.1, rate: 1.0 },
};

function pref() {
  try {
    return localStorage.getItem('omm.speech') !== 'off';
  } catch {
    return true;
  }
}

export const speech = {
  wanted: pref(),
  voice: null,
  available: false,
  active: false,

  init() {
    if (!('speechSynthesis' in window)) return;
    const pick = () => {
      const vs = speechSynthesis.getVoices();
      this.voice =
        vs.find((v) => /^(nb|no|nn)\b/i.test(v.lang)) ||
        vs.find((v) => /^da\b/i.test(v.lang)) ||
        vs.find((v) => /^sv\b/i.test(v.lang)) ||
        null;
      this.available = !!this.voice;
    };
    pick();
    speechSynthesis.addEventListener?.('voiceschanged', pick);
  },

  get enabled() {
    return this.wanted && this.available;
  },

  toggle() {
    this.wanted = !this.wanted;
    try {
      localStorage.setItem('omm.speech', this.wanted ? 'on' : 'off');
    } catch {}
    if (!this.wanted) this.stop();
  },

  say(text, who, pitch, onend) {
    if (!this.enabled) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = this.voice;
    u.lang = this.voice.lang;
    const st = VOICE_STYLE[who] || VOICE_STYLE.npc;
    u.pitch = pitch || st.pitch;
    u.rate = st.rate;
    const done = () => {
      this.active = false;
      onend && onend();
    };
    u.onend = done;
    u.onerror = done;
    this.active = true;
    speechSynthesis.speak(u);
    return true;
  },

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.active = false;
  },
};
