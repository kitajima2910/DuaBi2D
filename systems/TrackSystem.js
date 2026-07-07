import { Obstacle } from '../entities/Obstacle.js';
import { FinishLine } from '../entities/FinishLine.js';

export class TrackSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} track  Hydrated track from TrackLoader
   */
  constructor(scene, track) {
    this.scene = scene;
    this.track = track;

    /** @type {MatterJS.BodyType[]} All created bodies for cleanup */
    this.bodies = [];
  }

  /**
   * Build all track structures: world bounds, spawn area, finish area,
   * static walls, and static obstacles — all as Matter static bodies.
   */
  build() {
    this._buildWorldBounds();
    this._buildSpawnArea();
    this._buildFinishArea();
    this._buildWalls();
    this._buildObstacles();
  }

  // ── World Bounds ────────────────────────────────────────────

  /** Create 4 outer boundary walls from track.world dimensions. */
  _buildWorldBounds() {
    const { width, height } = this.track.world;
    const thickness = 40;

    // Top
    this._createStaticWall(width / 2, -thickness / 2, width + thickness * 2, thickness, 'world_bound');
    // Bottom
    this._createStaticWall(width / 2, height + thickness / 2, width + thickness * 2, thickness, 'world_bound');
    // Left
    this._createStaticWall(-thickness / 2, height / 2, thickness, height, 'world_bound');
    // Right
    this._createStaticWall(width + thickness / 2, height / 2, thickness, height, 'world_bound');
  }

  // ── Spawn Area ──────────────────────────────────────────────

  /** Create a visual + static body marker for the spawn area. */
  _buildSpawnArea() {
    const { x, y, width, height } = this.track.spawnArea;

    // Visual: semi-transparent green rectangle
    const visual = this.scene.add.rectangle(x, y, width, height, 0x2ecc71, 0.15);
    visual.setStrokeStyle(2, 0x2ecc71, 0.5);

    // Static body (sensor-like, marbles can pass through — just a marker)
    const body = Phaser.Physics.Matter.Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      isSensor: true,
      label: 'spawn_area',
    });
    this.scene.matter.world.add(body);
    this.bodies.push(body);
  }

  // ── Finish Area ─────────────────────────────────────────────

  /** Create a visual + static body for the finish line. */
  _buildFinishArea() {
    /** @type {FinishLine} */
    const fl = this.track.finishArea;

    // Visual: yellow line
    const gfx = this.scene.add.graphics();
    gfx.lineStyle(6, 0xf1c40f, 0.9);
    gfx.beginPath();
    gfx.moveTo(fl.x1, fl.y1);
    gfx.lineTo(fl.x2, fl.y2);
    gfx.strokePath();
    // Add alternating checker pattern for classic finish line look
    gfx.lineStyle(3, 0x000000, 0.6);
    gfx.beginPath();
    // Dashed effect via multiple short segments
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 0.5) / segments;
      const sx = Phaser.Math.Linear(fl.x1, fl.x2, t1);
      const sy = Phaser.Math.Linear(fl.y1, fl.y2, t1);
      const ex = Phaser.Math.Linear(fl.x1, fl.x2, t2);
      const ey = Phaser.Math.Linear(fl.y1, fl.y2, t2);
      if (i % 2 === 0) {
        gfx.moveTo(sx, sy);
        gfx.lineTo(ex, ey);
      }
    }
    gfx.strokePath();

    // Static body: thin rectangle at center with rotation
    const body = Phaser.Physics.Matter.Matter.Bodies.rectangle(fl.cx, fl.cy, fl.width, fl.height, {
      isStatic: true,
      isSensor: true,
      label: 'finish_line',
      angle: fl.angle,
    });
    this.scene.matter.world.add(body);
    this.bodies.push(body);
    fl.body = body;
  }

  // ── Static Walls ────────────────────────────────────────────

  /** Build walls from track data. */
  _buildWalls() {
    for (const wall of this.track.walls) {
      this._createStaticWall(wall.x, wall.y, wall.width, wall.height, 'wall');
    }
  }

  // ── Static Obstacles ────────────────────────────────────────

  /** Build static obstacles from track data. */
  _buildObstacles() {
    for (const obs of this.track.obstacles) {
      /** @type {Obstacle} */
      const obstacle = obs;

      // Visual: red-tinted rectangle
      const visual = this.scene.add.rectangle(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 0xe74c3c, 0.8);
      visual.setStrokeStyle(2, 0xc0392b, 1);

      // Static physics body
      const body = Phaser.Physics.Matter.Matter.Bodies.rectangle(obstacle.x, obstacle.y, obstacle.width, obstacle.height, {
        isStatic: true,
        label: 'obstacle_' + obstacle.id,
        restitution: 0.3,
        friction: 0.2,
      });
      this.scene.matter.world.add(body);
      this.bodies.push(body);
      obstacle.body = body;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────

  /**
   * Create a static Matter rectangle body + visual.
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {string} label
   * @returns {MatterJS.BodyType}
   */
  _createStaticWall(x, y, w, h, label) {
    // Visual: dark gray rectangle
    const visual = this.scene.add.rectangle(x, y, w, h, 0x34495e, 0.9);
    visual.setStrokeStyle(1, 0x2c3e50, 1);

    // Static physics body
    const body = Phaser.Physics.Matter.Matter.Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      label,
      restitution: 0.5,
      friction: 0.3,
    });
    this.scene.matter.world.add(body);
    this.bodies.push(body);
    return body;
  }

  /**
   * Remove all created bodies and visual elements from the world.
   */
  destroy() {
    this.bodies.forEach((body) => {
      Phaser.Physics.Matter.Matter.World.remove(this.scene.matter.world, body);
    });
    this.bodies = [];
  }
}
