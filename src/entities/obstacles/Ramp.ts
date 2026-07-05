// ============================================================
// Countries Marble Race — Ramp Obstacle
// Matter.js static rectangle body with angle.
// When a marble rolls over it, the ramp angle is applied to
// the marble's physics via RollingPhysics.
// ============================================================

import { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import type { Marble } from "@/entities/Marble";
import type { ObstacleConfig } from "@/types";
import { radToDeg } from "@/utils/MathUtils";

export class Ramp extends BaseObstacle {
  /** Ramp angle in degrees (positive = downhill from left to right) */
  angle: number;

  private visual: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    super(scene, config);

    // Convert radians (Matter.js) to degrees for the public property
    this.angle = radToDeg(config.rotation ?? 0);

    // Draw the wedge-shaped visual
    this.visual = scene.add.graphics();
    this.drawVisual();
    this.visual.setDepth(3);
  }

  // ============================================================
  // Body creation — rectangle with rotation
  // ============================================================

  protected override createBody(): MatterJS.BodyType {
    const { x, y, width, height, rotation } = this.config;
    const angle = rotation ?? 0;

    const body = this.scene.matter.bodies.rectangle(x, y, width, height, {
      isStatic: true,
      isSensor: false,
      label: 'obstacle',
      angle,
      restitution: 0.6,
      friction: 0.4,
    });

    return body;
  }

  // ============================================================
  // Collision
  // ============================================================

  /**
   * When a marble collides with the ramp, set its onRamp flag
   * and store the ramp angle so RollingPhysics can apply slope force.
   */
  onMarbleCollide(marble: Marble): void {
    marble.marbleState.onRamp = true;
    marble.marbleState.rampAngle = this.angle;
  }

  // ============================================================
  // Visual
  // ============================================================

  private drawVisual(): void {
    const { x, y, width, height, rotation } = this.config;
    const angle = rotation ?? 0;

    this.visual.clear();

    // Ramp body colour — earthy brown
    const fillColor = 0x92400e;
    const strokeColor = 0x78350f;

    // Draw a filled rectangle with rotation (approximating a wedge)
    this.visual.save();
    this.visual.translateCanvas(x, y);
    this.visual.rotateCanvas(angle);

    // Triangle wedge: pointing in the downhill direction
    const hw = width / 2;
    const hh = height / 2;

    this.visual.fillStyle(fillColor, 1);
    this.visual.lineStyle(2, strokeColor, 1);

    this.visual.beginPath();
    this.visual.moveTo(-hw, hh);      // bottom-left
    this.visual.lineTo(hw, hh);       // bottom-right
    this.visual.lineTo(-hw, -hh);     // top-left (wedge)
    this.visual.closePath();
    this.visual.fillPath();
    this.visual.strokePath();

    // Surface highlight — thin line on the slope face
    this.visual.lineStyle(1, 0xfbbf24, 0.3);
    this.visual.beginPath();
    this.visual.moveTo(-hw + 4, hh - 2);
    this.visual.lineTo(hw - 4, hh - 2);
    this.visual.strokePath();

    this.visual.restore();
  }

  // ============================================================
  // Cleanup
  // ============================================================

  override destroy(): void {
    this.visual.destroy();
    super.destroy();
  }
}
