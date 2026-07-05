// ============================================================
// Countries Marble Race — Track Theme Definitions
// 8 themes with colours, difficulty, unlock progression
// ============================================================

export interface TrackTheme {
  id: string;
  name: string;
  backgroundColor: number;
  trackColor: number;
  wallColor: number;
  decorationColor: number;
  difficulty: number;
  unlockLevel: number;
}

export const TRACK_THEMES: TrackTheme[] = [
  {
    id: 'classic',
    name: 'Cổ điển',
    backgroundColor: 0x0f172a,
    trackColor: 0x1e293b,
    wallColor: 0x475569,
    decorationColor: 0x64748b,
    difficulty: 1,
    unlockLevel: 1,
  },
  {
    id: 'desert',
    name: 'Sa mạc',
    backgroundColor: 0x1c1917,
    trackColor: 0x92400e,
    wallColor: 0x78350f,
    decorationColor: 0xf59e0b,
    difficulty: 2,
    unlockLevel: 2,
  },
  {
    id: 'ice',
    name: 'Băng giá',
    backgroundColor: 0x0c4a6e,
    trackColor: 0x7dd3fc,
    wallColor: 0x38bdf8,
    decorationColor: 0xe0f2fe,
    difficulty: 3,
    unlockLevel: 5,
  },
  {
    id: 'lava',
    name: 'Núi lửa',
    backgroundColor: 0x1c1917,
    trackColor: 0x7f1d1d,
    wallColor: 0xdc2626,
    decorationColor: 0xf97316,
    difficulty: 4,
    unlockLevel: 8,
  },
  {
    id: 'neon',
    name: 'Neon',
    backgroundColor: 0x020617,
    trackColor: 0x1e1b4b,
    wallColor: 0x7c3aed,
    decorationColor: 0x22d3ee,
    difficulty: 5,
    unlockLevel: 12,
  },
  {
    id: 'ocean',
    name: 'Đại dương',
    backgroundColor: 0x020617,
    trackColor: 0x0f766e,
    wallColor: 0x0891b2,
    decorationColor: 0x22d3ee,
    difficulty: 6,
    unlockLevel: 15,
  },
  {
    id: 'space',
    name: 'Vũ trụ',
    backgroundColor: 0x000000,
    trackColor: 0x1e0a3c,
    wallColor: 0x6366f1,
    decorationColor: 0x818cf8,
    difficulty: 7,
    unlockLevel: 18,
  },
  {
    id: 'candy',
    name: 'Kẹo ngọt',
    backgroundColor: 0x2d0a3c,
    trackColor: 0x701a75,
    wallColor: 0xdb2777,
    decorationColor: 0xf472b6,
    difficulty: 8,
    unlockLevel: 20,
  },
];

/** Get theme by id */
export function getThemeById(id: string): TrackTheme | undefined {
  return TRACK_THEMES.find((t) => t.id === id);
}
