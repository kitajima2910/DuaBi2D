// ============================================================
// Countries Marble Race — Replay Recorder
// Delta-compressed frame recording at 30 fps
// ============================================================

import type { ReplayFrame, ReplayData, RaceConfig } from '@/types';
import { Marble } from '@/entities/Marble';

/** Minimum pixel movement to record a position change */
const POSITION_THRESHOLD = 1;
/** Recording interval in ms (~30 fps) */
const RECORD_INTERVAL = 33;

export class ReplayRecorder {
  frames: ReplayFrame[] = [];
  recording = false;
  startTime = 0;
  marbleCount: number;

  private lastRecordedPositions = new Map<string, { x: number; y: number }>();
  private accumulator = 0;
  private raceConfig: RaceConfig | null = null;

  constructor(marbleCount: number) {
    this.marbleCount = marbleCount;
  }

  /**
   * Begin recording with the given race configuration.
   */
  start(raceConfig: RaceConfig): void {
    this.frames = [];
    this.recording = true;
    this.startTime = Date.now();
    this.accumulator = 0;
    this.raceConfig = raceConfig;
    this.lastRecordedPositions.clear();
  }

  /**
   * Record a frame snapshot of all marbles.
   * Only stores data if marbles moved more than POSITION_THRESHOLD.
   * Records at ~30fps interval (every 33ms).
   */
  recordFrame(marbles: Marble[]): void {
    if (!this.recording) return;

    this.accumulator += 33; // assume ~60fps calls, every second call

    if (this.accumulator < RECORD_INTERVAL) return;
    this.accumulator = 0;

    const elapsed = Date.now() - this.startTime;
    const frameData: ReplayFrame['marbles'] = [];

    for (const marble of marbles) {
      const state = marble.marbleState;
      const lastPos = this.lastRecordedPositions.get(state.id);

      const dx = lastPos ? Math.abs(state.x - lastPos.x) : POSITION_THRESHOLD;
      const dy = lastPos ? Math.abs(state.y - lastPos.y) : POSITION_THRESHOLD;

      if (dx > POSITION_THRESHOLD || dy > POSITION_THRESHOLD) {
        frameData.push({
          id: state.id,
          x: Math.round(state.x * 10) / 10,
          y: Math.round(state.y * 10) / 10,
          rot: Math.round(marble.rotation * 100) / 100,
          speed: Math.round(state.speed * 10) / 10,
        });

        this.lastRecordedPositions.set(state.id, { x: state.x, y: state.y });
      }
    }

    if (frameData.length > 0) {
      this.frames.push({ t: elapsed, marbles: frameData });
    }
  }

  /**
   * Stop recording and return complete replay data.
   */
  stop(): ReplayData {
    this.recording = false;

    const duration = this.frames.length > 0
      ? this.frames[this.frames.length - 1]!.t
      : 0;

    if (!this.raceConfig) {
      throw new Error('ReplayRecorder: no race config set');
    }

    return {
      version: 1,
      raceConfig: {
        ...this.raceConfig,
      },
      frames: this.frames,
      timestamp: Date.now(),
      duration,
    };
  }

  /**
   * Estimate the size of recorded data in bytes (approximate).
   */
  getSize(): number {
    const json = JSON.stringify({
      frames: this.frames,
    });
    return new Blob([json]).size;
  }

  /**
   * Clear all recorded data.
   */
  clear(): void {
    this.frames = [];
    this.lastRecordedPositions.clear();
    this.accumulator = 0;
    this.startTime = 0;
    this.recording = false;
    this.raceConfig = null;
  }
}
