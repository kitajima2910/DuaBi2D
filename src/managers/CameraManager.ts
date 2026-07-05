// ============================================================
// Countries Marble Race — Camera Manager
// Smooth follow, dynamic zoom, shake effects.
// ============================================================

import Phaser from "phaser";
import { clamp, lerp } from "@/utils/MathUtils";
import { Marble } from "@/entities/Marble";

/** Camera smoothing factor (0–1). Lower = smoother */
const FOLLOW_LERP = 0.05;

/** Dead zone radius (px) — camera doesn't move if target is within this range of center */
const DEAD_ZONE = 20;

/** Default background color when not using scene bg */
const DEFAULT_BG = 0x0f172a;

export class CameraManager {
  readonly camera: Phaser.Cameras.Scene2D.Camera;

  /** Currently followed marble */
  target: Marble | null = null;

  /** Current zoom level */
  zoom = 1.0;

  /** Intensity of active shake (decays over time) */
  shakeIntensity = 0;

  /** Shake duration remaining (ms) */
  private shakeDuration = 0;

  /** Shake elapsed (ms) */
  private shakeElapsed = 0;

  /** Lead position override (when tracking the leader, not a specific marble) */
  private leadPosition: { x: number; y: number } | null = null;

  /** Smooth-follow internal state */
  private smoothX: number;
  private smoothY: number;

  /** Target zoom for smooth transitions */
  private targetZoom = 1.0;

  /** Is the race active (for dynamic zoom calculations) */
  private racing = false;

  constructor(camera: Phaser.Cameras.Scene2D.Camera) {
    this.camera = camera;
    this.smoothX = camera.centerX;
    this.smoothY = camera.centerY;

    // Initialize camera
    this.camera.setBackgroundColor(DEFAULT_BG);
    this.camera.setZoom(0.5); // Start zoomed out
    this.targetZoom = 0.5;
    this.zoom = 0.5;
  }

  // ============================================================
  // Targeting
  // ============================================================

  /**
   * Follow a specific marble.
   */
  setTarget(marble: Marble): void {
    this.target = marble;
    this.leadPosition = null;
  }

  /**
   * Follow the leader's position (average of all marbles).
   */
  setLeaderTarget(leaderPosition: { x: number; y: number }): void {
    this.leadPosition = leaderPosition;
    this.target = null;
  }

  /**
   * Call once when the racing phase starts to zoom in.
   */
  setRacing(racing: boolean): void {
    this.racing = racing;
    if (racing) {
      this.targetZoom = 1.0;
    }
  }

  // ============================================================
  // Shake
  // ============================================================

  /**
   * Trigger a camera shake effect.
   * @param intensity Max offset in pixels (default 8)
   * @param duration Duration in ms (default 300)
   */
  shake(intensity = 8, duration = 300): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeElapsed = 0;
  }

  /**
   * Set a sustained shake intensity that decays exponentially
   * over time rather than a fixed duration.
   * @param intensity Initial intensity (0 to disable)
   */
  setShakeIntensity(intensity: number): void {
    this.shakeIntensity = Math.max(0, intensity);
    if (intensity > 0 && this.shakeDuration <= 0) {
      // Set a long nominal duration; actual sustain via decay
      this.shakeDuration = 10000;
      this.shakeElapsed = 0;
    }
  }

  // ============================================================
  // Zoom
  // ============================================================

  /**
   * Smoothly transition to a zoom level.
   */
  zoomTo(zoom: number, _duration?: number): void {
    this.targetZoom = clamp(zoom, 0.3, 2.0);
  }

  // ============================================================
  // Update
  // ============================================================

  /**
   * Call every frame from the scene update.
   * @param dt Delta time in milliseconds
   * @param marblePositions Current positions of all active marbles (for dynamic zoom)
   */
  update(dt: number, marblePositions?: { x: number; y: number }[]): void {
    // --- Follow target ---
    let followX: number | null = null;
    let followY: number | null = null;

    if (this.target) {
      followX = this.target.x;
      followY = this.target.y;
    } else if (this.leadPosition) {
      followX = this.leadPosition.x;
      followY = this.leadPosition.y;
    }

    if (followX !== null && followY !== null) {
      // Dead zone check
      const dx = followX - this.smoothX;
      const dy = followY - this.smoothY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > DEAD_ZONE) {
        this.smoothX = lerp(this.smoothX, followX, FOLLOW_LERP);
        this.smoothY = lerp(this.smoothY, followY, FOLLOW_LERP);
      }
    }

    this.camera.centerOn(this.smoothX, this.smoothY);

    // --- Dynamic zoom based on pack spread ---
    if (this.racing && marblePositions && marblePositions.length > 1) {
      this.updateDynamicZoom(marblePositions);
    }

    // Smooth zoom
    this.zoom = lerp(this.zoom, this.targetZoom, 0.03);
    this.camera.setZoom(this.zoom);

    // --- Shake (improved: hybrid linear + exponential decay) ---
    if (this.shakeIntensity > 0 && this.shakeElapsed < this.shakeDuration) {
      this.shakeElapsed += dt;

      // Exponential decay factor: drops to ~5% after `shakeDuration`
      const decay = Math.exp(-3 * (this.shakeElapsed / this.shakeDuration));

      // Final intensity after decay
      const currentIntensity = this.shakeIntensity * decay;

      if (currentIntensity > 0.5) {
        const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
        const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

        this.camera.setScroll(
          this.camera.scrollX + offsetX,
          this.camera.scrollY + offsetY,
        );
      }

      if (this.shakeElapsed >= this.shakeDuration || currentIntensity < 0.1) {
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeElapsed = 0;
      }
    }
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    this.target = null;
    this.leadPosition = null;
    this.camera.resetFX();
  }

  // ============================================================
  // Internals
  // ============================================================

  /**
   * Compute pack spread and adjust zoom accordingly.
   * Tight pack (spread < 200) → zoom 1.0
   * Medium pack (spread 200–400) → zoom 0.8
   * Loose pack (spread 400–600) → zoom 0.6
   * Very spread (spread > 600) → zoom 0.5
   */
  private updateDynamicZoom(positions: { x: number; y: number }[]): void {
    if (positions.length < 2) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const pos of positions) {
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x > maxX) maxX = pos.x;
      if (pos.y > maxY) maxY = pos.y;
    }

    const spread = Math.max(maxX - minX, maxY - minY);

    let targetZoom: number;
    if (spread < 200) {
      targetZoom = 1.0;
    } else if (spread < 400) {
      targetZoom = 0.8;
    } else if (spread < 600) {
      targetZoom = 0.6;
    } else {
      targetZoom = 0.5;
    }

    this.targetZoom = targetZoom;
  }
}
