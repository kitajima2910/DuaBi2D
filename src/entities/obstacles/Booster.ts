// ============================================================
// Countries Marble Race — Booster Strip Obstacle
// Speed boost zone: marbles passing over get a velocity impulse.
// Sensor-based with gradient visual effect.
// ============================================================

import { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import type { Marble } from "@/entities/Marble";
import type { ObstacleConfig } from "@/types";

const DEFAULT_STRENGTH = 1.0;
const BOOSTER_LEFT = 0x22c55e;    // green
const BOOSTER_RIGHT = 0x3b82f6;   // blue

export class Booster extends BaseObstacle {
  /** Speed multiplier applied to marble */
  strength: number;

  /** Visual elements */
  private background: Phaser.GameObjects.Rectangle;
  private glowBar: Phaser.GameObjects.Rectangle;

  /** Cooldown to avoid multi-boost per frame */
  private cooldown = new Set<string>();

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    super(scene, config);

    this.strength = config.strength ?? DEFAULT_STRENGTH;

    const { x, y, width, height } = config;

    // Main booster visual — long narrow strip
    this.background = scene.add.rectangle(x, y, width, height, BOOSTER_LEFT, 0.8);
    this.background.setDepth(3);

    // Glow overlay (simulates gradient with a semi-transparent second rect)
    this.glowBar = scene.add.rectangle(x, y, width * 0.9, height * 0.6, BOOSTER_RIGHT, 0.4);
    this.glowBar.setBlendMode(Phaser.BlendModes.ADD);
    this.glowBar.setDepth(4);

    // Arrow indicators inside the booster (small triangles)
    this.drawArrows();
  }

  // ============================================================
  // Body creation — sensor rectangle
  // ============================================================

  protected override createBody(): MatterJS.BodyType {
    // BaseObstacle already creates a sensor for 'booster' type (this.sensor = true)
    const { x, y, width, height, rotation } = this.config;
    const angle = rotation ?? 0;

    const body = this.scene.matter.bodies.rectangle(x, y, width, height, {
      isStatic: true,
      isSensor: true,
      label: 'obstacle',
      angle,
    });

    return body;
  }

  // ============================================================
  // Collision
  // ============================================================

  /**
   * Apply boost to marble along its current velocity direction.
   */
  onMarbleCollide(marble: Marble): void {
    const marbleId = marble.marbleState.id;

    // Cooldown: one boost per frame per marble
    if (this.cooldown.has(marbleId)) return;
    this.cooldown.add(marbleId);

    marble.boost(this.strength);

    // Emit events for particle + camera effects
    this.scene.events.emit('booster-hit', marble.x, marble.y);
  }

  // ============================================================
  // Visual helpers
  // ============================================================

  private drawArrows(): void {
    const { x, y, width } = this.config;
    const arrowSize = 6;
    const spacing = 30;
    const arrows = Math.floor(width / spacing);

    const g = this.scene.add.graphics();
    g.setDepth(5);

    const startX = x - (arrows * spacing) / 2;

    for (let i = 0; i < arrows; i++) {
      const ax = startX + i * spacing + spacing / 2;
      g.fillStyle(0xffffff, 0.5);
      g.fillTriangle(
        ax - arrowSize, y - arrowSize / 2,
        ax - arrowSize, y + arrowSize / 2,
        ax + arrowSize / 2, y,
      );
    }
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
    this.background.destroy();
    this.glowBar.destroy();
    this.cooldown.clear();
    super.destroy();
  }
}
