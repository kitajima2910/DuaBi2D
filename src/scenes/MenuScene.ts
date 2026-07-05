// ============================================================
// Countries Marble Race — Main Menu Scene
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '@/config/GameConfig';
import { Button } from '@/ui/Button';
import { loadSettings, saveSettings } from '@/utils/Storage';
import type { GameSettings } from '@/types';
import type { SoundManager } from '@/audio/SoundManager';

export default class MenuScene extends Phaser.Scene {
  private decorativeMarbles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0f172a');

    // ---- Background decorative marbles ----
    this.createDecorativeMarbles(width, height);

    // ---- Title (added to scene, saved for fade) ----
    const title = this.add
      .text(width / 2, height * 0.15, '🏁 COUNTRIES MARBLE RACE', {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // ---- Subtitle ----
    const subtitle = this.add
      .text(width / 2, height * 0.15 + 56, 'ĐUA BI 2D', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // ---- Buttons ----
    const btnY = height * 0.40;
    const btnGap = 64;

    const btnStart = new Button(this, width / 2, btnY, '🏁 BẮT ĐẦU ĐUA', {
      bgColor: 0x3b82f6,
      hoverColor: 0x2563eb,
      onClick: () => this.scene.start('SelectScene'),
    });
    btnStart.setAlpha(0);

    const btnTournament = new Button(this, width / 2, btnY + btnGap, '🏆 GIẢI ĐẤU', {
      bgColor: 0x1e293b,
      hoverColor: 0x334155,
      onClick: () => this.scene.start('TournamentScene'),
    });
    btnTournament.setAlpha(0);

    const btnProgression = new Button(this, width / 2, btnY + btnGap * 2, '⭐ TIẾN TRÌNH', {
      bgColor: 0x1e293b,
      hoverColor: 0x334155,
      onClick: () => this.scene.start('ProgressionScene'),
    });
    btnProgression.setAlpha(0);

    const btnSettings = new Button(this, width / 2, btnY + btnGap * 3, '⚙️ CÀI ĐẶT', {
      bgColor: 0x1e293b,
      hoverColor: 0x334155,
      onClick: () => this.showSettings(),
    });
    btnSettings.setAlpha(0);

    // ---- Animate fade-in with stagger ----
    const menuButtons = [btnStart, btnTournament, btnProgression, btnSettings];
    menuButtons.forEach((btn, i) => {
      this.tweens.add({
        targets: btn,
        alpha: 1,
        duration: 500,
        delay: 400 + i * 150,
        ease: 'Power2',
      });
    });

    // Title & subtitle fade in
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      duration: 500,
      delay: 200,
      ease: 'Power2',
    });

    // Start menu music after a short delay
    this.time.delayedCall(600, () => {
      this.getSoundManager()?.playMusic('music_menu');
    });

    // ---- Version text ----
    this.add
      .text(width - 12, height - 12, 'v1.0.0', {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#475569',
      })
      .setOrigin(1, 1);
  }

  // ── Decorative rolling marbles ────────────────────────────────

  private createDecorativeMarbles(width: number, height: number): void {
    const count = 8;
    const colors = [0xef4444, 0x3b82f6, 0x22c55e, 0xf59e0b, 0xa855f7, 0xec4899, 0x06b6d4, 0xf97316];

    for (let i = 0; i < count; i++) {
      const r = Phaser.Math.Between(6, 14);
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(60, height - 60);
      const color = colors[i % colors.length]!;

      const marble = this.add.circle(x, y, r, color, 0.15).setAlpha(0.3);
      this.decorativeMarbles.push(marble);

      // Random direction
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(40, 100);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.tweens.add({
        targets: marble,
        x: marble.x + vx * 4,
        y: marble.y + vy * 4,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onRepeat: () => {
          marble.x = Phaser.Math.Clamp(marble.x, 40, width - 40);
          marble.y = Phaser.Math.Clamp(marble.y, 60, height - 60);
        },
      });
    }
  }

  // ── Settings overlay ──────────────────────────────────────────

  private showSettings(): void {
    const { width, height } = this.scale;
    const settings = loadSettings();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive()
      .setDepth(100);

    const panel = this.add.container(width / 2, height / 2).setDepth(101);

    const panelW = 420;
    const panelH = 320;
    const bg = this.add.rectangle(0, 0, panelW, panelH, COLORS.ui.panel);
    bg.setStrokeStyle(2, COLORS.ui.panelBorder);
    panel.add(bg);

    // Title
    const pTitle = this.add.text(0, -panelH / 2 + 24, '⚙️ CÀI ĐẶT', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    panel.add(pTitle);

    // Music volume
    const musicLabel = this.add.text(-panelW / 2 + 24, -40, '🎵 Âm lượng nhạc', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
    });
    panel.add(musicLabel);

    const sm = this.getSoundManager();
    this.createSlider(panel, settings.musicVolume, (val) => {
      settings.musicVolume = val;
      saveSettings(settings);
      sm?.setMusicVolume(val);
    }, -panelW / 2 + 24 + 140, -40);

    // SFX volume
    const sfxLabel = this.add.text(-panelW / 2 + 24, 10, '🔊 Âm lượng SFX', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
    });
    panel.add(sfxLabel);

    this.createSlider(panel, settings.sfxVolume, (val) => {
      settings.sfxVolume = val;
      saveSettings(settings);
      sm?.setSFXVolume(val);
    }, -panelW / 2 + 24 + 140, 10);

    // Camera mode
    const camLabel = this.add.text(-panelW / 2 + 24, 60, '📷 Chế độ camera', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
    });
    panel.add(camLabel);

    const camModes: GameSettings['cameraMode'][] = ['lead', 'follow', 'free'];
    const camLabels: Record<GameSettings['cameraMode'], string> = {
      lead: 'Dẫn đầu',
      follow: 'Theo dõi',
      free: 'Tự do',
    };

    camModes.forEach((mode, i) => {
      const isActive = settings.cameraMode === mode;
      const btn = this.add.text(-20 + i * 90, 100, camLabels[mode], {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: isActive ? '#fbbf24' : '#94a3b8',
        fontStyle: isActive ? 'bold' : 'normal',
        backgroundColor: isActive ? '#1e293b' : undefined,
        padding: { x: 8, y: 4 },
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        settings.cameraMode = mode;
        saveSettings(settings);
        // Refresh settings panel by reopening
        overlay.destroy();
        panel.destroy();
        this.showSettings();
      });

      panel.add(btn);
    });

    // Close button
    const closeBtn = this.add.text(panelW / 2 - 30, -panelH / 2 + 20, '✕', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ef4444',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);

    overlay.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
    });
  }

  private createSlider(
    panel: Phaser.GameObjects.Container,
    initialValue: number,
    onChange: (val: number) => void,
    x: number,
    y: number,
  ): void {
    const sliderW = 200;
    const sliderH = 6;

    const track = this.add.rectangle(x, y, sliderW, sliderH, COLORS.trackWall)
      .setOrigin(0, 0.5);
    panel.add(track);

    const fill = this.add.rectangle(x, y, sliderW * initialValue, sliderH, COLORS.ui.accent)
      .setOrigin(0, 0.5);
    panel.add(fill);

    const handle = this.add.circle(x + sliderW * initialValue, y, 10, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, COLORS.ui.accent);
    panel.add(handle);

    const valLabel = this.add.text(x + sliderW + 16, y, `${Math.round(initialValue * 100)}%`, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#94a3b8',
    }).setOrigin(0, 0.5);
    panel.add(valLabel);

    this.input.setDraggable(handle);
    handle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const minX = x;
      const maxX = x + sliderW;
      const newX = Phaser.Math.Clamp(dragX, minX, maxX);
      handle.x = newX;
      fill.width = newX - minX;
      const value = (newX - minX) / sliderW;
      valLabel.setText(`${Math.round(value * 100)}%`);
      onChange(value);
    });
  }

  // ── Sound helper ─────────────────────────────────────────────

  private getSoundManager(): SoundManager | undefined {
    return this.registry.get('soundManager') as SoundManager | undefined;
  }
}
