// ============================================================
// Countries Marble Race — Track Progress Calculator
// ============================================================

import type { TrackWaypoint } from "@/types";

export class TrackProgress {
  /**
   * Find the nearest waypoint index using linear search.
   * O(n) — suitable for typical tracks with <100 waypoints.
   */
  static findNearestWaypoint(
    x: number,
    y: number,
    waypoints: TrackWaypoint[],
  ): number {
    if (waypoints.length === 0) return 0;

    let minDistSq = Infinity;
    let nearestIdx = 0;

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i]!;
      const dx = x - wp.x;
      const dy = y - wp.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearestIdx = i;
      }
    }

    return nearestIdx;
  }

  /**
   * Compute total length of the track from waypoints.
   */
  static computeTotalLength(waypoints: TrackWaypoint[]): number {
    let total = 0;
    for (const wp of waypoints) {
      total += wp.segmentLength;
    }
    return total;
  }

  /**
   * Get progress (0–1) for a given position along the track.
   */
  static getProgress(
    x: number,
    y: number,
    waypoints: TrackWaypoint[],
    totalLength: number,
  ): number {
    if (waypoints.length === 0 || totalLength <= 0) return 0;

    const nearestIdx = this.findNearestWaypoint(x, y, waypoints);

    // Compute cumulative length up to nearest waypoint
    let cumLength = 0;
    for (let i = 0; i < nearestIdx; i++) {
      cumLength += waypoints[i]!.segmentLength;
    }

    // Add distance from nearest waypoint to current position
    const wp = waypoints[nearestIdx]!;
    const dist = Math.sqrt(
      (x - wp.x) * (x - wp.x) + (y - wp.y) * (y - wp.y),
    );
    cumLength += dist;

    return Math.min(cumLength / totalLength, 1);
  }

  /**
   * Get the direction tangent vector (normalized) at a given progress along the track.
   */
  static getTangent(
    progress: number,
    waypoints: TrackWaypoint[],
  ): { x: number; y: number } {
    if (waypoints.length < 2) return { x: 1, y: 0 };

    const totalLength = this.computeTotalLength(waypoints);
    const targetDist = progress * totalLength;

    let cumDist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const segLen = waypoints[i]!.segmentLength;
      if (cumDist + segLen >= targetDist || i === waypoints.length - 2) {
        const p0 = waypoints[i]!;
        const p1 = waypoints[i + 1]!;
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > 0.001) {
          return { x: dx / len, y: dy / len };
        }
        return { x: 0, y: 1 };
      }
      cumDist += segLen;
    }

    // Fallback: last segment direction
    const last = waypoints[waypoints.length - 1]!;
    const prev = waypoints[waypoints.length - 2]!;
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    return len > 0.001 ? { x: dx / len, y: dy / len } : { x: 0, y: 1 };
  }

  /**
   * Get the world position at a given progress along the track.
   */
  static getPosition(
    progress: number,
    waypoints: TrackWaypoint[],
  ): { x: number; y: number } {
    if (waypoints.length === 0) return { x: 0, y: 0 };
    if (waypoints.length === 1) {
      return { x: waypoints[0]!.x, y: waypoints[0]!.y };
    }

    const totalLength = this.computeTotalLength(waypoints);
    const targetDist = progress * totalLength;

    let cumDist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const segLen = waypoints[i]!.segmentLength;

      if (cumDist + segLen >= targetDist || i === waypoints.length - 2) {
        const t = segLen > 0 ? (targetDist - cumDist) / segLen : 0;
        const p0 = waypoints[i]!;
        const p1 = waypoints[i + 1]!;

        return {
          x: p0.x + (p1.x - p0.x) * t,
          y: p0.y + (p1.y - p0.y) * t,
        };
      }

      cumDist += segLen;
    }

    // Return last waypoint
    const last = waypoints[waypoints.length - 1]!;
    return { x: last.x, y: last.y };
  }
}
