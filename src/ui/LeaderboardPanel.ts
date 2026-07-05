// ============================================================
// Countries Marble Race — Full Leaderboard Panel
// Scrollable result list with podium highlight.
// ============================================================

import Phaser from "phaser";
import type { RaceResult } from "@/types";
import { COLORS } from "@/config/GameConfig";
import { COUNTRY_MAP } from "@/config/CountryData";

const PANEL_WIDTH = 480;
const PANEL_HEIGHT = 500;
const ROW_HEIGHT = 36;
const FONT_SIZE = 15;

/** Background tints for podium positions */
const PODIUM_COLORS: Record<number, number> = {
  1: 0x3b2f00, // gold tint
  2: 0x2a2a2a, // silver tint
  3: 0x2a1f00, // bronze tint
};

export class LeaderboardPanel {
  readonly container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;

  /** Mask for scrollable area */
  private mask: Phaser.Display.Masks.GeometryMask | null = null;

  /** Mask shape */
  private maskShape: Phaser.GameObjects.Graphics | null = null;

  /** Content container (scrollable) */
  private content: Phaser.GameObjects.Container;

  /** Scroll offset */
  private scrollY = 0;

  /** Total content height */
  private contentHeight = 0;

  /** Dragging state */
  private dragging = false;
  private dragStartY = 0;
  private dragScrollStart = 0;

  constructor(
    scene: Phaser.Scene,
    results: RaceResult[],
    x: number,
    y: number,
  ) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(900);

    // Panel background
    const bg = scene.add.graphics();
    bg.fillStyle(COLORS.ui.panel, 0.95);
    bg.fillRoundedRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 12);
    bg.lineStyle(2, COLORS.ui.panelBorder, 0.8);
    bg.strokeRoundedRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 12);
    this.container.add(bg);

    // Title
    const title = scene.add.text(PANEL_WIDTH / 2, 20, '🏁 Kết quả cuộc đua', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0);
    this.container.add(title);

    // Subtitle
    const subtitle = scene.add.text(
      PANEL_WIDTH / 2,
      44,
      'Chạm và kéo để cuộn',
      {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#94a3b8',
      },
    );
    subtitle.setOrigin(0.5, 0);
    this.container.add(subtitle);

    // Scrollable content
    this.content = scene.add.container(0, 0);
    this.container.add(this.content);

    // Build rows
    this.buildRows(results);

    // Mask for scrollable area
    this.maskShape = scene.add.graphics();
    this.maskShape.fillStyle(0xffffff);
    this.maskShape.fillRect(0, 70, PANEL_WIDTH, PANEL_HEIGHT - 80);
    this.mask = this.maskShape.createGeometryMask();
    this.content.setMask(this.mask);
    // Add mask shape to container so it moves with panel
    this.container.add(this.maskShape);

    // Enable drag scrolling
    this.container.setSize(PANEL_WIDTH, PANEL_HEIGHT);
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );

    this.container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragging = true;
      this.dragStartY = pointer.y;
      this.dragScrollStart = this.scrollY;
    });

    this.container.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging) return;
      const dy = pointer.y - this.dragStartY;
      this.scrollY = this.dragScrollStart + dy;
      this.clampScroll();
      this.updateContentPosition();
    });

    this.container.on('pointerup', () => {
      this.dragging = false;
    });

    this.container.on('pointerout', () => {
      this.dragging = false;
    });
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Clean up.
   */
  destroy(): void {
    this.content.removeAll(true);
    this.container.removeAll(true);
  }

  // ============================================================
  // Internals
  // ============================================================

  private buildRows(results: RaceResult[]): void {
    let yPos = 75;

    // Sort results: finished by finishTime, then eliminated
    const sorted = [...results].sort((a, b) => {
      if (a.eliminated && !b.eliminated) return 1;
      if (!a.eliminated && b.eliminated) return -1;
      if (a.eliminated && b.eliminated) return 0;
      return a.finishTime - b.finishTime;
    });

    for (let i = 0; i < sorted.length; i++) {
      const result = sorted[i]!;
      const rank = i + 1;
      const country = COUNTRY_MAP.get(result.countryId);

      // Row background (podium highlight for top 3)
      if (rank <= 3) {
        const rowBg = this.scene.add.graphics();
        const bgColor = PODIUM_COLORS[rank] ?? COLORS.ui.panel;
        rowBg.fillStyle(bgColor, 0.4);
        rowBg.fillRoundedRect(10, yPos - 4, PANEL_WIDTH - 20, ROW_HEIGHT, 6);
        this.content.add(rowBg);
      }

      // Divider
      if (i > 0) {
        const divider = this.scene.add.graphics();
        divider.lineStyle(1, COLORS.ui.panelBorder, 0.3);
        divider.lineBetween(20, yPos - 4, PANEL_WIDTH - 20, yPos - 4);
        this.content.add(divider);
      }

      // Rank
      const rankStr = this.getRankDisplay(rank);
      const rankText = this.scene.add.text(20, yPos + 4, rankStr, {
        fontSize: `${FONT_SIZE}px`,
        fontFamily: 'Arial, sans-serif',
        color: rank <= 3 ? '#fbbf24' : '#94a3b8',
        fontStyle: 'bold',
      });
      rankText.setOrigin(0, 0.5);
      this.content.add(rankText);

      // Flag emoji
      const flag = this.countryToFlag(result.countryId);
      const flagText = this.scene.add.text(58, yPos + 4, flag, {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
      });
      flagText.setOrigin(0, 0.5);
      this.content.add(flagText);

      // Country name
      const name = country?.nameEn ?? result.countryId;
      const nameText = this.scene.add.text(90, yPos + 4, name, {
        fontSize: `${FONT_SIZE}px`,
        fontFamily: 'Arial, sans-serif',
        color: '#e2e8f0',
      });
      nameText.setOrigin(0, 0.5);
      this.content.add(nameText);

      // Time or status
      let timeStr: string;
      if (result.eliminated) {
        timeStr = '💀 ELIMINATED';
      } else {
        timeStr = this.formatTime(result.finishTime);
      }

      const timeText = this.scene.add.text(PANEL_WIDTH - 20, yPos + 4, timeStr, {
        fontSize: `${FONT_SIZE}px`,
        fontFamily: 'Arial, monospace',
        color: result.eliminated ? '#ef4444' : '#94a3b8',
      });
      timeText.setOrigin(1, 0.5);
      this.content.add(timeText);

      yPos += ROW_HEIGHT;
    }

    this.contentHeight = yPos;

    // Scroll wheel support via scene input
    this.scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      this.scrollY -= deltaY * 0.5;
      this.clampScroll();
      this.updateContentPosition();
    });
  }

  private getRankDisplay(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
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
   * Format milliseconds to MM:SS.mmm
   */
  private formatTime(ms: number): string {
    if (!Number.isFinite(ms)) return '--:--.---';
    const totalSec = ms / 1000;
    const minutes = Math.floor(totalSec / 60);
    const seconds = Math.floor(totalSec % 60);
    const millis = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }

  private clampScroll(): void {
    const maxScroll = Math.max(0, this.contentHeight - (PANEL_HEIGHT - 80));
    this.scrollY = Math.max(-maxScroll, Math.min(0, this.scrollY));
  }

  private updateContentPosition(): void {
    this.content.setY(this.scrollY);
  }
}
