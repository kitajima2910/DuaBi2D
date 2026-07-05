// ============================================================
// Countries Marble Race — Race State Machine
// LOADING → COUNTDOWN → RACING → FINISHED → RESULTS
// ============================================================

import Phaser from "phaser";
import type { RaceConfig, RacePhase, RaceResult } from "@/types";
import { COUNTDOWN_SECONDS } from "@/config/GameConfig";
import { COUNTRY_MAP } from "@/config/CountryData";
import { TRACK_DEFAULT_WIDTH } from "@/config/GameConfig";
import { eventBus } from "@/utils/EventBus";
import { TrackGenerator } from "@/managers/TrackGenerator";
import { Marble } from "@/entities/Marble";
import { Track } from "@/entities/Track";

export class RaceManager {
  readonly scene: Phaser.Scene;
  readonly config: RaceConfig;

  /** Current race phase */
  phase: RacePhase = 'LOADING';

  /** All marbles in the race */
  marbles: Marble[] = [];

  /** The race track */
  track: Track | null = null;

  /** Timestamp (ms) when the RACING phase started */
  startTime = 0;

  /** Elapsed time since race start (ms) */
  elapsed = 0;

  /** Ordered list of finished marbles */
  finishOrder: RaceResult[] = [];

  /** Current countdown value (COUNTDOWN_SECONDS..0, then -1 for GO) */
  countdownValue = COUNTDOWN_SECONDS;

  /** Whether the race has been fully completed (all marbles done) */
  private raceCompleted = false;

  /** Accumulated dt for countdown timing */
  private countdownAccum = 0;

  constructor(scene: Phaser.Scene, config: RaceConfig) {
    this.scene = scene;
    this.config = config;
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start the race: create track + marbles, begin countdown.
   */
  async startRace(): Promise<void> {
    this.phase = 'LOADING';
    eventBus.emit('race:phase-change', 'LOADING');

    // 1. Generate track
    const trackConfig = TrackGenerator.generate(
      this.config.trackSeed,
      this.config.difficulty,
    );
    this.track = new Track(this.scene, trackConfig);

    // 2. Create marbles
    this.createMarbles();

    // 3. Begin countdown
    this.startCountdown();
  }

  /**
   * Main update — called every frame from the scene update.
   * @param dt Delta time in milliseconds
   */
  update(dt: number): void {
    if (this.phase === 'COUNTDOWN') {
      this.updateCountdown(dt);
    } else if (this.phase === 'RACING') {
      this.updateRacing();
    }
  }

  /**
   * Clean up all allocated objects.
   */
  destroy(): void {
    for (const marble of this.marbles) {
      marble.destroy();
    }
    this.marbles = [];

    if (this.track) {
      this.track.destroy();
      this.track = null;
    }

    this.finishOrder = [];
    this.raceCompleted = false;
  }

  // ============================================================
  // Marble creation
  // ============================================================

  private createMarbles(): void {
    if (!this.track) return;

    const startPos = this.track.getPosition(0);
    const count = this.config.marbleCount;
    const ids = this.config.countryIds.slice(0, count);
    const spacing = 28; // px between marbles on start line

    this.marbles = ids.map((countryId, idx) => {
      const country = COUNTRY_MAP.get(countryId);
      if (!country) {
        throw new Error(`Unknown country id: ${countryId}`);
      }

      // Spread marbles laterally across the start line
      const offsetX = (idx - (ids.length - 1) / 2) * spacing;
      const marble = new Marble(this.scene, startPos.x + offsetX, startPos.y, country.id);

      // Small random initial velocity so they don't start uniformly
      const vx = 0.2 + Math.random() * 0.3;
      const vy = (Math.random() - 0.5) * 0.2;
      marble.body.velocity.x = vx;
      marble.body.velocity.y = vy;

      return marble;
    });
  }

  // ============================================================
  // Countdown
  // ============================================================

  private startCountdown(): void {
    this.phase = 'COUNTDOWN';
    this.countdownValue = COUNTDOWN_SECONDS;
    this.countdownAccum = 0;
    eventBus.emit('race:phase-change', 'COUNTDOWN');
    eventBus.emit('race:countdown-tick', this.countdownValue);

    // Freeze marbles during countdown
    this.setMarblesPhysicsEnabled(false);
  }

  private updateCountdown(dt: number): void {
    this.countdownAccum += dt;

    if (this.countdownAccum >= 1000) {
      this.countdownAccum -= 1000;
      this.countdownValue--;

      if (this.countdownValue >= 0) {
        eventBus.emit('race:countdown-tick', this.countdownValue);
      }

      // Countdown hit zero → GO!
      if (this.countdownValue < 0) {
        this.startRacing();
      }
    }
  }

  private startRacing(): void {
    this.phase = 'RACING';
    this.startTime = this.scene.time.now;
    this.elapsed = 0;
    eventBus.emit('race:phase-change', 'RACING');

    // Enable physics for all marbles
    this.setMarblesPhysicsEnabled(true);

    // Give marbles a small random push at start
    for (const marble of this.marbles) {
      const pushX = 1 + Math.random() * 2;
      const pushY = (Math.random() - 0.5) * 0.5;
      marble.body.velocity.x = pushX;
      marble.body.velocity.y = pushY;
    }
  }

  // ============================================================
  // Racing
  // ============================================================

  private updateRacing(): void {
    if (this.raceCompleted) return;

    this.elapsed = this.scene.time.now - this.startTime;

    // Check each marble for finish / elimination
    for (const marble of this.marbles) {
      const s = marble.marbleState;
      if (s.finished || s.eliminated) continue;

      // Check if marble crossed the finish line
      if (this.track) {
        const lastWp = this.track.waypoints[this.track.waypoints.length - 1];
        if (lastWp) {
          const dx = marble.x - lastWp.x;
          const dy = marble.y - lastWp.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < TRACK_DEFAULT_WIDTH / 2) {
            this.onMarbleFinish(s.id);
          }
        }
      }

      // Check elimination (e.g., fell off track)
      if (this.isMarbleEliminated(marble)) {
        this.onMarbleEliminate(s.id);
      }
    }

    // Check if all marbles have finished or been eliminated
    if (this.finishOrder.length >= this.marbles.length) {
      this.checkAllFinished();
    }
  }

  // ============================================================
  // Finish / Elimination handlers
  // ============================================================

  private onMarbleFinish(marbleId: string): void {
    const marble = this.marbles.find((m) => m.marbleState.id === marbleId);
    if (!marble || marble.marbleState.finished) return;

    marble.marbleState.finished = true;
    marble.marbleState.finishTime = this.elapsed;
    marble.marbleState.rank = this.finishOrder.length + 1;

    const state = marble.marbleState;

    const result: RaceResult = {
      marbleId: state.id,
      countryId: state.countryId,
      rank: state.rank,
      finishTime: state.finishTime,
      eliminated: false,
      topSpeed: state.speed,
      averageSpeed: state.speed * 0.8, // approximate
    };

    this.finishOrder.push(result);
    eventBus.emit('race:marble-finish', state.id);
  }

  private onMarbleEliminate(marbleId: string): void {
    const marble = this.marbles.find((m) => m.marbleState.id === marbleId);
    if (!marble || marble.marbleState.eliminated || marble.marbleState.finished) return;

    marble.marbleState.eliminated = true;
    marble.marbleState.finishTime = Infinity;
    marble.marbleState.rank = this.marbles.length;

    const state = marble.marbleState;

    const result: RaceResult = {
      marbleId: state.id,
      countryId: state.countryId,
      rank: state.rank,
      finishTime: Infinity,
      eliminated: true,
      topSpeed: state.speed,
      averageSpeed: state.speed * 0.8,
    };

    this.finishOrder.push(result);
    eventBus.emit('race:marble-eliminate', state.id);
  }

  private checkAllFinished(): void {
    if (this.raceCompleted) return;
    this.raceCompleted = true;

    this.phase = 'FINISHED';
    eventBus.emit('race:phase-change', 'FINISHED');
    eventBus.emit('race:finish-all', this.finishOrder);

    // After a brief delay, show results
    this.scene.time.delayedCall(1500, () => {
      this.showResults();
    });
  }

  private showResults(): void {
    this.phase = 'RESULTS';
    eventBus.emit('race:phase-change', 'RESULTS');
  }

  // ============================================================
  // Helpers
  // ============================================================

  private setMarblesPhysicsEnabled(enabled: boolean): void {
    for (const marble of this.marbles) {
      if (marble.body) {
        marble.body.isStatic = !enabled;
      }
    }
  }

  /**
   * Check if a marble should be eliminated (fell off track bounds).
   */
  private isMarbleEliminated(marble: { x: number; y: number }): boolean {
    const { width, height } = this.scene.scale;
    const margin = 100;
    return (
      marble.x < -margin ||
      marble.x > width + margin ||
      marble.y < -margin ||
      marble.y > height + margin
    );
  }

  /**
   * Get the current race results for completed marbles.
   */
  getResults(): RaceResult[] {
    return [...this.finishOrder];
  }

  /**
   * Get the current ranking of all marbles (by finish order + progress).
   */
  getRankings(): { marbleId: string; rank: number }[] {
    const finished = this.marbles
      .filter((m) => m.marbleState.finished)
      .sort((a, b) => a.marbleState.rank - b.marbleState.rank);

    const racing = this.marbles
      .filter((m) => !m.marbleState.finished && !m.marbleState.eliminated)
      .sort((a, b) => b.marbleState.progress - a.marbleState.progress);

    const eliminated = this.marbles
      .filter((m) => m.marbleState.eliminated);

    const rankings: { marbleId: string; rank: number }[] = [];

    finished.forEach((m, i) => {
      rankings.push({ marbleId: m.marbleState.id, rank: i + 1 });
    });

    racing.forEach((m, i) => {
      rankings.push({ marbleId: m.marbleState.id, rank: finished.length + i + 1 });
    });

    eliminated.forEach((_m, i) => {
      rankings.push({
        marbleId: _m.marbleState.id,
        rank: finished.length + racing.length + i + 1,
      });
    });

    return rankings;
  }
}
