// ============================================================
// Countries Marble Race — Track Entity
// ============================================================

import Phaser from "phaser";
import type { TrackConfig, TrackWaypoint } from "@/types";
import { TRACK_WALL_THICKNESS } from "@/config/GameConfig";
import { TrackProgress } from "@/systems/TrackProgress";

/**
 * Track entity — creates walls, surface visuals, and finish line
 * from a set of waypoints.
 *
 * Walls are Matter.js static rectangle segments on both sides of
 * the track center-line. The surface is a Phaser Graphics path.
 */
export class Track {
  walls: MatterJS.BodyType[] = [];
  surface: Phaser.GameObjects.Graphics;
  finishLine: Phaser.GameObjects.Rectangle;
  waypoints: TrackWaypoint[];
  totalLength: number;

  private scene: Phaser.Scene;
  private config: TrackConfig;

  constructor(scene: Phaser.Scene, config: TrackConfig) {
    this.scene = scene;
    this.config = config;
    this.waypoints = config.waypoints;
    this.totalLength = TrackProgress.computeTotalLength(this.waypoints);

    // ---- Surface graphics ----
    this.surface = scene.add.graphics();
    this.drawSurface();

    // ---- Walls ----
    this.buildWalls();

    // ---- Finish line visual ----
    this.finishLine = this.createFinishLineVisual();
  }

  // ============================================================
  // Build walls from waypoint pairs
  // ============================================================

  private buildWalls(): void {
    const halfWidth = this.config.width / 2;
    const wThick = this.config.wallThickness ?? TRACK_WALL_THICKNESS;

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const p0 = this.waypoints[i]!;
      const p1 = this.waypoints[i + 1]!;

      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.001) continue;

      // Normal (perpendicular) to segment direction
      const nx = -dy / len;
      const ny = dx / len;

      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;

      // Left wall segment
      const leftWall = this.scene.matter.bodies.rectangle(
        midX + nx * halfWidth,
        midY + ny * halfWidth,
        len,
        wThick,
        {
          isStatic: true,
          label: 'wall',
          restitution: 0.6,
          friction: 0.1,
          angle: Math.atan2(dy, dx),
        },
      );
      this.scene.matter.world.add(leftWall);
      this.walls.push(leftWall);

      // Right wall segment
      const rightWall = this.scene.matter.bodies.rectangle(
        midX - nx * halfWidth,
        midY - ny * halfWidth,
        len,
        wThick,
        {
          isStatic: true,
          label: 'wall',
          restitution: 0.6,
          friction: 0.1,
          angle: Math.atan2(dy, dx),
        },
      );
      this.scene.matter.world.add(rightWall);
      this.walls.push(rightWall);
    }
  }

  // ============================================================
  // Surface drawing
  // ============================================================

  private drawSurface(): void {
    if (this.waypoints.length < 2) return;

    const halfWidth = this.config.width / 2;
    const trackColor = this.config.color;
    const alpha = 0.3;

    // Draw the track surface as a filled strip along waypoints
    this.surface.lineStyle(2, trackColor, alpha);
    this.surface.fillStyle(trackColor, alpha);

    // Build polygon points for the track surface
    this.surface.beginPath();

    // Outer wall (right side offset)
    const rightPoints: { x: number; y: number }[] = [];
    const leftPoints: { x: number; y: number }[] = [];

    for (let i = 0; i < this.waypoints.length; i++) {
      const wp = this.waypoints[i]!;

      // Get direction to next/prev waypoint for normal calculation
      let nx: number;
      let ny: number;

      if (i === 0) {
        const next = this.waypoints[1]!;
        const dirX = next.x - wp.x;
        const dirY = next.y - wp.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        nx = -dirY / len;
        ny = dirX / len;
      } else if (i === this.waypoints.length - 1) {
        const prev = this.waypoints[i - 1]!;
        const dirX = wp.x - prev.x;
        const dirY = wp.y - prev.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        nx = -dirY / len;
        ny = dirX / len;
      } else {
        // Average normals of incoming and outgoing segments
        const prev = this.waypoints[i - 1]!;
        const next = this.waypoints[i + 1]!;

        const inDirX = wp.x - prev.x;
        const inDirY = wp.y - prev.y;
        const inLen = Math.sqrt(inDirX * inDirX + inDirY * inDirY) || 1;

        const outDirX = next.x - wp.x;
        const outDirY = next.y - wp.y;
        const outLen = Math.sqrt(outDirX * outDirX + outDirY * outDirY) || 1;

        const avgDirX = (inDirX / inLen + outDirX / outLen) / 2;
        const avgDirY = (inDirY / inLen + outDirY / outLen) / 2;
        const avgLen = Math.sqrt(avgDirX * avgDirX + avgDirY * avgDirY) || 1;

        nx = -avgDirY / avgLen;
        ny = avgDirX / avgLen;
      }

      rightPoints.push({
        x: wp.x + nx * halfWidth,
        y: wp.y + ny * halfWidth,
      });
      leftPoints.push({
        x: wp.x - nx * halfWidth,
        y: wp.y - ny * halfWidth,
      });
    }

    // Draw polygon: right wall → left wall (reversed)
    this.surface.moveTo(rightPoints[0]!.x, rightPoints[0]!.y);
    for (let i = 1; i < rightPoints.length; i++) {
      this.surface.lineTo(rightPoints[i]!.x, rightPoints[i]!.y);
    }
    for (let i = leftPoints.length - 1; i >= 0; i--) {
      this.surface.lineTo(leftPoints[i]!.x, leftPoints[i]!.y);
    }
    this.surface.closePath();
    this.surface.fillPath();

    // Draw center line (dashed)
    this.surface.lineStyle(1, 0xffffff, 0.1);
    this.surface.beginPath();
    this.surface.moveTo(this.waypoints[0]!.x, this.waypoints[0]!.y);
    for (let i = 1; i < this.waypoints.length; i++) {
      this.surface.lineTo(this.waypoints[i]!.x, this.waypoints[i]!.y);
    }
    this.surface.strokePath();
  }

  // ============================================================
  // Finish line visual
  // ============================================================

  private createFinishLineVisual(): Phaser.GameObjects.Rectangle {
    if (this.waypoints.length < 2) {
      return this.scene.add.rectangle(0, 0, 0, 0, 0xfbbf24, 0.8);
    }

    const last = this.waypoints[this.waypoints.length - 1]!;
    const prev = this.waypoints[this.waypoints.length - 2]!;

    const dirX = last.x - prev.x;
    const dirY = last.y - prev.y;

    const halfWidth = this.config.width / 2;

    const finishRect = this.scene.add.rectangle(
      last.x,
      last.y,
      halfWidth * 2,
      4,
      0xfbbf24,
      0.8,
    );
    finishRect.setRotation(Math.atan2(dirY, dirX));
    finishRect.setDepth(5);

    // Checkered pattern effect: two alternating rectangles
    const checkA = this.scene.add.rectangle(
      last.x,
      last.y,
      halfWidth * 2,
      2,
      0x000000,
      0.4,
    );
    checkA.setRotation(Math.atan2(dirY, dirX));
    checkA.setDepth(5);

    return finishRect;
  }

  // ============================================================
  // Progress & navigation
  // ============================================================

  /**
   * Get the marble's progress (0–1) along the track.
   */
  getProgress(x: number, y: number): number {
    return TrackProgress.getProgress(x, y, this.waypoints, this.totalLength);
  }

  /**
   * Get the tangent direction at a given progress.
   */
  getTangent(progress: number): { x: number; y: number } {
    return TrackProgress.getTangent(progress, this.waypoints);
  }

  /**
   * Get world position at a given progress.
   */
  getPosition(progress: number): { x: number; y: number } {
    return TrackProgress.getPosition(progress, this.waypoints);
  }

  // ============================================================
  // Cleanup
  // ============================================================

  /**
   * Remove all wall bodies and visuals from the scene.
   */
  destroy(): void {
    for (const wall of this.walls) {
      this.scene.matter.world.remove(wall);
    }
    this.walls = [];

    this.surface.destroy();
    this.finishLine.destroy();
  }
}
