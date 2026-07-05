// ============================================================
// Countries Marble Race — Bumper Obstacle
// Circular bounce pad that launches marbles away with high restitution.
// Neon visual + particle + screen shake on hit.
// ============================================================

import { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import type { Marble } from "@/entities/Marble";
import type { ObstacleConfig } from "@/types";
import { BUMPER_BOUNCE_MULTIPLIER } from "@/config/GameConfig";

const DEFAULT_RADIUS = 18;
const BUMPER_COLOR = 0x22d3ee;
const BUMPER_STROKE = 0x06b6d4;

export class Bumper extends BaseObstacle {
  /** Bounce strength multiplier applied to marble velocity */
  bounceMultiplier: number;

  /** Visual arc/circle */
  visual: Phaser.GameObjects.Arc;

  /** Cooldown to avoid rapid re-trigger */
  private cooldown = new Set<string>();

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    super(scene, config);

    this.bounceMultiplier = config.strength ?? BUMPER_BOUNCE_MULTIPLIER;

    // Visual — circle with neon fill + stroke
    const radius = Math.min(config.width, config.height) / 2 || DEFAULT_RADIUS;
    this.visual = scene.add.circle(config.x, config.y, radius, BUMPER_COLOR, 0.9);
    this.visual.setStrokeStyle(2, BUMPER_STROKE, 1);
    this.visual.setDepth(3);

    // Subtle glow effect via a larger semi-transparent circle
    const glow = scene.add.circle(config.x, config.y, radius * 1.3, BUMPER_COLOR, 0.15);
    glow.setDepth(2);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    this.visual.setData('glow', glow);
  }

  // ============================================================
  // Body creation — static circle with high restitution
  // ============================================================

  protected override createBody(): MatterJS.BodyType {
    const { x, y } = this.config;
    const radius = Math.min(this.config.width, this.config.height) / 2 || DEFAULT_RADIUS;

    const body = this.scene.matter.bodies.circle(x, y, radius, {
      isStatic: true,
      isSensor: false,
      label: 'obstacle',
      restitution: 0.8,
      friction: 0.1,
    });

    return body;
  }

  // ============================================================
  // Collision
  // ============================================================

  /**
   * On collision: compute bounce direction from bumper center to marble
   * and apply a strong impulse via marble.applyBounce().
   */
  onMarbleCollide(marble: Marble): void {
    const marbleId = marble.marbleState.id;

    // Cooldown: only bounce once per frame per marble
    if (this.cooldown.has(marbleId)) return;
    this.cooldown.add(marbleId);

    const dx = marble.x - this.config.x;
    const dy = marble.y - this.config.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.1) {
      // Marble is exactly on center — push upward
      marble.applyBounce(0, -1, this.bounceMultiplier);
    } else {
      const nx = dx / dist;
      const ny = dy / dist;
      marble.applyBounce(nx, ny, this.bounceMultiplier);
    }

    // Emit events for particle and camera effects
    this.scene.events.emit('bumper-hit', marble.x, marble.y, BUMPER_COLOR);
  }

  // ============================================================
  // Cooldown
  // ============================================================

  clearCooldowns(): void {
    this.cooldown.clear();
  }

  // ============================================================
  // Cleanup
  // ============================================================

  override destroy(): void {
    const glow = this.visual.getData('glow') as Phaser.GameObjects.Arc | undefined;
    glow?.destroy();
    this.visual.destroy();
    this.cooldown.clear();
    super.destroy();
  }
}
