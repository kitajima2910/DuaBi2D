// ============================================================
// Countries Marble Race — Tournament Manager
// Single elimination bracket with bye handling
// ============================================================

import type { TournamentBracket, TournamentRound, TournamentMatch } from '@/types';

/** Seeded pseudo-random number generator */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROUND_NAMES: string[] = [
  'Chung kết',
  'Bán kết',
  'Tứ kết',
  'Vòng 1/8',
  'Vòng 1/16',
  'Vòng 1/32',
  'Vòng 1/64',
];

export class TournamentManager {
  bracket: TournamentBracket;
  currentRound: number;
  matchIndex: number;
  participants: string[];

  constructor(marbleIds: string[], seed?: number) {
    this.participants = [...marbleIds];
    const actualSeed = seed ?? Date.now();
    this.bracket = this.generateBracket(actualSeed);
    this.currentRound = 0;
    this.matchIndex = 0;
  }

  // ── Bracket generation ────────────────────────────────────

  generateBracket(seed: number): TournamentBracket {
    const rng = seededRandom(seed);

    // Shuffle participants
    const shuffled = [...this.participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    // Calculate bracket size (next power of 2)
    const totalRounds = Math.ceil(Math.log2(shuffled.length));
    const bracketSize = 1 << totalRounds;

    // Fill with byes: top seeds get auto-advance
    const slots: (string | null)[] = [];
    for (let i = 0; i < bracketSize; i++) {
      if (i < shuffled.length) {
        slots.push(shuffled[i]!);
      } else {
        slots.push(null); // bye
      }
    }

    // Build rounds bottom-up: first round matches = bracketSize / 2
    const rounds: TournamentRound[] = [];
    let currentSlots = slots;
    let roundIndex = 0;

    while (currentSlots.length > 1) {
      const matchCount = currentSlots.length / 2;
      const matches: TournamentMatch[] = [];

      for (let i = 0; i < matchCount; i++) {
        const marble1: string | null = currentSlots[i * 2] ?? null;
        const marble2: string | null = currentSlots[i * 2 + 1] ?? null;

        const marbles: string[] = [];
        if (marble1 !== null && marble1 !== undefined) marbles.push(marble1);
        if (marble2 !== null && marble2 !== undefined) marbles.push(marble2);

        const match: TournamentMatch = {
          id: `r${roundIndex}_m${i}`,
          marbleIds: marbles,
          winnerId: null,
          finishOrder: [],
        };

        // If one side is bye, auto-advance
        if (marble1 === null && marble2 !== null) {
          match.winnerId = marble2;
          match.finishOrder = [marble2];
        } else if (marble2 === null && marble1 !== null) {
          match.winnerId = marble1;
          match.finishOrder = [marble1];
        }

        matches.push(match);
      }

      // Determine round name
      const roundName = this.getRoundName(totalRounds - roundIndex);

      rounds.push({ name: roundName, matches });

      // Build next round slots (winners)
      const nextSlots: (string | null)[] = [];
      for (const match of matches) {
        if (match.winnerId !== null) {
          nextSlots.push(match.winnerId);
        } else {
          nextSlots.push(null);
        }
      }
      currentSlots = nextSlots;
      roundIndex++;
    }

    return {
      rounds,
      currentRound: 0,
      championId: currentSlots[0] ?? null,
    };
  }

  // ── Match navigation ──────────────────────────────────────

  getCurrentMatch(): TournamentMatch | null {
    const round = this.bracket.rounds[this.currentRound];
    if (!round) return null;
    const match = round.matches[this.matchIndex];
    if (!match) return null;

    // Skip if match has a winner (auto-bye)
    if (match.winnerId !== null) {
      return this.getNextMatch();
    }

    return match;
  }

  getNextMatch(): TournamentMatch | null {
    // Try next match in current round
    const round = this.bracket.rounds[this.currentRound];
    if (round) {
      for (let i = this.matchIndex + 1; i < round.matches.length; i++) {
        const match = round.matches[i]!;
        if (match.winnerId === null && match.marbleIds.length >= 2) {
          this.matchIndex = i;
          return match;
        }
      }
    }

    // Move to next round
    const nextRoundIdx = this.currentRound + 1;
    if (nextRoundIdx < this.bracket.rounds.length) {
      this.currentRound = nextRoundIdx;
      this.matchIndex = 0;
      return this.getCurrentMatch(); // will recurse if next round also has auto-byes
    }

    return null;
  }

  // ── Result recording ──────────────────────────────────────

  recordMatchResult(finishOrder: string[]): void {
    const match = this.bracket.rounds[this.currentRound]?.matches[this.matchIndex];
    if (!match) return;
    if (match.winnerId !== null) return; // already resolved

    if (finishOrder.length > 0) {
      match.winnerId = finishOrder[0]!;
      match.finishOrder = [...finishOrder];

      // Advance winner to next round
      const nextRoundIdx = this.currentRound + 1;
      if (nextRoundIdx < this.bracket.rounds.length) {
        const nextRound = this.bracket.rounds[nextRoundIdx]!;
        const targetMatchIdx = Math.floor(this.matchIndex / 2);
        const targetMatch = nextRound.matches[targetMatchIdx];
        if (targetMatch) {
          targetMatch.marbleIds.push(finishOrder[0]!);
          // If both slots filled, it's ready to play
        }
      }

      // Check if last match of tournament
      if (
        this.currentRound === this.bracket.rounds.length - 1 &&
        this.matchIndex === 0
      ) {
        this.bracket.championId = finishOrder[0]!;
      }
    }
  }

  // ── Queries ────────────────────────────────────────────────

  isTournamentComplete(): boolean {
    return this.bracket.championId !== null;
  }

  getChampion(): string | null {
    return this.bracket.championId;
  }

  getRoundName(round: number): string {
    if (round <= 0) return ROUND_NAMES[0]!;
    if (round >= ROUND_NAMES.length) return `Vòng ${round}`;
    return ROUND_NAMES[round]!;
  }

  getMarbleProgress(marbleId: string): { wins: number; currentRound: number } {
    let wins = 0;
    let currentRound = 0;

    for (let r = 0; r < this.bracket.rounds.length; r++) {
      const round = this.bracket.rounds[r]!;
      let found = false;

      for (const match of round.matches) {
        if (match.marbleIds.includes(marbleId)) {
          found = true;
          if (match.winnerId === marbleId) {
            wins++;
          } else if (match.winnerId !== null) {
            // Lost this round
            currentRound = r;
            break;
          } else {
            // Still playing
            currentRound = r;
          }
          break;
        }
      }

      if (!found) break;
    }

    return { wins, currentRound };
  }
}
