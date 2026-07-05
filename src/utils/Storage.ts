// ============================================================
// Countries Marble Race — LocalStorage Wrapper
// ============================================================

import type { PlayerProgress, GameSettings, ReplayData } from "@/types";

const KEYS = {
  PROGRESS: 'cmr_progress',
  REPLAYS: 'cmr_replays',
  SETTINGS: 'cmr_settings',
} as const;

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[Storage] Quota exceeded — clearing old replays');
      try {
        localStorage.removeItem(KEYS.REPLAYS);
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        console.error('[Storage] Still failing after clearing replays');
        return false;
      }
    }
    console.error('[Storage] Error saving:', key, e);
    return false;
  }
}

// ---- Progress ----

export function saveProgress(data: PlayerProgress): boolean {
  return safeSetItem(KEYS.PROGRESS, data);
}

export function loadProgress(): PlayerProgress | null {
  return safeGetItem<PlayerProgress | null>(KEYS.PROGRESS, null);
}

// ---- Replays ----

export function saveReplay(data: ReplayData): boolean {
  const replays = loadReplays();
  replays.push(data);
  // Keep only last 20 replays
  const trimmed = replays.slice(-20);
  return safeSetItem(KEYS.REPLAYS, trimmed);
}

export function loadReplays(): ReplayData[] {
  return safeGetItem<ReplayData[]>(KEYS.REPLAYS, []);
}

export function deleteReplay(id: string): boolean {
  const replays = loadReplays().filter((r) => r.timestamp.toString() !== id);
  return safeSetItem(KEYS.REPLAYS, replays);
}

// ---- Settings ----

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 1.0,
  cameraMode: 'lead',
  showLeaderboard: true,
  language: 'vi',
};

export function saveSettings(settings: GameSettings): boolean {
  return safeSetItem(KEYS.SETTINGS, settings);
}

export function loadSettings(): GameSettings {
  return safeGetItem<GameSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}
