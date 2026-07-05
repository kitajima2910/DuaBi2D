// ============================================================
// Countries Marble Race — Replay Player
// Frame-by-frame playback with linear interpolation
// ============================================================

import type { ReplayData } from '@/types';

export class ReplayPlayer {
  data: ReplayData;
  currentFrame = 0;
  playing = false;
  speed = 1;
  progress = 0;

  elapsed = 0;
  private destroyed = false;

  constructor(data: ReplayData) {
    this.data = data;
  }

  play(): void {
    this.playing = true;
  }

  pause(): void {
    this.playing = false;
  }

  /**
   * Seek to a specific point in the replay (0 = start, 1 = end).
   */
  seek(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
    this.elapsed = this.progress * this.data.duration;

    // Find the closest frame
    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < this.data.frames.length; i++) {
      const f = this.data.frames[i]!;
      const dist = Math.abs(f.t - this.elapsed);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    this.currentFrame = closestIdx;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * Get interpolated positions for all marbles at current playback time.
   * Returns marbleId -> { x, y, rot }.
   */
  getCurrentPositions(): Map<string, { x: number; y: number; rot: number }> {
    const positions = new Map<string, { x: number; y: number; rot: number }>();

    if (this.data.frames.length === 0) return positions;

    // Get current and next frame for interpolation
    const currentFrame = this.data.frames[this.currentFrame];
    const nextFrame = this.data.frames[Math.min(this.currentFrame + 1, this.data.frames.length - 1)];

    if (!currentFrame) return positions;

    let t = 0;
    if (nextFrame && currentFrame.t < nextFrame.t) {
      t = (this.elapsed - currentFrame.t) / (nextFrame.t - currentFrame.t);
      t = Math.max(0, Math.min(1, t));
    }

    // Build map from current frame
    const currentMap = new Map<string, { x: number; y: number; rot: number }>();
    for (const m of currentFrame.marbles) {
      currentMap.set(m.id, { x: m.x, y: m.y, rot: m.rot });
    }

    // Build map from next frame
    const nextMap = new Map<string, { x: number; y: number; rot: number }>();
    if (nextFrame) {
      for (const m of nextFrame.marbles) {
        nextMap.set(m.id, { x: m.x, y: m.y, rot: m.rot });
      }
    }

    // Interpolate
    for (const [id, cur] of currentMap) {
      const nxt = nextMap.get(id);
      if (nxt && t > 0) {
        positions.set(id, {
          x: cur.x + (nxt.x - cur.x) * t,
          y: cur.y + (nxt.y - cur.y) * t,
          rot: cur.rot + (nxt.rot - cur.rot) * t,
        });
      } else {
        positions.set(id, { ...cur });
      }
    }

    return positions;
  }

  /**
   * Update playback state. Call every frame with delta time in ms.
   */
  update(dt: number): void {
    if (!this.playing || this.destroyed) return;

    this.elapsed += dt * this.speed;
    this.progress = this.data.duration > 0
      ? Math.min(1, this.elapsed / this.data.duration)
      : 1;

    // Advance frame pointer
    while (
      this.currentFrame < this.data.frames.length - 1 &&
      this.data.frames[this.currentFrame + 1]!.t <= this.elapsed
    ) {
      this.currentFrame++;
    }

    if (this.progress >= 1) {
      this.playing = false;
    }
  }

  isFinished(): boolean {
    return this.progress >= 1;
  }

  destroy(): void {
    this.destroyed = true;
    this.playing = false;
  }
}
