// ============================================================
// Countries Marble Race — Custom Rolling Physics
// ============================================================

import { MARBLE_MAX_SPEED, MARBLE_RADIUS } from "@/config/GameConfig";

/**
 * Rollig physics layer on top of Matter.js.
 * Provides ramp force, friction, rolling resistance, speed capping,
 * and visual rotation for marbles.
 */
export class RollingPhysics {
  /**
   * Apply gravitational force component along a slope.
   * @param body - The Matter.js body of the marble
   * @param rampAngle - Angle of the slope in radians
   * @param dt - Delta time in seconds
   */
  static applyRampForce(
    body: MatterJS.BodyType,
    rampAngle: number,
    dt: number,
  ): void {
    // Gravity component along the slope: g * sin(angle)
    const forceMag = 0.002 * Math.sin(rampAngle) * dt;

    if (Math.abs(forceMag) < 0.0001) return;

    body.force.x += forceMag * Math.cos(rampAngle);
    body.force.y += forceMag * Math.sin(rampAngle);
  }

  /**
   * Apply friction deceleration when not boosting.
   * Reduces speed by a constant amount per frame (simulates kinetic friction).
   * @param body - The Matter.js body of the marble
   * @param dt - Delta time in seconds
   */
  static applyFriction(body: MatterJS.BodyType, dt: number): void {
    const speed = Math.sqrt(
      body.velocity.x * body.velocity.x +
        body.velocity.y * body.velocity.y,
    );

    if (speed < 0.01) return;

    // Constant deceleration model for friction
    const decel = 0.3 * dt;
    const newSpeed = Math.max(0, speed - decel);
    const scale = newSpeed / speed;

    body.velocity.x *= scale;
    body.velocity.y *= scale;
  }

  /**
   * Apply rolling resistance proportional to speed.
   * @param body - The Matter.js body of the marble
   * @param dt - Delta time in seconds
   */
  static applyRollingResistance(body: MatterJS.BodyType, dt: number): void {
    const resistance = 0.02 * dt;
    body.velocity.x *= 1 - resistance;
    body.velocity.y *= 1 - resistance;
  }

  /**
   * Clamp marble speed to maximum allowed speed.
   * @param body - The Matter.js body of the marble
   */
  static clampSpeed(body: MatterJS.BodyType): void {
    const speed = Math.sqrt(
      body.velocity.x * body.velocity.x +
        body.velocity.y * body.velocity.y,
    );

    if (speed > MARBLE_MAX_SPEED) {
      const scale = MARBLE_MAX_SPEED / speed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }
  }

  /**
   * Update visual rotation of the marble container to simulate rolling.
   * Rotation angle accumulates based on distance traveled / radius.
   * @param container - The Phaser Container (Marble) to rotate
   * @param body - The Matter.js body with velocity data
   * @param dt - Delta time in seconds
   */
  static updateMarbleRotation(
    container: Phaser.GameObjects.Container,
    body: MatterJS.BodyType,
    dt: number,
  ): void {
    const speed = Math.sqrt(
      body.velocity.x * body.velocity.x +
        body.velocity.y * body.velocity.y,
    );

    // Rolling angular velocity = linear velocity / radius
    // Accumulate over time for visual effect
    container.rotation += (speed / MARBLE_RADIUS) * dt;
  }
}
