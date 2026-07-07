export const RaceState = Object.freeze({
  IDLE: 'IDLE',
  COUNTDOWN: 'COUNTDOWN',
  RUNNING: 'RUNNING',
  FINISHED: 'FINISHED',
});

export class RaceSystem {
  /**
   * @param {import('./EventBus.js').EventBus} eventBus
   */
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.state = RaceState.IDLE;
    this.marbles = [];
    this.results = [];
  }

  /**
   * Set up a new race with the given marbles.
   * Only allowed from IDLE state.
   * @param {import('../entities/Marble.js').Marble[]} marbles
   * @returns {boolean} true if race was created
   */
  createRace(marbles) {
    if (this.state !== RaceState.IDLE) return false;
    if (!Array.isArray(marbles) || marbles.length < 2) return false;

    this.marbles = [...marbles];
    this.results = [];
    this.eventBus.emit('race:created', { marbles: this.marbles });
    return true;
  }

  /** Transition IDLE → COUNTDOWN */
  startCountdown() {
    if (this.state !== RaceState.IDLE) return;
    this.state = RaceState.COUNTDOWN;
    this.eventBus.emit('race:countdown', { value: 3 });
  }

  /** Transition COUNTDOWN → RUNNING */
  startRace() {
    if (this.state !== RaceState.COUNTDOWN) return;
    this.state = RaceState.RUNNING;
    this.eventBus.emit('race:started', { marbles: this.marbles });
  }

  /**
   * Transition RUNNING → FINISHED with final standings.
   * @param {import('../entities/Marble.js').Marble[]} [rankings]
   */
  finishRace(rankings) {
    if (this.state !== RaceState.RUNNING) return;
    this.state = RaceState.FINISHED;
    this.results = rankings ? [...rankings] : [...this.marbles];
    this.eventBus.emit('race:finished', { results: this.results });
  }

  /** Reset back to IDLE — safe from any state. */
  resetRace() {
    this.state = RaceState.IDLE;
    this.marbles = [];
    this.results = [];
    this.eventBus.emit('race:reset', {});
  }
}
