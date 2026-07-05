// ============================================================
// Countries Marble Race — Player Progression Manager
// XP, levels, unlocks, stats tracking
// ============================================================

import type { PlayerProgress } from '@/types';
import { loadProgress, saveProgress } from '@/utils/Storage';
import { SKINS, TRAILS } from '@/config/UnlockData';
import { eventBus } from '@/utils/EventBus';

const XP_PER_LEVEL_BASE = 100;

const DEFAULT_PROGRESS: PlayerProgress = {
  level: 1,
  xp: 0,
  totalRaces: 0,
  wins: 0,
  top3: 0,
  unlockedSkins: ['default'],
  unlockedTrails: ['trail_default'],
  settings: {
    musicVolume: 0.7,
    sfxVolume: 1.0,
    cameraMode: 'lead',
    showLeaderboard: true,
    language: 'vi',
  },
};

export class ProgressionManager {
  progress: PlayerProgress;

  constructor() {
    const saved = loadProgress();
    if (saved) {
      this.progress = {
        ...DEFAULT_PROGRESS,
        ...saved,
        settings: { ...DEFAULT_PROGRESS.settings, ...saved.settings },
      };
    } else {
      this.progress = { ...DEFAULT_PROGRESS, unlockedSkins: [...DEFAULT_PROGRESS.unlockedSkins], unlockedTrails: [...DEFAULT_PROGRESS.unlockedTrails] };
    }

    // Auto-unlock items that should be available at current level
    this.syncUnlocks();
  }

  // ── XP ─────────────────────────────────────────────────────

  addXP(amount: number): void {
    this.progress.xp += amount;

    // Check for level-up
    while (this.progress.xp >= this.getXPForNextLevel()) {
      this.progress.xp -= this.getXPForNextLevel();
      this.progress.level++;
      this.syncUnlocks();

      eventBus.emit('ui:button-click', `level-up:${this.progress.level}`);
    }

    this.save();
  }

  getLevel(): number {
    return this.progress.level;
  }

  getXPForNextLevel(): number {
    return this.progress.level * XP_PER_LEVEL_BASE;
  }

  getXPProgress(): number {
    return this.progress.xp / this.getXPForNextLevel();
  }

  // ── Race stats ─────────────────────────────────────────────

  recordRace(rank: number, totalRacers: number): void {
    this.progress.totalRaces++;

    if (rank === 1) {
      this.progress.wins++;
      this.progress.top3++;
      this.addXP(1000);
    } else if (rank <= 3) {
      this.progress.top3++;
      this.addXP(500);
    } else if (rank <= 10) {
      this.addXP(200);
    } else if (rank <= totalRacers) {
      this.addXP(100);
    } else {
      this.addXP(10);
    }

    this.save();
  }

  // ── Unlock checks ──────────────────────────────────────────

  isSkinUnlocked(skinId: string): boolean {
    return this.progress.unlockedSkins.includes(skinId);
  }

  isTrailUnlocked(trailId: string): boolean {
    return this.progress.unlockedTrails.includes(trailId);
  }

  unlockSkin(skinId: string): void {
    if (!this.progress.unlockedSkins.includes(skinId)) {
      this.progress.unlockedSkins.push(skinId);
      this.save();
    }
  }

  unlockTrail(trailId: string): void {
    if (!this.progress.unlockedTrails.includes(trailId)) {
      this.progress.unlockedTrails.push(trailId);
      this.save();
    }
  }

  // ── Level rewards ─────────────────────────────────────────

  getLevelRewards(level: number): { skins: string[]; trails: string[] } {
    const skins = SKINS
      .filter((s) => s.unlockLevel === level)
      .map((s) => s.id);

    const trails = TRAILS
      .filter((t) => t.unlockLevel === level)
      .map((t) => t.id);

    return { skins, trails };
  }

  // ── Persistence ────────────────────────────────────────────

  save(): void {
    saveProgress(this.progress);
  }

  reset(): void {
    this.progress = {
      ...DEFAULT_PROGRESS,
      unlockedSkins: [...DEFAULT_PROGRESS.unlockedSkins],
      unlockedTrails: [...DEFAULT_PROGRESS.unlockedTrails],
      settings: { ...DEFAULT_PROGRESS.settings },
    };
    this.save();
  }

  // ── Internal ───────────────────────────────────────────────

  private syncUnlocks(): void {
    for (const skin of SKINS) {
      if (skin.unlockLevel <= this.progress.level) {
        if (!this.progress.unlockedSkins.includes(skin.id)) {
          this.progress.unlockedSkins.push(skin.id);
        }
      }
    }

    for (const trail of TRAILS) {
      if (trail.unlockLevel <= this.progress.level) {
        if (!this.progress.unlockedTrails.includes(trail.id)) {
          this.progress.unlockedTrails.push(trail.id);
        }
      }
    }
  }
}
