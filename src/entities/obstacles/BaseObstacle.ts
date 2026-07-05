// ============================================================
// Countries Marble Race — Base Obstacle Entity
// ============================================================

import type { ObstacleConfig } from "@/types";
import type { Marble } from "@/entities/Marble";

/**
 * Abstract base for all track obstacles and interactive elements.
 * Each obstacle owns a Matter.js body for collision detection.
 */
export abstract class BaseObstacle {
  body: MatterJS.BodyType;
  sensor: boolean;
  config: ObstacleConfig;
  protected scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    this.scene = scene;
    this.config = config;
    this.sensor = config.type === 'finish' || config.type === 'booster';

    // Create body — subclasses can override shape/options by calling
    // a custom createBody() or by replacing this.body after super().
    this.body = this.createBody();

    // Add to the Matter world
    scene.matter.world.add(this.body);
  }

  /**
   * Create the Matter.js body for this obstacle.
   * Override in subclass for custom shapes.
   */
  protected createBody(): MatterJS.BodyType {
    const { x, y, width, height, rotation } = this.config;
    const angle = rotation ?? 0;

    const body = this.scene.matter.bodies.rectangle(x, y, width, height, {
      isStatic: true,
      isSensor: this.sensor,
      label: 'obstacle',
      angle,
      restitution: 0.8,
      friction: 0.3,
    });

    return body;
  }

  /**
   * Called when a marble collides with this obstacle.
   * Must be implemented by concrete obstacles.
   */
  abstract onMarbleCollide(marble: Marble): void;

  /**
   * Clean up the obstacle body from the physics world.
   */
  destroy(): void {
    this.scene.matter.world.remove(this.body);
  }
}
