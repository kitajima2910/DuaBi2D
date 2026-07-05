// ============================================================
// Countries Marble Race — Split Path Obstacle
// Track branching: marble picks left or right path at split point.
// Temporary guide walls direct the marble and then fade.
// ============================================================

import { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import type { Marble } from "@/entities/Marble";
import type { ObstacleConfig } from "@/types";
export interface SplitConfig {
  /** Point where the track diverges */
  splitPoint: { x: number; y: number };

  /** Two obstacle branches — each is an array of obstacles */
  paths: [ObstacleConfig[], ObstacleConfig[]];

  /** Point where paths rejoin */
  mergePoint: { x: number; y: number };

  /** Temporary wall bodies for left path guidance */
  leftWalls: MatterJS.BodyType[];

  /** Temporary wall bodies for right path guidance */
  rightWalls: MatterJS.BodyType[];
}

const WALL_FADE_DURATION = 500;  // ms

export class SplitPath extends BaseObstacle {
  splitConfig: SplitConfig;

  /** Maps marbleId to chosen path index (0 = left, 1 = right) */
  pathChosen: Map<string, 0 | 1> = new Map();

  /** Visual elements */
  private arrows: Phaser.GameObjects.Graphics;
  private highlightLeft: Phaser.GameObjects.Graphics | null = null;
  private highlightRight: Phaser.GameObjects.Graphics | null = null;

  /** Scene reference for tweening walls */
  private wallAlpha: Map<MatterJS.BodyType, number> = new Map();

  constructor(scene: Phaser.Scene, config: ObstacleConfig, splitConfig: SplitConfig) {
    super(scene, config);

    this.splitConfig = splitConfig;

    // Draw split indicators (arrows)
    this.arrows = scene.add.graphics();
    this.drawIndicators();
    this.arrows.setDepth(3);

    // Draw path highlights
    this.drawPathHighlights();
  }

  // ============================================================
  // Body creation — sensor at split point
  // ============================================================

  protected override createBody(): MatterJS.BodyType {
    const { x, y } = this.splitConfig.splitPoint;

    // Sensor body at the split point — triggers path selection
    const body = this.scene.matter.bodies.circle(x, y, 20, {
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
   * When a marble reaches the split point, choose a path based on
   * its lateral position relative to the split center.
   * Guide walls for the unchosen path fade out.
   */
  onMarbleCollide(marble: Marble): void {
    const marbleId = marble.marbleState.id;

    // Already assigned a path
    if (this.pathChosen.has(marbleId)) return;

    // Choose path: left (0) if marble is left of split center, else right (1)
    const pathIndex: 0 | 1 = marble.x < this.splitConfig.splitPoint.x ? 0 : 1;
    this.pathChosen.set(marbleId, pathIndex);

    // Fade out the walls for the unchosen path
    const unchosenWalls = pathIndex === 0
      ? this.splitConfig.rightWalls
      : this.splitConfig.leftWalls;

    // Store original alpha and begin fade
    for (const wall of unchosenWalls) {
      this.wallAlpha.set(wall, 1);
      this.fadeOutWall(wall);
    }

    // Highlight the chosen path
    this.highlightPath(pathIndex);

    // Emit split event
    this.scene.events.emit('split-chosen', marble.x, marble.y, pathIndex);
  }

  /**
   * Get the chosen path for a marble (defaults to 0).
   */
  getMarblePath(marbleId: string): 0 | 1 {
    return this.pathChosen.get(marbleId) ?? 0;
  }

  // ============================================================
  // Visual helpers
  // ============================================================

  /**
   * Draw directional arrows pointing to each path.
   */
  private drawIndicators(): void {
    const { splitPoint, mergePoint } = this.splitConfig;

    this.arrows.clear();

    // Left path arrow (pointing down-left)
    const midLeft = {
      x: (splitPoint.x + mergePoint.x) / 2 - 40,
      y: (splitPoint.y + mergePoint.y) / 2 + 30,
    };

    // Right path arrow (pointing down-right)
    const midRight = {
      x: (splitPoint.x + mergePoint.x) / 2 + 40,
      y: (splitPoint.y + mergePoint.y) / 2 + 30,
    };

    this.arrows.fillStyle(0x94a3b8, 0.6);

    // Left arrow
    this.drawArrow(midLeft.x, midLeft.y, -Math.PI / 6);

    // Right arrow
    this.drawArrow(midRight.x, midRight.y, Math.PI / 6);
  }

  /**
   * Draw a single arrow at (x, y) rotated by the given angle.
   */
  private drawArrow(x: number, y: number, rotation: number): void {
    const size = 10;

    this.arrows.save();
    this.arrows.translateCanvas(x, y);
    this.arrows.rotateCanvas(rotation);

    this.arrows.beginPath();
    this.arrows.moveTo(size, 0);
    this.arrows.lineTo(-size, -size / 2);
    this.arrows.lineTo(-size, size / 2);
    this.arrows.closePath();
    this.arrows.fillPath();

    this.arrows.restore();
  }

  /**
   * Draw highlighted borders for both paths.
   */
  private drawPathHighlights(): void {
    const { splitPoint, mergePoint } = this.splitConfig;

    this.highlightLeft = this.scene.add.graphics();
    this.highlightLeft.lineStyle(2, 0x22c55e, 0);

    // Left path: bezier-like curve
    this.highlightLeft.beginPath();
    this.highlightLeft.moveTo(splitPoint.x, splitPoint.y);
    this.highlightLeft.lineTo(splitPoint.x - 40, splitPoint.y + 40);
    this.highlightLeft.lineTo(mergePoint.x - 40, mergePoint.y - 40);
    this.highlightLeft.lineTo(mergePoint.x, mergePoint.y);
    this.highlightLeft.strokePath();
    this.highlightLeft.setDepth(2);

    this.highlightRight = this.scene.add.graphics();
    this.highlightRight.lineStyle(2, 0x3b82f6, 0);

    // Right path
    this.highlightRight.beginPath();
    this.highlightRight.moveTo(splitPoint.x, splitPoint.y);
    this.highlightRight.lineTo(splitPoint.x + 40, splitPoint.y + 40);
    this.highlightRight.lineTo(mergePoint.x + 40, mergePoint.y - 40);
    this.highlightRight.lineTo(mergePoint.x, mergePoint.y);
    this.highlightRight.strokePath();
    this.highlightRight.setDepth(2);
  }

  /**
   * Highlight the chosen path by making the guide line visible.
   */
  private highlightPath(pathIndex: 0 | 1): void {
    if (pathIndex === 0 && this.highlightLeft) {
      this.scene.tweens.add({
        targets: this.highlightLeft,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
      });
    } else if (pathIndex === 1 && this.highlightRight) {
      this.scene.tweens.add({
        targets: this.highlightRight,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
      });
    }
  }

  // ============================================================
  // Wall management
  // ============================================================

  /**
   * Fade out a wall body's visual alpha and then remove it.
   */
  private fadeOutWall(wall: MatterJS.BodyType): void {
    // Since Matter.js bodies don't have alpha,
    // we remove the wall from the physics world after a delay
    this.scene.time.delayedCall(WALL_FADE_DURATION, () => {
      try {
        this.scene.matter.world.remove(wall);
      } catch {
        // Wall may already be removed
      }
      this.wallAlpha.delete(wall);
    });
  }

  // ============================================================
  // Cleanup
  // ============================================================

  override destroy(): void {
    this.arrows?.destroy();
    this.highlightLeft?.destroy();
    this.highlightRight?.destroy();

    // Remove any remaining temporary walls
    const allWalls = [
      ...this.splitConfig.leftWalls,
      ...this.splitConfig.rightWalls,
    ];
    for (const wall of allWalls) {
      try {
        this.scene.matter.world.remove(wall);
      } catch {
        // Already removed
      }
    }

    this.pathChosen.clear();
    this.wallAlpha.clear();
    super.destroy();
  }
}
