// ============================================================
// Countries Marble Race — Elimination Zone
// Hazard zone that eliminates marbles that fall into it.
// Visual: red semi-transparent area with pulsing border.
// ============================================================

import { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import type { Marble } from "@/entities/Marble";
import type { ObstacleConfig } from "@/types";
import { eventBus } from "@/utils/EventBus";

const FILL_COLOR = 0xef4444;
const FILL_ALPHA = 0.3;
const STROKE_COLOR = 0xdc2626;

export class EliminationZone extends BaseObstacle {
  /** Visual elements */
  private fill: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;

  /** Tween for border pulse */
  private pulseTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    super(scene, config);

    const { x, y, width, height } = config;

    // Solid fill
    this.fill = scene.add.rectangle(x, y, width, height, FILL_COLOR, FILL_ALPHA);
    this.fill.setDepth(2);

    // Pulsing border
    this.border = scene.add.rectangle(x, y, width, height);
    this.border.setStrokeStyle(2, STROKE_COLOR, 0.8);
    this.border.setDepth(3);

    // Start pulse animation
    this.startPulse();

    // Warning overlay: diagonal lines (hazard stripes)
    this.drawHazardStripes();
  }

  // ============================================================
  // Body creation — sensor rectangle
  // ============================================================

  protected override createBody(): MatterJS.BodyType {
    const { x, y, width, height } = this.config;

    const body = this.scene.matter.bodies.rectangle(x, y, width, height, {
      isStatic: true,
      isSensor: true,
      label: 'obstacle',
    });

    return body;
  }

  // ============================================================
  // Collision
  // ============================================================

  /**
   * Eliminate the marble if it hasn't finished the race.
   */
  onMarbleCollide(marble: Marble): void {
    // Only eliminate if marble hasn't finished
    if (marble.marbleState.finished) return;

    // Avoid double-elimination
    if (marble.marbleState.eliminated) return;

    marble.eliminate();

    // Emit events for particle + sound
    this.scene.events.emit('marble-eliminated', marble.x, marble.y, marble.marbleState.id);
    eventBus.emit('race:marble-eliminate', marble.marbleState.id);
  }

  // ============================================================
  // Visual helpers
  // ============================================================

  /**
   * Pulsing border animation.
   */
  private startPulse(): void {
    this.pulseTween = this.scene.tweens.add({
      targets: this.border,
      alpha: { from: 0.8, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Draw hazard warning stripes (diagonal lines).
   */
  private drawHazardStripes(): void {
    const { x, y, width, height } = this.config;
    const g = this.scene.add.graphics();
    g.setDepth(2);

    const stripeWidth = 20;
    const spacing = 30;
    const halfW = width / 2;
    const halfH = height / 2;

    g.lineStyle(1, 0xef4444, 0.2);

    // Diagonal stripes from top-left to bottom-right
    const startX = x - halfW - halfH;
    const endX = x + halfW + halfH;

    for (let sx = startX; sx < endX; sx += spacing) {
      g.beginPath();
      g.moveTo(sx, y - halfH);
      g.lineTo(sx + stripeWidth, y + halfH);
      g.strokePath();
    }
  }

  // ============================================================
  // Cleanup
  // ============================================================

  override destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }
    this.fill.destroy();
    this.border.destroy();
    super.destroy();
  }
}
