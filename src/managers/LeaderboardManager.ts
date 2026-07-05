// ============================================================
// Countries Marble Race — Leaderboard Manager
// Tracks marble progress, sorts, and emits throttle updates.
// ============================================================

import type { LeaderboardEntry } from "@/types";
import { COUNTRY_MAP } from "@/config/CountryData";
import { eventBus } from "@/utils/EventBus";
import { Marble } from "@/entities/Marble";

const THROTTLE_MS = 100;

export class LeaderboardManager {
  /** Ordered list of leaderboard entries (ranked) */
  entries: LeaderboardEntry[] = [];

  private marbles: Marble[] = [];

  /** Track finished marble IDs so they keep their rank */
  private finishedIds = new Set<string>();

  /** Throttle accumulator */
  private lastEmit = 0;

  constructor(marbles: Marble[]) {
    this.marbles = marbles;

    // Initial entries
    this.entries = this.buildEntries();
  }

  // ============================================================
  // Update
  // ============================================================

  /**
   * Call every frame from RaceManager.update().
   */
  update(): void {
    // Rebuild entries
    this.entries = this.buildEntries();
    this.sortEntries();

    // Throttled emit
    const now = Date.now();
    if (now - this.lastEmit >= THROTTLE_MS) {
      this.lastEmit = now;
      eventBus.emit('race:leaderboard-update', this.entries);
    }
  }

  // ============================================================
  // Query
  // ============================================================

  /**
   * Get the top N entries.
   */
  getTopN(n: number): LeaderboardEntry[] {
    return this.entries.slice(0, Math.min(n, this.entries.length));
  }

  /**
   * Get the rank (1-based) of a specific marble.
   * Returns -1 if marble not found.
   */
  getPlayerRank(marbleId: string): number {
    const idx = this.entries.findIndex((e) => e.marbleId === marbleId);
    return idx >= 0 ? idx + 1 : -1;
  }

  /**
   * Clean up.
   */
  destroy(): void {
    this.marbles = [];
    this.entries = [];
    this.finishedIds.clear();
  }

  // ============================================================
  // Internals
  // ============================================================

  private buildEntries(): LeaderboardEntry[] {
    return this.marbles.map((marble) => {
      const s = marble.marbleState;
      const country = COUNTRY_MAP.get(s.countryId);

      return {
        marbleId: s.id,
        countryId: s.countryId,
        countryName: country?.nameEn ?? s.countryId,
        progress: s.progress,
        rank: 0, // Set by sortEntries
        finished: s.finished,
        eliminated: s.eliminated,
        speed: s.speed,
      };
    });
  }

  private sortEntries(): void {
    // Priority: finished (by finishTime) > racing (by progress desc) > eliminated
    const finished: LeaderboardEntry[] = [];
    const racing: LeaderboardEntry[] = [];
    const eliminated: LeaderboardEntry[] = [];

    for (const entry of this.entries) {
      if (entry.finished) {
        finished.push(entry);
      } else if (entry.eliminated) {
        eliminated.push(entry);
      } else {
        racing.push(entry);
      }
    }

    // Finished marbles: sort by finish time (ascending)
    finished.sort((a, b) => {
      const mA = this.marbles.find((m) => m.marbleState.id === a.marbleId);
      const mB = this.marbles.find((m) => m.marbleState.id === b.marbleId);
      return (mA?.marbleState.finishTime ?? Infinity) - (mB?.marbleState.finishTime ?? Infinity);
    });

    // Racing marbles: sort by progress descending
    racing.sort((a, b) => b.progress - a.progress);

    // Eliminated: sort by last known progress (descending)
    eliminated.sort((a, b) => b.progress - a.progress);

    // Stitch together
    const sorted = [...finished, ...racing, ...eliminated];

    // Assign ranks
    sorted.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    this.entries = sorted;
  }
}
