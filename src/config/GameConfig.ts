// ============================================================
// Countries Marble Race — Game Constants
// ============================================================

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const FIXED_DT = 1000 / 60;
export const MAX_MARBLES = 60;
export const MARBLE_RADIUS = 12;
export const MARBLE_MAX_SPEED = 600;
export const MARBLE_FRICTION = 0.05;
export const MARBLE_ROLLING_RESISTANCE = 0.02;
export const MARBLE_BOUNCE = 0.4;
export const GRAVITY = 1.5;  // Matter.js gravity scale
export const BOOST_SPEED_MULTIPLIER = 2.5;
export const BUMPER_BOUNCE_MULTIPLIER = 1.5;
export const COUNTDOWN_SECONDS = 3;
export const TRACK_WALL_THICKNESS = 20;
export const TRACK_DEFAULT_WIDTH = 200;

export const COLORS = {
  background: 0x0f172a,
  track: 0x1e293b,
  trackWall: 0x475569,
  finishLine: 0xfbbf24,
  countdown: 0xffffff,
  ui: {
    panel: 0x1e293b,
    panelBorder: 0x475569,
    text: 0xffffff,
    textSecondary: 0x94a3b8,
    accent: 0x3b82f6,
    success: 0x22c55e,
    danger: 0xef4444,
    warning: 0xf59e0b,
    gold: 0xfbbf24,
    silver: 0x9ca3af,
    bronze: 0xd97706,
  },
} as const;
