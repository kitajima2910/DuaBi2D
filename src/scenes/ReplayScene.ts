// ============================================================
// Countries Marble Race — Replay Viewer Scene
// Playback with speed controls and seek bar
// ============================================================

import Phaser from 'phaser';
import { COLORS, MARBLE_RADIUS } from '@/config/GameConfig';
import { COUNTRY_MAP } from '@/config/CountryData';
import { ReplayPlayer } from '@/systems/ReplayPlayer';
import { Button } from '@/ui/Button';
import type { ReplayData } from '@/types';

export default class ReplayScene extends Phaser.Scene {
  private replayPlayer!: ReplayPlayer;
  private marbleSprites = new Map<string, Phaser.GameObjects.Container>();
  private progressBar!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;
  private playBtn!: Button;
  private speedBtn!: Button;
  private isDragging = false;

  constructor() {
    super('ReplayScene');
  }

  init(data: { replayData: ReplayData }): void {
    if (!data.replayData) {
      this.scene.start('MenuScene');
      return;
    }
    this.replayPlayer = new ReplayPlayer(data.replayData);
    this.marbleSprites.clear();
    this.isDragging = false;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0f172a');

    // Title
    this.add.text(width / 2, 16, '📺 XEM LẠI CUỘC ĐUA', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Track area background
    const trackArea = this.add.rectangle(width / 2, height / 2 - 30, width - 80, height - 180, 0x0a0f1e);
    trackArea.setStrokeStyle(1, COLORS.ui.panelBorder);

    // Create marble sprites
    this.createMarbleSprites();

    // ── Playback controls ──────────────────────────────────
    const controlY = height - 50;

    // Play/Pause button
    this.playBtn = new Button(this, 80, controlY, '⏸', {
      width: 50,
      height: 40,
      fontSize: 18,
      bgColor: 0x3b82f6,
      hoverColor: 0x2563eb,
      onClick: () => this.togglePlayback(),
    });

    // Speed button
    this.speedBtn = new Button(this, width - 80, controlY, '1x', {
      width: 60,
      height: 40,
      fontSize: 16,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => this.cycleSpeed(),
    });

    // Timer
    this.timerText = this.add.text(width / 2, controlY, '0:00 / 0:00', {
      fontSize: '14px',
      fontFamily: 'Arial, monospace',
      color: '#94a3b8',
    }).setOrigin(0.5);

    // ── Progress bar ────────────────────────────────────────
    const barX = 150;
    const barY = controlY + 30;
    const barW = width - 300;
    const barH = 8;

    this.progressBar = this.add.graphics();
    this.drawProgressBar(barX, barY, barW, barH);

    // Interactive area for seeking
    const seekZone = this.add.rectangle(width / 2, barY, barW, 20, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    seekZone.setDepth(50);

    seekZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.seekFromPointer(pointer, barX, barW);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.seekFromPointer(pointer, barX, barW);
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // ── Back button ────────────────────────────────────────
    new Button(this, 80, height - 16, '🔙 Thoát', {
      width: 100,
      height: 32,
      fontSize: 14,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => {
        this.replayPlayer.destroy();
        this.scene.start('MenuScene');
      },
    });
  }

  override update(_time: number, delta: number): void {
    if (!this.replayPlayer) return;

    this.replayPlayer.update(delta);
    this.updateMarblePositions();
    this.updateUI();
  }

  // ── Marble sprites ────────────────────────────────────────

  private createMarbleSprites(): void {
    const { width, height } = this.scale;
    const raceConfig = this.replayPlayer.data.raceConfig;

    for (const countryId of raceConfig.countryIds) {
      const container = this.add.container(width / 2, height / 2 - 30);
      container.setDepth(10);

      // Flag texture
      const texKey = `flag_${countryId}`;
      let sprite: Phaser.GameObjects.Image;
      if (this.textures.exists(texKey)) {
        sprite = this.add.image(0, 0, texKey);
      } else {
        // Fallback circle
        const circle = this.add.circle(0, 0, MARBLE_RADIUS, 0x94a3b8);
        container.add(circle);
        sprite = this.add.image(0, 0, texKey); // dummy
        sprite.setVisible(false);
      }
      sprite.setDisplaySize(MARBLE_RADIUS * 2, MARBLE_RADIUS * 2);
      container.add(sprite);

      // Country name label
      const country = COUNTRY_MAP.get(countryId);
      const label = this.add.text(0, MARBLE_RADIUS + 6, country?.name ?? countryId, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#e2e8f0',
      }).setOrigin(0.5);
      container.add(label);

      this.marbleSprites.set(countryId, container);
    }
  }

  private updateMarblePositions(): void {
    const positions = this.replayPlayer.getCurrentPositions();
    const { width, height } = this.scale;

    // Map marble IDs to country IDs
    for (const [marbleId, pos] of positions) {
      // Find the country ID from marbleId
      const raceConfig = this.replayPlayer.data.raceConfig;
      for (const countryId of raceConfig.countryIds) {
        if (marbleId.includes(countryId)) {
          const sprite = this.marbleSprites.get(countryId);
          if (sprite) {
            // Scale positions to screen: assume track is roughly 2000x1000
            const sx = width * 0.1 + (pos.x / 2000) * width * 0.8;
            const sy = height * 0.15 + (pos.y / 1000) * height * 0.55;
            sprite.setPosition(sx, sy);
            sprite.setRotation(pos.rot ?? 0);
          }
          break;
        }
      }
    }
  }

  // ── Controls ──────────────────────────────────────────────

  private togglePlayback(): void {
    if (this.replayPlayer.playing) {
      this.replayPlayer.pause();
      this.playBtn.setText('▶');
    } else if (this.replayPlayer.isFinished()) {
      this.replayPlayer.seek(0);
      this.replayPlayer.play();
      this.playBtn.setText('⏸');
    } else {
      this.replayPlayer.play();
      this.playBtn.setText('⏸');
    }
  }

  private cycleSpeed(): void {
    const speeds = [1, 2, 4];
    const currentIdx = speeds.indexOf(this.replayPlayer.speed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    const newSpeed = speeds[nextIdx]!;
    this.replayPlayer.setSpeed(newSpeed);
    this.speedBtn.setText(`${newSpeed}x`);
  }

  // ── Seek ──────────────────────────────────────────────────

  private seekFromPointer(pointer: Phaser.Input.Pointer, _barX: number, barW: number): void {
    const localX = pointer.x - (this.scale.width / 2 - barW / 2);
    const progress = Phaser.Math.Clamp(localX / barW, 0, 1);
    this.replayPlayer.seek(progress);
  }

  // ── UI update ─────────────────────────────────────────────

  private updateUI(): void {
    const { width } = this.scale;
    const barX = 150;
    const barW = width - 300;
    const barY = this.scale.height - 20;
    const barH = 8;

    this.drawProgressBar(barX, barY, barW, barH);

    // Timer
    const elapsed = this.replayPlayer.elapsed;
    const total = this.replayPlayer.data.duration;
    this.timerText.setText(
      `${this.formatTime(elapsed)} / ${this.formatTime(total)}`,
    );

    // Check finish
    if (this.replayPlayer.isFinished()) {
      this.playBtn.setText('🔁');
    }
  }

  private drawProgressBar(_barX: number, y: number, w: number, h: number): void {
    const progress = this.replayPlayer.progress;
    const centerX = this.scale.width / 2;

    this.progressBar.clear();

    // Background
    this.progressBar.fillStyle(COLORS.trackWall, 1);
    this.progressBar.fillRoundedRect(
      centerX - w / 2,
      y - h / 2,
      w,
      h,
      h / 2,
    );

    // Fill
    this.progressBar.fillStyle(COLORS.ui.accent, 1);
    this.progressBar.fillRoundedRect(
      centerX - w / 2,
      y - h / 2,
      w * progress,
      h,
      h / 2,
    );
  }

  // ── Helpers ───────────────────────────────────────────────

  private formatTime(ms: number): string {
    if (!Number.isFinite(ms)) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
