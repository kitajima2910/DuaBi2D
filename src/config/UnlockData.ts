// ============================================================
// Countries Marble Race — Unlockable Content Definitions
// 20 skins + 10 trails with rarity, unlock levels, visuals
// ============================================================

export interface SkinDefinition {
  id: string;
  name: string;
  tint: number;
  unlockLevel: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TrailDefinition {
  id: string;
  name: string;
  color: number;
  unlockLevel: number;
  particleCount: number;
}

// ── Skins ────────────────────────────────────────────────────

export const SKINS: SkinDefinition[] = [
  // Common (unlock level 1)
  { id: 'default', name: 'Mặc định', tint: 0xffffff, unlockLevel: 1, rarity: 'common' },
  { id: 'ruby', name: 'Hồng ngọc', tint: 0xef4444, unlockLevel: 1, rarity: 'common' },
  { id: 'sapphire', name: 'Lam ngọc', tint: 0x3b82f6, unlockLevel: 1, rarity: 'common' },
  { id: 'emerald', name: 'Ngọc lục bảo', tint: 0x22c55e, unlockLevel: 1, rarity: 'common' },
  { id: 'amethyst', name: 'Tím thạch anh', tint: 0xa855f7, unlockLevel: 1, rarity: 'common' },

  // Rare (unlock level 5)
  { id: 'gold', name: 'Hoàng kim', tint: 0xfbbf24, unlockLevel: 5, rarity: 'rare' },
  { id: 'silver', name: 'Bạc', tint: 0x9ca3af, unlockLevel: 5, rarity: 'rare' },
  { id: 'rose', name: 'Hồng phấn', tint: 0xec4899, unlockLevel: 5, rarity: 'rare' },
  { id: 'cyan', name: 'Xanh lơ', tint: 0x06b6d4, unlockLevel: 5, rarity: 'rare' },
  { id: 'lime', name: 'Xanh chanh', tint: 0x84cc16, unlockLevel: 5, rarity: 'rare' },

  // Epic (unlock level 10)
  { id: 'flame', name: 'Lửa', tint: 0xf97316, unlockLevel: 10, rarity: 'epic' },
  { id: 'ice', name: 'Băng', tint: 0x7dd3fc, unlockLevel: 10, rarity: 'epic' },
  { id: 'neon', name: 'Neon', tint: 0x22d3ee, unlockLevel: 10, rarity: 'epic' },
  { id: 'magma', name: 'Mắc ma', tint: 0xdc2626, unlockLevel: 10, rarity: 'epic' },
  { id: 'ocean', name: 'Đại dương', tint: 0x1d4ed8, unlockLevel: 10, rarity: 'epic' },

  // Legendary (unlock level 20)
  { id: 'rainbow', name: 'Cầu vồng', tint: 0xff6b6b, unlockLevel: 20, rarity: 'legendary' },
  { id: 'galaxy', name: 'Thiên hà', tint: 0x6366f1, unlockLevel: 20, rarity: 'legendary' },
  { id: 'void', name: 'Hư vô', tint: 0x0f172a, unlockLevel: 20, rarity: 'legendary' },
  { id: 'crystal', name: 'Pha lê', tint: 0x93c5fd, unlockLevel: 20, rarity: 'legendary' },
  { id: 'royal', name: 'Hoàng gia', tint: 0x7c3aed, unlockLevel: 20, rarity: 'legendary' },
];

// ── Trails ───────────────────────────────────────────────────

export const TRAILS: TrailDefinition[] = [
  // Common (level 1)
  { id: 'trail_default', name: 'Mặc định', color: 0x94a3b8, unlockLevel: 1, particleCount: 8 },
  { id: 'trail_red', name: 'Lửa đỏ', color: 0xef4444, unlockLevel: 1, particleCount: 10 },
  { id: 'trail_blue', name: 'Xanh dương', color: 0x3b82f6, unlockLevel: 1, particleCount: 10 },

  // Rare (level 3)
  { id: 'trail_gold', name: 'Hoàng kim', color: 0xfbbf24, unlockLevel: 3, particleCount: 12 },
  { id: 'trail_green', name: 'Xanh lá', color: 0x22c55e, unlockLevel: 3, particleCount: 12 },
  { id: 'trail_purple', name: 'Tía', color: 0xa855f7, unlockLevel: 3, particleCount: 12 },

  // Epic (level 6)
  { id: 'trail_rainbow', name: 'Cầu vồng', color: 0xff6b6b, unlockLevel: 6, particleCount: 16 },
  { id: 'trail_neon', name: 'Neon', color: 0x22d3ee, unlockLevel: 6, particleCount: 16 },
  { id: 'trail_star', name: 'Sao', color: 0xfde047, unlockLevel: 6, particleCount: 16 },

  // Legendary (level 12)
  { id: 'trail_heart', name: 'Trái tim', color: 0xff4080, unlockLevel: 12, particleCount: 20 },
];
