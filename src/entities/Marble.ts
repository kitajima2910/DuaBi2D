// ============================================================
// Countries Marble Race — Marble Entity
// ============================================================

import Phaser from "phaser";
import type { MarbleState } from "@/types";
import {
  MARBLE_RADIUS,
  MARBLE_FRICTION,
  MARBLE_BOUNCE,
  BOOST_SPEED_MULTIPLIER,
} from "@/config/GameConfig";
import type { MarbleTrail } from "@/entities/MarbleTrail";
let marbleIdCounter = 0;

/**
 * Marble entity — a Phaser Container with a Matter.js physics body.
 *
 * Visual hierarchy:
 *   1. Glow sprite (semi-transparent, scaled up)
 *   2. Main flag sprite (circular, using FlagGenerator texture)
 *
 * The physics body is created separately and synced each frame.
 */
export class Marble extends Phaser.GameObjects.Container {
  override body: MatterJS.BodyType;
  marbleState: MarbleState;
  /** Reference to the trail effect (set externally by trail system) */
  trail: MarbleTrail | undefined;
  private flagSprite: Phaser.GameObjects.Image;
  private glowSprite: Phaser.GameObjects.Image;
  private prevX: number;
  private prevY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, countryId: string) {
    super(scene, x, y);

    marbleIdCounter++;
    const marbleId = `marble_${countryId}_${marbleIdCounter}`;

    // ---- Marble state ----
    this.marbleState = {
      id: marbleId,
      countryId,
      x,
      y,
      speed: 0,
      progress: 0,
      finished: false,
      eliminated: false,
      finishTime: 0,
      rank: 0,
      lap: 0,
      onRamp: false,
      rampAngle: 0,
      airborne: false,
      boosting: false,
    };

    this.prevX = x;
    this.prevY = y;

    // ---- Flag sprite ----
    const texKey = `flag_${countryId}`;
    if (!scene.textures.exists(texKey)) {
      console.warn(`[Marble] Texture "${texKey}" not found — using fallback`);
    }

    this.flagSprite = scene.make.image({
      x: 0,
      y: 0,
      key: texKey,
      add: false,
    });
    this.flagSprite.setDisplaySize(MARBLE_RADIUS * 2, MARBLE_RADIUS * 2);
    this.add(this.flagSprite);

    // ---- Glow sprite ----
    this.glowSprite = scene.make.image({
      x: 0,
      y: 0,
      key: texKey,
      add: false,
    });
    this.glowSprite.setDisplaySize(
      MARBLE_RADIUS * 3,
      MARBLE_RADIUS * 3,
    );
    this.glowSprite.setAlpha(0.15);
    this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
    this.glowSprite.setDepth(-1);
    this.add(this.glowSprite);

    // Add container to scene
    scene.add.existing(this);

    // ---- Physics body ----
    this.body = scene.matter.bodies.circle(x, y, MARBLE_RADIUS, {
      friction: MARBLE_FRICTION,
      frictionAir: 0.01,
      restitution: MARBLE_BOUNCE,
      density: 0.002,
      label: 'marble',
    });

    // Add body to the Matter world
    scene.matter.world.add(this.body);

    this.setDepth(10);
  }

  /**
   * Reset the marble for a new race or position.
   */
  reset(x: number, y: number, countryId: string): void {
    this.setPosition(x, y);
    this.setVisible(true);
    this.setActive(true);
    this.setAlpha(1);
    this.rotation = 0;

    this.prevX = x;
    this.prevY = y;

    // Reset body position and velocity
    this.scene.matter.body.setPosition(this.body, { x, y });
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.body.force.x = 0;
    this.body.force.y = 0;
    this.body.isStatic = false;

    // Reset state
    this.marbleState = {
      ...this.marbleState,
      x,
      y,
      speed: 0,
      progress: 0,
      finished: false,
      eliminated: false,
      finishTime: 0,
      rank: 0,
      lap: 0,
      onRamp: false,
      rampAngle: 0,
      airborne: false,
      boosting: false,
    };

    // Update flag texture if country changed
    const texKey = `flag_${countryId}`;
    if (this.flagSprite.texture.key !== texKey) {
      this.flagSprite.setTexture(texKey);
      this.glowSprite.setTexture(texKey);
    }
  }

  /**
   * Apply a boost multiplier to the marble's velocity.
   */
  boost(multiplier: number): void {
    const speed = Math.sqrt(
      this.body.velocity.x * this.body.velocity.x +
        this.body.velocity.y * this.body.velocity.y,
    );

    if (speed > 0.1) {
      const nx = this.body.velocity.x / speed;
      const ny = this.body.velocity.y / speed;
      const boostForce = BOOST_SPEED_MULTIPLIER * multiplier * 0.05;

      this.body.force.x += nx * boostForce;
      this.body.force.y += ny * boostForce;
    }

    this.marbleState.boosting = true;
  }

  /**
   * Apply a bounce impulse in the given normal direction.
   * @param nx - Normal X component
   * @param ny - Normal Y component
   * @param multiplier - Bounce strength multiplier
   */
  applyBounce(nx: number, ny: number, multiplier: number): void {
    const speed = Math.sqrt(
      this.body.velocity.x * this.body.velocity.x +
        this.body.velocity.y * this.body.velocity.y,
    );

    const bounceImpulse = speed * multiplier * 0.1;

    this.body.force.x += nx * bounceImpulse;
    this.body.force.y += ny * bounceImpulse;
  }

  /**
   * Mark the marble as eliminated (visual + state).
   */
  eliminate(): void {
    this.marbleState.eliminated = true;
    this.flagSprite.setAlpha(0.5);
    this.flagSprite.setTint(0x666666);
    this.glowSprite.setAlpha(0.05);
  }

  /**
   * Mark the marble as finished at the given time.
   */
  finish(finishTime: number): void {
    this.marbleState.finished = true;
    this.marbleState.finishTime = finishTime;

    // Stop the body
    this.body.isStatic = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  /**
   * Apply a tint to the marble's flag and glow sprites (for skins).
   */
  setSkinTint(tint: number): void {
    this.flagSprite.setTint(tint);
    this.glowSprite.setTint(tint);
  }

  /**
   * Sync the container position/rotation with the physics body.
   * Call once per frame (in scene update).
   */
  override update(): void {
    // Sync position from body to container
    this.x = this.body.position.x;
    this.y = this.body.position.y;

    // Update state
    this.marbleState.x = this.body.position.x;
    this.marbleState.y = this.body.position.y;
    this.marbleState.speed = Math.sqrt(
      this.body.velocity.x * this.body.velocity.x +
        this.body.velocity.y * this.body.velocity.y,
    );

    // Update visual rolling rotation
    const dx = this.x - this.prevX;
    const dy = this.y - this.prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.001) {
      this.rotation += dist / MARBLE_RADIUS;
    }

    this.prevX = this.x;
    this.prevY = this.y;

    // Glow pulse — subtle breathing effect
    const pulse = 1 + 0.05 * Math.sin(this.scene.time.now * 0.003);
    this.glowSprite.setScale(pulse * 1.3);
  }

  /**
   * Deactivate the marble (hide + remove physics).
   */
  deactivate(): void {
    this.scene.matter.world.remove(this.body);
    this.setVisible(false);
    this.setActive(false);
  }
}
