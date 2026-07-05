// ============================================================
// Countries Marble Race — Boot Scene
// Load assets + generate procedural textures + audio → MenuScene
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '@/config/GameConfig';
import { FlagGenerator } from '@/systems/FlagGenerator';
import { SoundManager } from '@/audio/SoundManager';
import { loadSettings } from '@/utils/Storage';

export default class BootScene extends Phaser.Scene {
  private loadingBarFill!: Phaser.GameObjects.Rectangle;
  private stepText!: Phaser.GameObjects.Text;
  private progress = 0;

  private readonly TOTAL_STEPS = 3;

  constructor() {
    super('BootScene');
  }

  preload(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0f172a');

    const barWidth = 400;
    const barHeight = 24;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    // Loading text
    this.add
      .text(width / 2, barY - 60, 'COUNTRIES MARBLE RACE', {
        fontSize: '22px',
        fontFamily: 'Arial',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Step label
    this.stepText = this.add
      .text(width / 2, barY - 32, 'Đang chuẩn bị...', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#94a3b8',
      })
      .setOrigin(0.5);

    // Background bar
    this.add
      .rectangle(barX, barY, barWidth, barHeight, COLORS.trackWall)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x475569);

    // Fill bar
    this.loadingBarFill = this.add
      .rectangle(barX + 2, barY + 2, 0, barHeight - 4, COLORS.ui.accent)
      .setOrigin(0, 0);

    // Listen for load progress
    this.load.on('progress', (value: number) => {
      this.loadingBarFill.width = (barWidth - 4) * value;
    });
  }

  create(): void {
    // Step 1: Generate flag textures
    this.updateProgress('Đang vẽ cờ...');
    FlagGenerator.generateFlags(this);
    this.advanceProgress();

    // Step 2: Generate particle texture
    this.updateProgress('Đang tạo hiệu ứng...');
    const gfx = this.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture('particle', 8, 8);
    gfx.destroy();
    this.advanceProgress();

    // Step 3: Generate procedural audio (standalone AudioContext)
    this.updateProgress('Đang tạo âm thanh...');
    const soundManager = new SoundManager();
    soundManager.init();
    soundManager.generateAllSounds();

    // Apply saved volume settings
    const settings = loadSettings();
    soundManager.loadSettings(settings.musicVolume, settings.sfxVolume);

    // Store in registry for other scenes
    this.registry.set('soundManager', soundManager);
    this.advanceProgress();

    // Done — transition to menu
    this.updateProgress('Sẵn sàng!');
    this.time.delayedCall(400, () => {
      this.scene.start('MenuScene');
    });
  }

  private updateProgress(text: string): void {
    this.stepText.setText(text);
  }

  private advanceProgress(): void {
    this.progress++;
    const barWidth = 400;
    this.loadingBarFill.width = (barWidth - 4) * (this.progress / this.TOTAL_STEPS);
  }
}
