/**
 * FinishDetectionSystem — listens to collision:start events and detects
 * when a marble crosses the finish_line sensor. Each marble is recorded
 * exactly once via RankingSystem.
 *
 * Listens to:  collision:start (from EventBus)
 * Emits:       marble:finished  { marbleId: string }
 *
 * Dependencies: EventBus, RankingSystem
 */
export class FinishDetectionSystem {
  /**
   * @param {import('./EventBus.js').EventBus} eventBus
   * @param {import('./RankingSystem.js').RankingSystem} rankingSystem
   */
  constructor(eventBus, rankingSystem) {
    this.eventBus = eventBus;
    this.rankingSystem = rankingSystem;

    /** @type {Set<string>} Marble IDs that already triggered finish */
    this._finished = new Set();

    /** Only process collisions while active (RUNNING state) */
    this._active = false;

    this._onCollision = this._onCollision.bind(this);
    this.eventBus.on('collision:start', this._onCollision);
  }

  /** Enable finish detection (call when race goes RUNNING). */
  activate() {
    this._active = true;
  }

  /** Disable finish detection (call when race is IDLE/COUNTDOWN/FINISHED). */
  deactivate() {
    this._active = false;
  }

  /**
   * Handle Matter collision event.
   * Checks each collision pair for finish_line sensor ↔ marble body.
   */
  _onCollision(event) {
    if (!this._active) return;

    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;

      // Identify which body is the finish_line sensor
      const finishBody =
        bodyA.label === 'finish_line' ? bodyA :
        bodyB.label === 'finish_line' ? bodyB :
        null;
      if (!finishBody) continue;

      // The other body is the marble
      const marbleBody = bodyA === finishBody ? bodyB : bodyA;
      // Skip non-marble bodies (walls, obstacles, spawn_area, world_bound)
      if (marbleBody.isStatic) continue;

      const marbleId = marbleBody.label;

      // Record finish only once per marble
      if (this._finished.has(marbleId)) continue;
      this._finished.add(marbleId);

      this.rankingSystem.registerFinish(marbleId);
      this.eventBus.emit('marble:finished', { marbleId });
    }
  }

  /** Reset for a new race. */
  reset() {
    this._finished.clear();
    this._active = false;
  }

  destroy() {
    this.eventBus.off('collision:start', this._onCollision);
    this._finished.clear();
  }
}
