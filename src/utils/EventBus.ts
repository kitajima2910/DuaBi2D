// ============================================================
// Countries Marble Race — Typed Event Bus
// ============================================================

import type { RacePhase, LeaderboardEntry, RaceResult, TournamentMatch } from "@/types";

export interface EventMap {
  'race:phase-change': RacePhase;
  'race:marble-finish': string;
  'race:marble-eliminate': string;
  'race:countdown-tick': number;
  'race:leaderboard-update': LeaderboardEntry[];
  'race:finish-all': RaceResult[];
  'ui:button-click': string;
  'ui:scene-transition': { from: string; to: string };
  'tournament:match-start': TournamentMatch;
  'tournament:match-complete': { matchId: string; winnerId: string };
  'tournament:complete': { championId: string };
  'progression:level-up': number;
  'progression:xp-gain': number;
  'replay:save': string;
}

type Listener<T = unknown> = (payload: T) => void;

class TypedEventBus {
  private listeners = new Map<string, Set<Listener>>();

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }
    this.listeners.get(event as string)!.add(listener as Listener);
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    const set = this.listeners.get(event as string);
    if (set) {
      set.delete(listener as Listener);
      if (set.size === 0) {
        this.listeners.delete(event as string);
      }
    }
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.listeners.get(event as string);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event as string}":`, err);
        }
      });
    }
  }

  /** Remove all listeners for a specific event */
  clear(event: keyof EventMap): void {
    this.listeners.delete(event as string);
  }

  /** Remove all listeners */
  clearAll(): void {
    this.listeners.clear();
  }
}

export const eventBus = new TypedEventBus();
