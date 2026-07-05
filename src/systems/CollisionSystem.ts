// ============================================================
// Countries Marble Race — Collision Handler
// ============================================================

import Phaser from "phaser";
import type { Marble } from "@/entities/Marble";
import type { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import { MARBLE_RADIUS } from "@/config/GameConfig";

/**
 * Collision event router for Matter.js.
 *
 * Handles:
 *   — Marble ↔ Marble: elastic push-apart + velocity exchange
 *   — Marble ↔ Wall: basic friction / reflection
 *   — Marble ↔ Obstacle: delegates to obstacle.onMarbleCollide()
 *
 * Uses body labels ('marble', 'wall', 'obstacle', 'finish') to
 * identify collision participants.
 */
export class CollisionSystem {
  private static marbleMap = new Map<number, Marble>();
  private static obstacleMap = new Map<number, BaseObstacle>();
  private static sceneRef: Phaser.Scene | null = null;

  /** Cooldown per body ID pair to avoid multi-bounce per frame. */
  private static collisionCooldown = new Set<string>();
  /** Minimum relative velocity to trigger bounce sound */
  private static readonly BOUNCE_THRESHOLD = 3;

  /**
   * Register collision handlers with the Matter world.
   * Call once after all marbles and obstacles are created.
   */
  static setup(
    scene: Phaser.Scene,
    marbles: Marble[],
    obstacles: BaseObstacle[],
  ): void {
    // Clear previous state
    this.marbleMap.clear();
    this.obstacleMap.clear();
    this.collisionCooldown.clear();
    this.sceneRef = scene;

    // Build lookup maps
    for (const marble of marbles) {
      this.marbleMap.set(marble.body.id, marble);
    }

    for (const obstacle of obstacles) {
      this.obstacleMap.set(obstacle.body.id, obstacle);
    }

    // Register collision start handler
    scene.matter.world.on(
      'collisionstart',
      (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
        this.onCollisionStart(event);
      },
    );

    // Also handle active collisions (continuous contact)
    scene.matter.world.on(
      'collisionactive',
      (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
        this.onCollisionActive(event);
      },
    );
  }

  // ============================================================
  // Event handlers
  // ============================================================

  private static onCollisionStart(
    event: Phaser.Physics.Matter.Events.CollisionStartEvent,
  ): void {
    const pairs = (event as unknown as { pairs: MatterJS.IPair[] }).pairs;

    if (!pairs) return;

    for (const pair of pairs) {
      this.processPair(pair);
    }
  }

  private static onCollisionActive(
    event: Phaser.Physics.Matter.Events.CollisionActiveEvent,
  ): void {
    const pairs = (event as unknown as { pairs: MatterJS.IPair[] }).pairs;

    if (!pairs) return;

    for (const pair of pairs) {
      this.processPair(pair);
    }
  }

  // ============================================================
  // Pair processing
  // ============================================================

  private static processPair(pair: MatterJS.IPair): void {
    // Cast to BodyType to access id/label properties
    const bodyA = pair.bodyA as MatterJS.BodyType;
    const bodyB = pair.bodyB as MatterJS.BodyType;

    // Skip if either body is missing (shouldn't happen)
    if (!bodyA || !bodyB) return;

    // Cooldown check: skip if this pair was already processed this frame
    const pairKey = this.getPairKey(bodyA.id, bodyB.id);
    if (this.collisionCooldown.has(pairKey)) return;
    this.collisionCooldown.add(pairKey);

    // Identify participants
    const marbleA = this.marbleMap.get(bodyA.id);
    const marbleB = this.marbleMap.get(bodyB.id);
    const obstacleA = this.obstacleMap.get(bodyA.id);
    const obstacleB = this.obstacleMap.get(bodyB.id);

    // Marble ↔ Marble
    if (marbleA && marbleB) {
      this.handleMarbleMarble(marbleA, marbleB, pair);
      // Bounce sound if sufficient impact velocity
      const relSpeed = Math.sqrt(
        (marbleA.body.velocity.x - marbleB.body.velocity.x) ** 2 +
        (marbleA.body.velocity.y - marbleB.body.velocity.y) ** 2,
      );
      if (relSpeed > this.BOUNCE_THRESHOLD) {
        this.emitBounce();
      }
      return;
    }

    // Marble ↔ Obstacle (obstacle.onMarbleCollide)
    if (marbleA && obstacleB) {
      obstacleB.onMarbleCollide(marbleA);
      if (marbleA.marbleState.speed > this.BOUNCE_THRESHOLD) {
        this.emitBounce();
      }
      return;
    }
    if (marbleB && obstacleA) {
      obstacleA.onMarbleCollide(marbleB);
      if (marbleB.marbleState.speed > this.BOUNCE_THRESHOLD) {
        this.emitBounce();
      }
      return;
    }

    // Marble ↔ Wall
    if (marbleA && bodyB.label === 'wall') {
      this.handleMarbleWall(marbleA, bodyB);
      if (marbleA.marbleState.speed > this.BOUNCE_THRESHOLD) {
        this.emitBounce();
      }
      return;
    }
    if (marbleB && bodyA.label === 'wall') {
      this.handleMarbleWall(marbleB, bodyA);
      if (marbleB.marbleState.speed > this.BOUNCE_THRESHOLD) {
        this.emitBounce();
      }
      return;
    }
  }

  // ============================================================
  // Collision response implementations
  // ============================================================

  /**
   * Elastic collision between two marbles.
   * Pushes them apart and exchanges velocity along the collision normal.
   */
  static handleMarbleMarble(
    a: Marble,
    b: Marble,
    _pair: MatterJS.IPair,
  ): void {
    const dx = b.body.position.x - a.body.position.x;
    const dy = b.body.position.y - a.body.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.001) return;

    const nx = dx / dist;
    const ny = dy / dist;

    // Push apart if overlapping
    const overlap = MARBLE_RADIUS * 2 - dist;
    if (overlap > 0) {
      const pushX = nx * overlap * 0.5;
      const pushY = ny * overlap * 0.5;
      a.body.position.x -= pushX;
      a.body.position.y -= pushY;
      b.body.position.x += pushX;
      b.body.position.y += pushY;
    }

    // Relative velocity along collision normal
    const relVx = a.body.velocity.x - b.body.velocity.x;
    const relVy = a.body.velocity.y - b.body.velocity.y;
    const relVelAlongNormal = relVx * nx + relVy * ny;

    // Only resolve if marbles are moving toward each other
    if (relVelAlongNormal <= 0) return;

    // Equal mass elastic collision: exchange normal velocity components
    const impulse = relVelAlongNormal * 0.5;

    a.body.velocity.x -= impulse * nx;
    a.body.velocity.y -= impulse * ny;
    b.body.velocity.x += impulse * nx;
    b.body.velocity.y += impulse * ny;
  }

  /**
   * Reflect marble velocity off a wall with friction and energy loss.
   */
  static handleMarbleWall(
    marble: Marble,
    _wall: MatterJS.BodyType,
  ): void {
    // For wall collisions, Matter.js handles the basic collision response
    // via restitution/friction body properties.
    // Here we add a slight dampening to prevent infinite bouncing.
    const speed = Math.sqrt(
      marble.body.velocity.x * marble.body.velocity.x +
        marble.body.velocity.y * marble.body.velocity.y,
    );

    // Add small drag after wall hit to stabilize
    if (speed > 5) {
      marble.body.velocity.x *= 0.98;
      marble.body.velocity.y *= 0.98;
    }
  }

  // ============================================================
  // Helpers
  // ============================================================

  /**
   * Get a unique key for a pair of body IDs (order-independent).
   */
  private static getPairKey(idA: number, idB: number): string {
    return idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
  }

  /**
   * Emit a bounce sound event to be picked up by the scene.
   */
  private static emitBounce(): void {
    if (this.sceneRef) {
      this.sceneRef.events.emit('marble-bounce');
    }
  }

  /**
   * Clear cooldown set (call at the end of each frame).
   */
  static clearCooldowns(): void {
    this.collisionCooldown.clear();
  }
}
