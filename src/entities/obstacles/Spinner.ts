// ============================================================
// Countries Marble Race — Spinner Obstacle
// Rotating "X" shape that knocks marbles away on contact.
// Sensor-based: detects overlap and applies impulse manually.
// ============================================================

import { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import type { Marble } from "@/entities/Marble";
import type { ObstacleConfig } from "@/types";
const DEFAULT_ROTATION_SPEED = 3;   // rad/s
const KNOCKBACK_FORCE = 0.08;
const ARM_LENGTH_RATIO = 0.6;       // arm length relative to config width
const ARM_WIDTH = 4;

export class Spinner extends BaseObstacle {
  /** Rotation speed in rad/s */
  rotationSpeed: number;

  /** Current rotation angle (accumulated) */
  private currentAngle = 0;

  /** Visual graphics object */
  visual: Phaser.GameObjects.Graphics;

  /** Cooldown map to prevent multi-knockback per marble */
  private knockbackCooldown = new Set<string>();

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    super(scene, config);

    this.rotationSpeed = config.strength ?? DEFAULT_ROTATION_SPEED;

    // Visual
    this.visual = scene.add.graphics();
    this.drawVisual();
    this.visual.setDepth(3);
  }

  // ============================================================
  // Body creation — sensor circle for overlap detection
  // ============================================================

  protected override createBody(): MatterJS.BodyType {
    const { x, y } = this.config;
    const radius = Math.max(this.config.width, this.config.height) / 2;

    const body = this.scene.matter.bodies.circle(x, y, radius, {
      isStatic: true,
      isSensor: true,
      label: 'obstacle',
    });

    return body;
  }

  // ============================================================
  // Update — rotate visual + body
  // ============================================================

  update(dt: number): void {
    this.currentAngle += this.rotationSpeed * dt;

    // Rotate the visual
    this.drawVisual();

    // Rotate the sensor body (for visual consistency; sensor shape doesn't affect overlaps)
    const angle = this.currentAngle % (Math.PI * 2);
    this.scene.matter.body.setAngle(this.body, angle);
  }

  // ============================================================
  // Collision
  // ============================================================

  /**
   * On collision: calculate direction from spinner center to marble,
   * apply knockback force + angular impulse.
   */
  onMarbleCollide(marble: Marble): void {
    const marbleId = marble.marbleState.id;

    // Cooldown to avoid multi-knockback in same frame
    if (this.knockbackCooldown.has(marbleId)) return;
    this.knockbackCooldown.add(marbleId);

    const { x: cx, y: cy } = this.config;
    const dx = marble.x - cx;
    const dy = marble.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.1) {
      // Marble is at center — push in a default direction
      marble.body.force.x += KNOCKBACK_FORCE * 0.5;
      marble.body.force.y -= KNOCKBACK_FORCE * 0.5;
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;

    // Radial knockback (away from spinner center)
    marble.body.force.x += nx * KNOCKBACK_FORCE;
    marble.body.force.y += ny * KNOCKBACK_FORCE;

    // Tangential impulse (simulates "spin" hitting the marble)
    // Perpendicular to radial direction
    const tx = -ny;
    const ty = nx;
    const spinFactor = 0.03 * this.rotationSpeed;
    marble.body.force.x += tx * spinFactor;
    marble.body.force.y += ty * spinFactor;

    // Emit particle effect via scene event
    this.scene.events.emit('spinner-hit', marble.x, marble.y);
  }

  // ============================================================
  // Visual
  // ============================================================

  private drawVisual(): void {
    const { x, y } = this.config;
    const radius = Math.max(this.config.width, this.config.height) / 2;
    const armLen = radius * ARM_LENGTH_RATIO;

    this.visual.clear();

    // Spinner hub — small circle
    this.visual.fillStyle(0x94a3b8, 1);
    this.visual.fillCircle(x, y, 6);

    // Rotating X — two crossed lines
    const cos = Math.cos(this.currentAngle);
    const sin = Math.sin(this.currentAngle);

    // Arm end offsets
    const ax1 = armLen * cos;
    const ay1 = armLen * sin;
    const ax2 = armLen * (-sin);
    const ay2 = armLen * cos;

    // First arm
    this.visual.lineStyle(ARM_WIDTH, 0xf59e0b, 1);
    this.visual.beginPath();
    this.visual.moveTo(x - ax1, y - ay1);
    this.visual.lineTo(x + ax1, y + ay1);
    this.visual.strokePath();

    // Second arm (perpendicular)
    this.visual.lineStyle(ARM_WIDTH, 0xf59e0b, 0.8);
    this.visual.beginPath();
    this.visual.moveTo(x - ax2, y - ay2);
    this.visual.lineTo(x + ax2, y + ay2);
    this.visual.strokePath();

    // Center dot
    this.visual.fillStyle(0xfbbf24, 1);
    this.visual.fillCircle(x, y, 3);
  }

  // ============================================================
  // Cooldown management
  // ============================================================

  /**
   * Clear knockback cooldowns — call at end of frame.
   */
  clearCooldowns(): void {
    this.knockbackCooldown.clear();
  }

  // ============================================================
  // Cleanup
  // ============================================================

  override destroy(): void {
    this.visual.destroy();
    this.knockbackCooldown.clear();
    super.destroy();
  }
}
