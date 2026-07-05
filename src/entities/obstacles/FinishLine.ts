// ============================================================
// Countries Marble Race — Finish Line Obstacle
// ============================================================

import { BaseObstacle } from "@/entities/obstacles/BaseObstacle";
import type { Marble } from "@/entities/Marble";
import type { ObstacleConfig } from "@/types";
import { eventBus } from "@/utils/EventBus";

/**
 * Finish line sensor.
 * When a marble overlaps the finish line sensor body,
 * the marble.finish() method is called with the current time.
 */
export class FinishLine extends BaseObstacle {
  private finishTime: number = 0;

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    super(scene, config);
    this.finishTime = Date.now();
  }

  /**
   * Override body creation: FinishLine is always a sensor.
   */
  protected override createBody(): MatterJS.BodyType {
    const { x, y, width, height, rotation } = this.config;
    const angle = rotation ?? 0;

    const body = this.scene.matter.bodies.rectangle(x, y, width, height, {
      isStatic: true,
      isSensor: true,
      label: 'finish',
      angle,
    });

    return body;
  }

  /**
   * When a marble hits the finish line, mark it as finished
   * and emit the event.
   */
  onMarbleCollide(marble: Marble): void {
    // Avoid double-triggering for already finished marbles
    if (marble.marbleState.finished) return;

    const elapsed = (Date.now() - this.finishTime) / 1000;
    marble.finish(elapsed);

    eventBus.emit('race:marble-finish', marble.marbleState.id);
  }

  /**
   * Reset the finish line timer (call before each race).
   */
  reset(): void {
    this.finishTime = Date.now();
  }
}
