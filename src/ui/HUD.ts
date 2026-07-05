// ============================================================
// Countries Marble Race — In-Game HUD
// Timer (top-left) + Leaderboard (right side, top 5).
// ============================================================

import Phaser from "phaser";
import type { LeaderboardEntry } from "@/types";
import { GAME_WIDTH, COLORS } from "@/config/GameConfig";

const PANEL_PADDING = 12;
const ENTRY_HEIGHT = 36;
const PROGRESS_BAR_HEIGHT = 6;
const MAX_VISIBLE_ENTRIES = 5;

/** Color stops for progress bar gradient (green → yellow → red) */
const PROGRESS_COLORS = [0x22c55e, 0xf59e0b, 0xef4444];

export class HUD {
  readonly container: Phaser.GameObjects.Container;

  // Timer
  private timerBg: Phaser.GameObjects.Graphics;
  private timerText: Phaser.GameObjects.Text;

  // Leaderboard
  private lbBg: Phaser.GameObjects.Graphics;
  private lbTitle: Phaser.GameObjects.Text;
  private lbEntries: Phaser.GameObjects.Container;
  private entryTexts: Phaser.GameObjects.Text[] = [];
  private entryBars: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0);
    this.container.setDepth(900);

    // ---- Timer (top-left) ----
    this.timerBg = scene.add.graphics();
    this.timerBg.fillStyle(COLORS.ui.panel, 0.85);
    this.timerBg.fillRoundedRect(10, 10, 160, 44, 8);
    this.container.add(this.timerBg);

    this.timerText = scene.add.text(90, 32, '00:00.0', {
      fontSize: '24px',
      fontFamily: 'Arial, monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.timerText.setOrigin(0.5);
    this.container.add(this.timerText);

    // ---- Leaderboard (right side) ----
    const lbWidth = 220;
    const lbHeight = ENTRY_HEIGHT * (MAX_VISIBLE_ENTRIES + 1) + PANEL_PADDING * 3;
    const lbX = GAME_WIDTH - lbWidth - 10;
    const lbY = 10;

    this.lbBg = scene.add.graphics();
    this.lbBg.fillStyle(COLORS.ui.panel, 0.85);
    this.lbBg.fillRoundedRect(lbX, lbY, lbWidth, lbHeight, 8);
    this.lbBg.lineStyle(1, COLORS.ui.panelBorder, 0.5);
    this.lbBg.strokeRoundedRect(lbX, lbY, lbWidth, lbHeight, 8);
    this.container.add(this.lbBg);

    // Title
    this.lbTitle = scene.add.text(lbX + lbWidth / 2, lbY + PANEL_PADDING + 8, '🏆 Bảng xếp hạng', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#94a3b8',
      fontStyle: 'bold',
    });
    this.lbTitle.setOrigin(0.5, 0);
    this.container.add(this.lbTitle);

    // Entries container
    this.lbEntries = scene.add.container(0, 0);
    this.container.add(this.lbEntries);

    // Pre-create entry slots
    for (let i = 0; i < MAX_VISIBLE_ENTRIES; i++) {
      const yPos = lbY + PANEL_PADDING * 2 + 24 + i * ENTRY_HEIGHT;

      // Progress bar background
      const barBg = scene.add.graphics();
      barBg.fillStyle(0x334155, 0.5);
      barBg.fillRoundedRect(lbX + 10, yPos + ENTRY_HEIGHT - 14, lbWidth - 20, PROGRESS_BAR_HEIGHT, 2);
      this.lbEntries.add(barBg);

      // Progress bar fill
      const barFill = scene.add.graphics();
      this.lbEntries.add(barFill);
      this.entryBars.push(barFill);

      // Entry text
      const text = scene.add.text(lbX + 14, yPos, '', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#e2e8f0',
      });
      this.lbEntries.add(text);
      this.entryTexts.push(text);
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Update the leaderboard display with current entries.
   */
  updateLeaderboard(entries: LeaderboardEntry[]): void {
    const top = entries.slice(0, MAX_VISIBLE_ENTRIES);

    for (let i = 0; i < MAX_VISIBLE_ENTRIES; i++) {
      const entry = top[i];
      const text = this.entryTexts[i]!;
      const bar = this.entryBars[i]!;

      if (!entry) {
        text.setText('');
        bar.clear();
        continue;
      }

      // Rank text with medal for top 3
      const flag = this.countryToFlag(entry.countryId);
      const rankStr = this.getRankDisplay(entry.rank);

      // Status
      let statusStr = '';
      if (entry.finished) {
        statusStr = ' ✅';
      } else if (entry.eliminated) {
        statusStr = ' 💀';
      }

      text.setText(`${rankStr} ${flag} ${entry.countryName}${statusStr}`);

      // Progress bar
      const lbWidth = 220;
      const lbX = GAME_WIDTH - lbWidth - 10;
      const yPos = this.getEntryY(i);

      bar.clear();
      if (!entry.finished && !entry.eliminated) {
        const barWidth = (lbWidth - 20) * entry.progress;
        const color = this.getProgressColor(entry.progress);
        bar.fillStyle(color, 0.9);
        bar.fillRoundedRect(lbX + 10, yPos + ENTRY_HEIGHT - 14, barWidth, PROGRESS_BAR_HEIGHT, 2);
      } else if (entry.finished) {
        // Full bar for finished
        bar.fillStyle(0x22c55e, 0.9);
        bar.fillRoundedRect(lbX + 10, yPos + ENTRY_HEIGHT - 14, lbWidth - 20, PROGRESS_BAR_HEIGHT, 2);
      }
    }
  }

  /**
   * Update the timer display.
   * @param elapsed Elapsed time in milliseconds
   */
  updateTimer(elapsed: number): void {
    const totalSec = elapsed / 1000;
    const minutes = Math.floor(totalSec / 60);
    const seconds = Math.floor(totalSec % 60);
    const tenths = Math.floor((elapsed % 1000) / 100);

    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    this.timerText.setText(formatted);
  }

  /**
   * Show the HUD.
   */
  show(): void {
    this.container.setVisible(true);
  }

  /**
   * Hide the HUD.
   */
  hide(): void {
    this.container.setVisible(false);
  }

  /**
   * Clean up.
   */
  destroy(): void {
    for (const text of this.entryTexts) {
      text.destroy();
    }
    for (const bar of this.entryBars) {
      bar.destroy();
    }
    this.entryTexts = [];
    this.entryBars = [];
    this.lbEntries.destroy();
    this.timerText.destroy();
    this.timerBg.destroy();
    this.lbTitle.destroy();
    this.lbBg.destroy();
    this.container.destroy();
  }

  // ============================================================
  // Helpers
  // ============================================================

  private getEntryY(_index: number): number {
    const lbWidth = 220;
    const lbX = GAME_WIDTH - lbWidth - 10;
    return lbX + 10; // Not actually used for Y...
  }

  private getRankDisplay(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  /**
   * Convert 2-letter country code to flag emoji.
   */
  private countryToFlag(countryId: string): string {
    if (countryId.length !== 2) return '🏁';
    const codePoints = countryId
      .toUpperCase()
      .split('')
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
  }

  /**
   * Map progress (0–1) to color: green → yellow → red.
   */
  private getProgressColor(progress: number): number {
    if (progress < 0.5) {
      // Green → yellow
      const t = progress / 0.5;
      return this.lerpColor(PROGRESS_COLORS[0]!, PROGRESS_COLORS[1]!, t);
    }
    // Yellow → red
    const t = (progress - 0.5) / 0.5;
    return this.lerpColor(PROGRESS_COLORS[1]!, PROGRESS_COLORS[2]!, t);
  }

  /**
   * Linear interpolate between two hex colors.
   */
  private lerpColor(a: number, b: number, t: number): number {
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;

    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;

    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);

    return (r << 16) | (g << 8) | bl;
  }
}
