// ============================================================
// Countries Marble Race — Pooled Particle Effects
// Burst, trail, fireworks, bounce, boost, elimination.
// Dedicated emitters per effect type — no shared state mutation.
// ============================================================

import Phaser from "phaser";

/** Small particle texture key */
const PARTICLE_KEY = '_cmr_particle';

/** White circle texture key for tinting */
const GLOW_KEY = '_cmr_glow';

export class ParticleManager {
  private scene: Phaser.Scene;
  private texturesInitialized = false;

  // Dedicated emitters per effect type — each pre-configured with its own config
  private burstEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private splitLeftEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private splitRightEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private spinnerEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private spinnerSecondaryEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.ensureTextures();
  }

  // ============================================================
  // Public Effects
  // ============================================================

  /**
   * Small burst of particles at a point (e.g., marble collision).
   */
  emitBurst(x: number, y: number, color: number, count = 8): void {
    this.emitColoredBurst(x, y, color, count);
  }

  /**
   * Continuous trail behind a marble.
   */
  emitTrail(marble: { x: number; y: number }): void {
    const e = this.getTrailEmitter();
    if (!e) return;
    e.emitParticleAt(marble.x, marble.y, 1);
  }

  /**
   * Large firework burst — multiple colors, upward direction.
   */
  emitFinishFireworks(x: number, y: number): void {
    const colors = [0xff0040, 0xffd700, 0x00ff80, 0x40a0ff, 0xff40ff, 0x80ff40];

    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const cx = x + (Math.random() - 0.5) * 80;
        const cy = y + (Math.random() - 0.5) * 60;
        const color = colors[Math.floor(Math.random() * colors.length)]!;

        this.emitColoredBurst(cx, cy, color, 10);

        // Secondary pop
        this.scene.time.delayedCall(150, () => {
          this.emitColoredBurst(
            cx + (Math.random() - 0.5) * 30,
            cy + (Math.random() - 0.5) * 30,
            color,
            5,
          );
        });
      });
    }
  }

  /**
   * Small bounce puff (marble hits wall).
   */
  emitBounce(x: number, y: number): void {
    this.emitColoredBurst(x, y, 0x94a3b8, 4);
  }

  /**
   * Boost thrust particles behind marble.
   */
  emitBoost(x: number, y: number, color: number): void {
    const e = this.getBurstEmitter();
    if (!e) return;
    e.setParticleTint(color);
    e.emitParticleAt(x, y, 3);
  }

  /**
   * Elimination explosion.
   */
  emitElimination(x: number, y: number): void {
    const e = this.getBurstEmitter();
    if (!e) return;

    e.setParticleTint(0xef4444);
    e.explode(15, x, y);

    // Smoke rings
    this.scene.time.delayedCall(100, () => {
      e.setParticleTint(0x64748b);
      e.explode(8, x, y);
    });
  }

  // ============================================================
  // Phase 2 — New effects
  // ============================================================

  /**
   * Burst at a split path decision point — two diverging streams.
   */
  emitSplit(x: number, y: number): void {
    // Left stream: green burst at ~225° (dedicated pre-configured emitter)
    const left = this.getSplitLeftEmitter();
    if (left) {
      left.setParticleTint(0x22c55e);
      left.explode(6, x, y);
    }

    // Right stream: blue burst at ~315° (delayed for visual separation)
    this.scene.time.delayedCall(50, () => {
      const right = this.getSplitRightEmitter();
      if (right) {
        right.setParticleTint(0x3b82f6);
        right.explode(6, x, y);
      }
    });
  }

  /**
   * Burst effect when a marble is hit by a spinner obstacle.
   * Orange sparks radiating outward.
   */
  emitSpinnerHit(x: number, y: number): void {
    // Primary burst: fast orange sparks
    const primary = this.getSpinnerEmitter();
    if (primary) {
      primary.setParticleTint(0xf59e0b);
      primary.explode(10, x, y);
    }

    // Secondary smaller burst: slower yellow sparks
    this.scene.time.delayedCall(80, () => {
      const secondary = this.getSpinnerSecondaryEmitter();
      if (secondary) {
        secondary.setParticleTint(0xfbbf24);
        secondary.explode(5, x, y);
      }
    });
  }

  // ============================================================
  // Internal
  // ============================================================

  /**
   * Emit a burst with a specific color via the burst emitter.
   */
  private emitColoredBurst(x: number, y: number, color: number, count: number): void {
    const e = this.getBurstEmitter();
    if (!e) return;
    e.setParticleTint(color);
    e.explode(count, x, y);
  }

  /**
   * Create a particle emitter with the given config, wrapped in try-catch.
   */
  private tryCreateEmitter(
    config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig,
  ): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.texturesInitialized) {
      this.ensureTextures();
    }
    try {
      const emitter = this.scene.add.particles(0, 0, PARTICLE_KEY, config);
      emitter.setDepth(1000);
      return emitter;
    } catch (_err) {
      console.warn('[ParticleManager] Failed to create emitter');
      return null;
    }
  }

  /**
   * Get or create the burst emitter (default config).
   */
  private getBurstEmitter(): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.burstEmitter) {
      this.burstEmitter = this.tryCreateEmitter({
        speed: { min: 30, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 200, max: 500 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
    }
    return this.burstEmitter;
  }

  /**
   * Get or create the trail emitter (default config, independent instance).
   */
  private getTrailEmitter(): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.trailEmitter) {
      this.trailEmitter = this.tryCreateEmitter({
        speed: { min: 30, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 200, max: 500 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
    }
    return this.trailEmitter;
  }

  /**
   * Get or create the split left emitter (angled stream).
   */
  private getSplitLeftEmitter(): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.splitLeftEmitter) {
      this.splitLeftEmitter = this.tryCreateEmitter({
        speed: { min: 30, max: 150 },
        angle: { min: 200, max: 250 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 200, max: 500 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
    }
    return this.splitLeftEmitter;
  }

  /**
   * Get or create the split right emitter (angled stream).
   */
  private getSplitRightEmitter(): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.splitRightEmitter) {
      this.splitRightEmitter = this.tryCreateEmitter({
        speed: { min: 30, max: 150 },
        angle: { min: 290, max: 340 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 200, max: 500 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
    }
    return this.splitRightEmitter;
  }

  /**
   * Get or create the spinner primary emitter (fast sparks).
   */
  private getSpinnerEmitter(): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.spinnerEmitter) {
      this.spinnerEmitter = this.tryCreateEmitter({
        speed: { min: 60, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 200, max: 500 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
    }
    return this.spinnerEmitter;
  }

  /**
   * Get or create the spinner secondary emitter (slower sparks).
   */
  private getSpinnerSecondaryEmitter(): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.spinnerSecondaryEmitter) {
      this.spinnerSecondaryEmitter = this.tryCreateEmitter({
        speed: { min: 30, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 200, max: 500 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
    }
    return this.spinnerSecondaryEmitter;
  }

  /**
   * Generate particle textures if they don't exist.
   */
  private ensureTextures(): void {
    if (this.texturesInitialized) return;

    const texManager = this.scene.textures;

    if (!texManager.exists(PARTICLE_KEY)) {
      const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture(PARTICLE_KEY, 8, 8);
      g.destroy();
    }

    if (!texManager.exists(GLOW_KEY)) {
      const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(8, 8, 8);
      g.generateTexture(GLOW_KEY, 16, 16);
      g.destroy();
    }

    this.texturesInitialized = true;
  }

  /**
   * Stub update (maintained for interface consistency).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dt: number): void {
    // Particle lifecycle is managed by Phaser's particle system
  }

  /**
   * Clean up — destroy all emitters.
   */
  destroy(): void {
    const emitters = [
      this.burstEmitter,
      this.trailEmitter,
      this.splitLeftEmitter,
      this.splitRightEmitter,
      this.spinnerEmitter,
      this.spinnerSecondaryEmitter,
    ];
    for (const e of emitters) {
      if (e) e.destroy();
    }
    this.burstEmitter = null;
    this.trailEmitter = null;
    this.splitLeftEmitter = null;
    this.splitRightEmitter = null;
    this.spinnerEmitter = null;
    this.spinnerSecondaryEmitter = null;

    const texManager = this.scene.textures;
    if (texManager.exists(PARTICLE_KEY)) {
      texManager.remove(PARTICLE_KEY);
    }
    if (texManager.exists(GLOW_KEY)) {
      texManager.remove(GLOW_KEY);
    }

    this.texturesInitialized = false;
  }
}
