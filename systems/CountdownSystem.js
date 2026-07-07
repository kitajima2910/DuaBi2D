/**
 * CountdownSystem — locks marbles via setStatic(true), counts down,
 * then unlocks at GO and signals race start.
 *
 * Emits:
 *   countdown:tick  { value: number|string, index: number }
 *
 * Dependencies: PhysicsSystem, EventBus
 */
export class CountdownSystem {
  /** @param {import('./PhysicsSystem.js').PhysicsSystem} physicsSystem */
  constructor(physicsSystem, eventBus) {
    this.physicsSystem = physicsSystem;
    this.eventBus = eventBus;
    /** @type {number[]} */
    this._timeouts = [];
  }

  /**
   * Begin countdown sequence.
   * @param {import('../entities/Marble.js').Marble[]} marbles
   * @param {() => void} onComplete  Called after final 'GO!' tick
   */
  start(marbles, onComplete) {
    this._clear();

    const steps = [3, 2, 1, 'GO!'];

    // Lock every marble at start (prevent movement during countdown)
    for (const m of marbles) {
      if (m.body) this.physicsSystem.setStatic(m.body, true);
    }

    let delay = 0;
    for (let i = 0; i < steps.length; i++) {
      const value = steps[i];
      const t = setTimeout(() => {
        this.eventBus.emit('countdown:tick', { value, index: i });

        if (value === 'GO!') {
          // Unlock all marbles
          for (const m of marbles) {
            if (m.body) this.physicsSystem.setStatic(m.body, false);
          }
          if (typeof onComplete === 'function') onComplete();
        }
      }, delay);
      this._timeouts.push(t);
      delay += 1000;
    }
  }

  /** Cancel any active countdown. */
  cancel() {
    this._clear();
  }

  _clear() {
    for (const t of this._timeouts) clearTimeout(t);
    this._timeouts = [];
  }

  destroy() {
    this._clear();
  }
}
