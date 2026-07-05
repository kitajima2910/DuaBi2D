// ============================================================
// Countries Marble Race — Skin Manager
// Apply skins and trails to marble entities
// ============================================================

import { Marble } from '@/entities/Marble';
import type { PlayerProgress } from '@/types';
import { SKINS, TRAILS, type TrailDefinition } from '@/config/UnlockData';
import type { SkinDefinition } from '@/config/UnlockData';

export class SkinManager {
  /**
   * Apply a skin tint to a marble's flag and glow sprites.
   */
  static applySkin(marble: Marble, skinId: string): void {
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return;
    marble.setSkinTint(skin.tint);
  }

  /**
   * Apply a trail effect to a marble (updates existing trail color).
   */
  static applyTrail(marble: Marble, trail: TrailDefinition): void {
    if (marble.trail) {
      marble.trail.setColor(trail.color);
    }
  }

  /**
   * Get all skins available for the given player progress.
   */
  static getAvailableSkins(progress: PlayerProgress): SkinDefinition[] {
    return SKINS.filter((s) => progress.unlockedSkins.includes(s.id));
  }

  /**
   * Get all trails available for the given player progress.
   */
  static getAvailableTrails(progress: PlayerProgress): TrailDefinition[] {
    return TRAILS.filter((t) => progress.unlockedTrails.includes(t.id));
  }

  /**
   * Get all locked skins (for display).
   */
  static getLockedSkins(progress: PlayerProgress): SkinDefinition[] {
    return SKINS.filter((s) => !progress.unlockedSkins.includes(s.id));
  }

  /**
   * Get all locked trails (for display).
   */
  static getLockedTrails(progress: PlayerProgress): TrailDefinition[] {
    return TRAILS.filter((t) => !progress.unlockedTrails.includes(t.id));
  }
}
