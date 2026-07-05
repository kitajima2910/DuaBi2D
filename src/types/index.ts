// ============================================================
// Countries Marble Race — Type Definitions
// ============================================================

// ---- Countries ----

export interface CountryData {
  id: string;
  name: string;        // "Việt Nam"
  nameEn: string;      // "Vietnam"
  flagColors: string[]; // ["#da251d", "#ffff00"]
  flagPattern: 'tricolor' | 'bicolor' | 'cross' | 'star' | 'stripe' | 'circle';
  stripes?: 'vertical' | 'horizontal';
  starCount?: number;
}

// ---- Marble ----

export interface MarbleState {
  id: string;
  countryId: string;
  x: number;
  y: number;
  speed: number;
  progress: number;     // 0-1 dọc track
  finished: boolean;
  eliminated: boolean;
  finishTime: number;
  rank: number;
  lap: number;
  onRamp: boolean;
  rampAngle: number;   // degrees, 0 if not on ramp
  airborne: boolean;
  boosting: boolean;
}

// ---- Track ----

export interface TrackWaypoint {
  x: number;
  y: number;
  segmentLength: number;
}

export type TrackSector =
  | 'STRAIGHT' | 'CURVE_LEFT' | 'CURVE_RIGHT'
  | 'RAMP_UP' | 'RAMP_DOWN' | 'BUMPER_ZONE'
  | 'BOOSTER_STRIP' | 'SPLIT_PATH' | 'ELIMINATION' | 'CHICANE';

export interface TrackConfig {
  seed: number;
  difficulty: number;
  sectors: TrackSector[];
  width: number;
  wallThickness: number;
  color: number;
  waypoints: TrackWaypoint[];
}

// ---- Obstacles ----

export interface ObstacleConfig {
  type: 'ramp' | 'spinner' | 'bumper' | 'booster' | 'split' | 'elimination' | 'finish';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  strength?: number;    // booster speed / bumper bounce
}

// ---- Race ----

export type RacePhase = 'LOADING' | 'COUNTDOWN' | 'RACING' | 'FINISHED' | 'RESULTS';

export interface RaceConfig {
  marbleCount: number;
  trackSeed: number;
  difficulty: number;
  lapCount: number;
  countryIds: string[];
}

export interface RaceResult {
  marbleId: string;
  countryId: string;
  rank: number;
  finishTime: number;
  eliminated: boolean;
  topSpeed: number;
  averageSpeed: number;
}

// ---- Leaderboard ----

export interface LeaderboardEntry {
  marbleId: string;
  countryId: string;
  countryName: string;
  progress: number;
  rank: number;
  finished: boolean;
  eliminated: boolean;
  speed: number;
}

// ---- Tournament ----

export interface TournamentBracket {
  rounds: TournamentRound[];
  currentRound: number;
  championId: string | null;
}

export interface TournamentRound {
  name: string;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  marbleIds: string[];
  winnerId: string | null;
  finishOrder: string[];
}

// ---- Progression ----

export interface PlayerProgress {
  level: number;
  xp: number;
  totalRaces: number;
  wins: number;
  top3: number;
  unlockedSkins: string[];
  unlockedTrails: string[];
  settings: GameSettings;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  cameraMode: 'lead' | 'follow' | 'free';
  showLeaderboard: boolean;
  language: 'vi' | 'en';
}

// ---- Replay ----

export interface ReplayFrame {
  t: number;
  marbles: { id: string; x: number; y: number; rot: number; speed: number }[];
}

export interface ReplayData {
  version: number;
  raceConfig: RaceConfig;
  frames: ReplayFrame[];
  timestamp: number;
  duration: number;
}
