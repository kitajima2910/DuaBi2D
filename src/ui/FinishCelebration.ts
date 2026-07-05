// ============================================================
// Countries Marble Race — Finish Celebration
// Podium display for top 3 + fireworks + "Tap to continue".
// ============================================================

import Phaser from "phaser";
import type { RaceResult } from "@/types";
import { GAME_WIDTH, GAME_HEIGHT } from "@/config/GameConfig";
import { COUNTRY_MAP } from "@/config/CountryData";
import { ParticleManager } from "@/managers/ParticleManager";

const CELEBRATION_DURATION = 3000; // ms before onComplete
const PODIUM_Y = GAME_HEIGHT / 2 + 40;
const PODIUM_HEIGHTS = [120, 90, 60]; // gold, silver, bronze
const PODIUM_X_OFFSETS = [-120, 0, 120];

const MEDAL_SYMBOLS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = [0xfbbf24, 0x9ca3af, 0xd97706];

export class FinishCelebration {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private particleManager: ParticleManager | null = null;
  private completed = false;

  constructor(
    scene: Phaser.Scene,
    private top3: RaceResult[],
    private onComplete: () => void,
  ) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(980);

    this.particleManager = new ParticleManager(scene);
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Play the celebration sequence.
   */
  play(): void {
    this.buildPodium();
    this.fireworks();
    this.autoComplete();
  }

  /**
   * Clean up.
   */
  destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    if (this.particleManager) {
      this.particleManager.destroy();
      this.particleManager = null;
    }
    this.container.removeAll(true);
    this.container.destroy();
  }

  // ============================================================
  // Podium
  // ============================================================

  private buildPodium(): void {
    // Background vignette
    const vignette = this.scene.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7,
    );
    this.container.add(vignette);

    // "🏁 Race Complete!" title
    const title = this.scene.add.text(GAME_WIDTH / 2, 60, '🏁 Race Complete!', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setAlpha(0);
    this.container.add(title);

    // Animate title in
    this.scene.tweens.add({
      targets: title,
      alpha: 1,
      y: 80,
      duration: 600,
      ease: 'Back.easeOut',
    });

    // Build podium for up to 3
    const count = Math.min(this.top3.length, 3);

    for (let i = 0; i < count; i++) {
      const result = this.top3[i]!;
      this.buildPodiumSlot(result, i);
    }

    // "Tap to continue" text
    const continueText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 40,
      '👆 Chạm để tiếp tục',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#94a3b8',
      },
    );
    continueText.setOrigin(0.5);
    continueText.setAlpha(0);

    this.scene.tweens.add({
      targets: continueText,
      alpha: 1,
      duration: 500,
      delay: 2000,
    });

    // Pulse the continue text
    this.scene.tweens.add({
      targets: continueText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 2500,
    });

    this.container.add(continueText);

    // Make entire container interactive to tap-to-continue
    this.container.setSize(GAME_WIDTH, GAME_HEIGHT);
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
    this.container.on('pointerdown', () => {
      if (!this.completed) {
        this.completed = true;
        this.scene.tweens.killTweensOf(this.container);
        this.destroy();
        this.onComplete();
      }
    });
  }

  private buildPodiumSlot(result: RaceResult, index: number): void {
    const country = COUNTRY_MAP.get(result.countryId);

    // Podium block
    const podiumX = GAME_WIDTH / 2 + PODIUM_X_OFFSETS[index]!;
    const podiumHeight = PODIUM_HEIGHTS[index]!;
    const podiumY = PODIUM_Y + (120 - podiumHeight); // tallest is 120

    const podium = this.scene.add.graphics();
    podium.fillStyle(MEDAL_COLORS[index]!, 0.9);
    podium.fillRoundedRect(
      podiumX - 50,
      podiumY,
      100,
      podiumHeight,
      { tl: 4, tr: 4, bl: 0, br: 0 },
    );
    podium.setAlpha(0);
    this.container.add(podium);

    // Animate podium rising
    podium.setY(podiumY + 50);
    this.scene.tweens.add({
      targets: podium,
      alpha: 1,
      y: podiumY,
      duration: 500,
      delay: 300 + index * 200,
      ease: 'Back.easeOut',
    });

    // Medal icon
    const medal = this.scene.add.text(podiumX, podiumY - 30, MEDAL_SYMBOLS[index]!, {
      fontSize: '40px',
      fontFamily: 'Arial, sans-serif',
    });
    medal.setOrigin(0.5);
    medal.setAlpha(0);
    medal.setScale(0);
    this.container.add(medal);

    this.scene.tweens.add({
      targets: medal,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      delay: 500 + index * 200,
      ease: 'Back.easeOut',
    });

    // Country flag emoji
    const flag = this.countryToFlag(result.countryId);
    const flagText = this.scene.add.text(podiumX, podiumY - 70, flag, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
    });
    flagText.setOrigin(0.5);
    flagText.setAlpha(0);
    this.container.add(flagText);

    this.scene.tweens.add({
      targets: flagText,
      alpha: 1,
      duration: 400,
      delay: 600 + index * 200,
    });

    // Country name
    const name = country?.nameEn ?? result.countryId;
    const nameText = this.scene.add.text(podiumX, podiumY + podiumHeight + 10, name, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#e2e8f0',
      fontStyle: 'bold',
    });
    nameText.setOrigin(0.5);
    nameText.setAlpha(0);
    this.container.add(nameText);

    this.scene.tweens.add({
      targets: nameText,
      alpha: 1,
      duration: 400,
      delay: 700 + index * 200,
    });

    // Time
    const timeText = this.scene.add.text(
      podiumX,
      podiumY + podiumHeight + 28,
      this.formatTime(result.finishTime),
      {
        fontSize: '12px',
        fontFamily: 'Arial, monospace',
        color: '#94a3b8',
      },
    );
    timeText.setOrigin(0.5);
    timeText.setAlpha(0);
    this.container.add(timeText);

    this.scene.tweens.add({
      targets: timeText,
      alpha: 1,
      duration: 400,
      delay: 800 + index * 200,
    });
  }

  // ============================================================
  // Fireworks
  // ============================================================

  private fireworks(): void {
    if (!this.particleManager) return;

    // Multiple firework bursts
    const bursts = [
      { x: GAME_WIDTH * 0.3, y: GAME_HEIGHT * 0.3, delay: 500 },
      { x: GAME_WIDTH * 0.7, y: GAME_HEIGHT * 0.25, delay: 900 },
      { x: GAME_WIDTH * 0.5, y: GAME_HEIGHT * 0.35, delay: 1300 },
      { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.4, delay: 1700 },
      { x: GAME_WIDTH * 0.8, y: GAME_HEIGHT * 0.3, delay: 2100 },
    ];

    for (const burst of bursts) {
      this.scene.time.delayedCall(burst.delay, () => {
        this.particleManager?.emitFinishFireworks(burst.x, burst.y);
      });
    }
  }

  // ============================================================
  // Auto-complete
  // ============================================================

  private autoComplete(): void {
    this.scene.time.delayedCall(CELEBRATION_DURATION, () => {
      // Allow early completion via tap; this is the timeout fallback
      if (!this.completed) {
        this.completed = true;
        this.destroy();
        this.onComplete();
      }
    });
  }

  // ============================================================
  // Helpers
  // ============================================================

  private countryToFlag(countryId: string): string {
    if (countryId.length !== 2) return '🏁';
    const codePoints = countryId
      .toUpperCase()
      .split('')
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
  }

  private formatTime(ms: number): string {
    if (!Number.isFinite(ms)) return '--:--.---';
    const totalSec = ms / 1000;
    const minutes = Math.floor(totalSec / 60);
    const seconds = Math.floor(totalSec % 60);
    const millis = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }
}
