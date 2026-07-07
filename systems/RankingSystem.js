/**
 * RankingSystem — records finish order and provides ranking queries.
 *
 * Methods:
 *   registerFinish(marbleId)  — record a marble crossing the finish line
 *   getRanking()              — ordered array of marble IDs (1st → last)
 *   getWinner()               — marble ID of 1st place (or null)
 *   isRaceFinished(total)     — true when every marble has finished
 *   reset()                   — clear state for a new race
 */
export class RankingSystem {
  constructor() {
    /** @type {string[]} Marble IDs in finish order */
    this.finishOrder = [];

    /** @type {Map<string, number>} Marble ID → finish timestamp */
    this.finishTimes = new Map();
  }

  /**
   * Register a marble as finished.
   * No-op if marble already registered (idempotent).
   * @param {string} marbleId
   */
  registerFinish(marbleId) {
    if (this.finishTimes.has(marbleId)) return;
    this.finishTimes.set(marbleId, performance.now());
    this.finishOrder.push(marbleId);
  }

  /**
   * Get current ranking (1st place first).
   * @returns {string[]}
   */
  getRanking() {
    return [...this.finishOrder];
  }

  /**
   * Get the winner's marble ID, or null if nobody finished.
   * @returns {string | null}
   */
  getWinner() {
    return this.finishOrder.length > 0 ? this.finishOrder[0] : null;
  }

  /**
   * Check whether every marble has finished.
   * @param {number} totalMarbles
   * @returns {boolean}
   */
  isRaceFinished(totalMarbles) {
    return this.finishOrder.length >= totalMarbles;
  }

  /** Clear all state for a new race. */
  reset() {
    this.finishOrder = [];
    this.finishTimes.clear();
  }
}
