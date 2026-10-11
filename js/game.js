// Felles spilltilstand for scener, inndata og overganger.
import { talk } from './engine/talk.js';

export const W = 800;
export const H = 600;

export const game = {
  scenes: {},
  scene: null,
  sceneName: null,
  mouse: { x: 0, y: 0, down: false },
  keys: new Set(),
  t: 0,
  fade: 1,
  fadeDir: -1,
  pending: null,

  register(name, scene) {
    this.scenes[name] = scene;
  },

  go(name, params = {}, instant = false) {
    if (this.pending) return;
    this.pending = { name, params };
    if (instant) this._switch();
    else this.fadeDir = 1;
  },

  _switch() {
    const { name, params } = this.pending;
    this.pending = null;
    if (this.scene && this.scene.exit) this.scene.exit();
    talk.clear();
    this.sceneName = name;
    this.scene = this.scenes[name];
    if (this.scene.enter) this.scene.enter(params);
    this.fadeDir = -1;
  },

  update(dt) {
    this.t += dt;
    if (this.fadeDir > 0) {
      this.fade = Math.min(1, this.fade + dt * 4);
      if (this.fade >= 1 && this.pending) this._switch();
    } else if (this.fadeDir < 0) {
      this.fade = Math.max(0, this.fade - dt * 4);
      if (this.fade <= 0) this.fadeDir = 0;
    }
  },
};
