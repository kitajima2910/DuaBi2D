// ============================================================
// Countries Marble Race — Procedural Track Generator
// Sector grammar + Bezier smoothing → closed circuit
// ============================================================

import type { TrackConfig, TrackSector, TrackWaypoint } from "@/types";
import { TRACK_DEFAULT_WIDTH, TRACK_WALL_THICKNESS } from "@/config/GameConfig";
import { distance, seededRandom } from "@/utils/MathUtils";

const TRACK_COLORS = [0x3b82f6, 0xef4444, 0x22c55e, 0xf59e0b, 0x8b5cf6, 0xec4899];
const SECTOR_COUNT_MIN = 14;
const SECTOR_COUNT_MAX = 26;
const SEGMENT_BASE_LEN = 100;
const SEGMENT_LEN_VAR = 60;
const CURVE_ANGLE_BASE = Math.PI / 5;
const CURVE_ANGLE_VAR = Math.PI / 8;
const INTERPOLATED_WAYPOINTS = 200;
const MIN_WAYPOINT_DISTANCE = 8;

export class TrackGenerator {
  /**
   * Generate a complete TrackConfig from seed + difficulty.
   */
  static generate(seed: number, difficulty: number): TrackConfig {
    const rng = seededRandom((seed * 9301 + 49297) | 0);
    const sectorCount =
      SECTOR_COUNT_MIN + Math.floor(rng() * (SECTOR_COUNT_MAX - SECTOR_COUNT_MIN));
    const sectors = this.generateSectors(rng, sectorCount);
    const waypoints = this.generateWaypoints(sectors, difficulty, rng);
    const colorIdx = Math.floor(rng() * TRACK_COLORS.length);

    return {
      seed,
      difficulty,
      sectors,
      width: TRACK_DEFAULT_WIDTH + difficulty * 4,
      wallThickness: TRACK_WALL_THICKNESS,
      color: TRACK_COLORS[colorIdx]!,
      waypoints,
    };
  }

  // ---- Public API ----

  /**
   * Convert sector list + difficulty → smoothed waypoints.
   */
  static generateWaypoints(
    sectors: TrackSector[],
    difficulty: number,
    rng?: () => number,
  ): TrackWaypoint[] {
    const rand = rng ?? seededRandom(42);
    const rawPoints = this.sectorsToRawPoints(sectors, rand);
    const closedPoints = this.closeLoop(rawPoints);
    const waypoints = this.catmullRomSmooth(closedPoints, INTERPOLATED_WAYPOINTS);

    // Reject degenerate tracks and retry with different seed
    if (!this.validateTrack(waypoints)) {
      return this.generateWaypoints(sectors, difficulty, seededRandom(Math.random() * 99999));
    }

    return waypoints;
  }

  // ---- Sector generation ----

  private static generateSectors(rng: () => number, count: number): TrackSector[] {
    const sectors: TrackSector[] = [];

    // First sector always straight (start line)
    sectors.push('STRAIGHT');

    const types: TrackSector[] = [
      'STRAIGHT',
      'CURVE_LEFT',
      'CURVE_RIGHT',
      'RAMP_UP',
      'RAMP_DOWN',
      'BUMPER_ZONE',
      'BOOSTER_STRIP',
      'CHICANE',
      'ELIMINATION',
      'SPLIT_PATH',
    ];

    for (let i = 1; i < count - 1; i++) {
      const idx = Math.floor(rng() * types.length);
      const type = types[idx]!;

      // Avoid two elimination sectors in a row
      if (
        type === 'ELIMINATION' &&
        sectors[sectors.length - 1] === 'ELIMINATION'
      ) {
        sectors.push('STRAIGHT');
      } else {
        sectors.push(type);
      }
    }

    // Last sectors before finish are straight
    sectors.push('STRAIGHT');
    sectors.push('STRAIGHT');

    return sectors;
  }

  // ---- Raw point generation from sectors ----

  private static sectorsToRawPoints(
    sectors: TrackSector[],
    rng: () => number,
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    // Start near center-ish
    let x = 640;
    let y = 360;
    let angle = -Math.PI / 2; // heading upward initially

    for (const sector of sectors) {
      const len = SEGMENT_BASE_LEN + rng() * SEGMENT_LEN_VAR;
      const curveAmt = 0.4 + rng() * 0.6;
      const curveAngle = CURVE_ANGLE_BASE * curveAmt + rng() * CURVE_ANGLE_VAR;

      switch (sector) {
        case 'STRAIGHT':
        case 'BOOSTER_STRIP':
        case 'BUMPER_ZONE':
          x += Math.cos(angle) * len;
          y += Math.sin(angle) * len;
          break;

        case 'CURVE_LEFT':
          angle -= curveAngle;
          x += Math.cos(angle) * len;
          y += Math.sin(angle) * len;
          break;

        case 'CURVE_RIGHT':
          angle += curveAngle;
          x += Math.cos(angle) * len;
          y += Math.sin(angle) * len;
          break;

        case 'RAMP_UP':
          x += Math.cos(angle) * len;
          y += Math.sin(angle) * len - len * 0.25;
          break;

        case 'RAMP_DOWN':
          x += Math.cos(angle) * len;
          y += Math.sin(angle) * len + len * 0.25;
          break;

        case 'CHICANE': {
          // S-curve: brief left then right
          const halfLen = len * 0.5;
          const chicaneAngle = Math.PI * 0.08 * curveAmt;
          angle -= chicaneAngle;
          x += Math.cos(angle) * halfLen;
          y += Math.sin(angle) * halfLen;
          points.push({ x, y });
          angle += chicaneAngle * 2;
          x += Math.cos(angle) * halfLen;
          y += Math.sin(angle) * halfLen;
          angle -= chicaneAngle;
          break;
        }

        case 'ELIMINATION':
        case 'SPLIT_PATH':
          x += Math.cos(angle) * len;
          y += Math.sin(angle) * len;
          break;
      }

      points.push({ x, y });
    }

    return points;
  }

  // ---- Loop closure ----

  /**
   * Add intermediate points to smoothly close the loop
   * between end and start.
   */
  private static closeLoop(
    raw: { x: number; y: number }[],
  ): { x: number; y: number }[] {
    if (raw.length < 3) return raw;

    const first = raw[0]!;
    const last = raw[raw.length - 1]!;
    const dx = first.x - last.x;
    const dy = first.y - last.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If the loop is already tight, just push the first point
    if (dist < MIN_WAYPOINT_DISTANCE * 2) {
      raw.push({ x: first.x, y: first.y });
      return raw;
    }

    // Insert closing points along the return path
    const closeCount = Math.max(3, Math.floor(dist / SEGMENT_BASE_LEN));
    const result = [...raw];

    for (let i = 1; i <= closeCount; i++) {
      const t = i / (closeCount + 1);
      result.push({
        x: last.x + dx * t,
        y: last.y + dy * t,
      });
    }

    result.push({ x: first.x, y: first.y });
    return result;
  }

  // ---- Catmull-Rom interpolation ----

  /**
   * Smooth a closed set of control points using Catmull-Rom
   * into exactly `count` waypoints with segment lengths.
   */
  private static catmullRomSmooth(
    controlPoints: { x: number; y: number }[],
    count: number,
  ): TrackWaypoint[] {
    const n = controlPoints.length;
    if (n < 3) {
      // Fallback: return raw points as waypoints
      return controlPoints.map((p) => ({ x: p.x, y: p.y, segmentLength: 0 }));
    }

    const waypoints: TrackWaypoint[] = [];

    for (let i = 0; i < count; i++) {
      const t = (i / count) * n;
      const segIdx = Math.floor(t);
      const segT = t - segIdx;

      // For a closed loop, wrap indices using modulo
      const p0 = controlPoints[((segIdx - 1) % n + n) % n]!;
      const p1 = controlPoints[segIdx % n]!;
      const p2 = controlPoints[(segIdx + 1) % n]!;
      const p3 = controlPoints[(segIdx + 2) % n]!;

      const { x, y } = this.catmullRomPoint(p0, p1, p2, p3, segT);
      waypoints.push({ x, y, segmentLength: 0 });
    }

    // Calculate cumulative segment lengths
    let totalLength = 0;
    for (let i = 0; i < waypoints.length; i++) {
      const curr = waypoints[i]!;
      const next = waypoints[(i + 1) % waypoints.length]!;
      const d = distance(curr.x, curr.y, next.x, next.y);
      next.segmentLength = d;
      totalLength += d;
    }

    // Normalize segment lengths to cumulative 0..1
    let cumulated = 0;
    for (let i = 0; i < waypoints.length; i++) {
      cumulated += waypoints[i]!.segmentLength;
      waypoints[i]!.segmentLength = totalLength > 0 ? cumulated / totalLength : i / waypoints.length;
    }

    return waypoints;
  }

  /**
   * Catmull-Rom → single interpolated point.
   * Tension parameter = 0.5 for standard centripetal.
   */
  private static catmullRomPoint(
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    t: number,
  ): { x: number; y: number } {
    const t2 = t * t;
    const t3 = t2 * t;

    // Centripetal Catmull-Rom matrix coefficients
    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

    return { x, y };
  }

  // ---- Validation ----

  /**
   * Validate track doesn't self-intersect and stays within bounds.
   */
  private static validateTrack(waypoints: TrackWaypoint[]): boolean {
    if (waypoints.length < 10) return false;

    const bounds = { minX: -200, minY: -200, maxX: 1480, maxY: 920 };

    for (const wp of waypoints) {
      if (
        wp.x < bounds.minX ||
        wp.x > bounds.maxX ||
        wp.y < bounds.minY ||
        wp.y > bounds.maxY
      ) {
        return false;
      }
    }

    // Check for self-intersection (simplified: no two non-adjacent segments cross)
    const segments: { ax: number; ay: number; bx: number; by: number }[] = [];
    for (let i = 0; i < waypoints.length; i++) {
      const curr = waypoints[i]!;
      const next = waypoints[(i + 1) % waypoints.length]!;
      segments.push({ ax: curr.x, ay: curr.y, bx: next.x, by: next.y });
    }

    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 2; j < segments.length; j++) {
        // Skip adjacent segments (they share a vertex)
        if (j === i + 1 || (i === 0 && j === segments.length - 1)) continue;

        if (this.segmentsIntersect(segments[i]!, segments[j]!)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if two line segments intersect (excluding endpoints).
   */
  private static segmentsIntersect(
    a: { ax: number; ay: number; bx: number; by: number },
    b: { ax: number; ay: number; bx: number; by: number },
  ): boolean {
    const d1x = a.bx - a.ax;
    const d1y = a.by - a.ay;
    const d2x = b.bx - b.ax;
    const d2y = b.by - b.ay;

    const cross = d1x * d2y - d1y * d2x;
    if (Math.abs(cross) < 1e-10) return false; // parallel

    const dx = b.ax - a.ax;
    const dy = b.ay - a.ay;

    const t = (dx * d2y - dy * d2x) / cross;
    const u = (dx * d1y - dy * d1x) / cross;

    return t > 0 && t < 1 && u > 0 && u < 1;
  }
}
