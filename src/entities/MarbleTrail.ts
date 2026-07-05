// ============================================================
// Countries Marble Race — Pooled Marble Trail
// Object pool of small circles that create a fading trail
// behind each marble. Uses tween for alpha + scale fade.
// ============================================================

import Phaser from "phaser";

const DEFAULT_MAX_PARTICLES = 200;
const TRAIL_RADIUS = 2;
const FADE_DURATION = 300;

export class MarbleTrail {
  /** Active (visible) trail particles */
  private particles: Phaser.GameObjects.Arc[] = [];

  /** Pool of inactive (reusable) particles */
  private pool: Phaser.GameObjects.Arc[] = [];

  private scene: Phaser.Scene;
  private color: number;

  /** Max particles before recycling the oldest */
  private maxParticles: number;

  constructor(scene: Phaser.Scene, color: number, maxParticles?: number) {
    this.scene = scene;
    this.color = color;
    this.maxParticles = maxParticles ?? DEFAULT_MAX_PARTICLES;

    // Pre-populate pool
    this.fillPool(20);
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Emit a trail particle at (x, y).
   * Fetches from pool or creates new; recycles oldest if at max.
   */
  emit(x: number, y: number): void {
    // Recycle oldest if at capacity
    if (this.particles.length >= this.maxParticles) {
      const oldest = this.particles.shift();
      if (oldest) {
        this.recycle(oldest);
      }
    }

    // Get particle from pool or create new
    let particle = this.pool.pop();
    if (!particle) {
      particle = this.scene.add.circle(x, y, TRAIL_RADIUS, this.color, 1);
      particle.setDepth(1);
    } else {
      particle.setPosition(x, y);
      particle.setFillStyle(this.color, 1);
      particle.setScale(1);
      particle.setAlpha(1);
      particle.setVisible(true);
      particle.setActive(true);
    }

    this.particles.push(particle);

    // Fade out animation
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      scale: 0.5,
      duration: FADE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        this.recycle(particle!);
      },
    });
  }

  /**
   * Change trail colour (for unlockable trails).
   */
  setColor(color: number): void {
    this.color = color;
  }

  /**
   * Clear all active trail particles back to the pool.
   */
  clear(): void {
    for (const p of this.particles) {
      p.setVisible(false);
      p.setActive(false);
      this.pool.push(p);
    }
    this.particles = [];
  }

  /**
   * Destroy all particles and clean up.
   */
  destroy(): void {
    this.clear();

    for (const p of this.pool) {
      p.destroy();
    }
    this.pool = [];
  }

  // ============================================================
  // Internal
  // ============================================================

  /**
   * Recycle a particle back to the pool.
   */
  private recycle(particle: Phaser.GameObjects.Arc): void {
    // Remove from active list
    const idx = this.particles.indexOf(particle);
    if (idx !== -1) {
      this.particles.splice(idx, 1);
    }

    // Stop any active tweens on this particle
    this.scene.tweens.killTweensOf(particle);

    // Hide and return to pool
    particle.setVisible(false);
    particle.setActive(false);
    this.pool.push(particle);
  }

  /**
   * Pre-fill pool with a batch of reusable particles.
   */
  private fillPool(count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.circle(-100, -100, TRAIL_RADIUS, this.color, 1);
      p.setVisible(false);
      p.setActive(false);
      p.setDepth(1);
      this.pool.push(p);
    }
  }
}
