// ============================================================
// Countries Marble Race — Progression / Stats Scene
// Level, XP, unlocks, track tiers
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '@/config/GameConfig';
import { ProgressionManager } from '@/managers/ProgressionManager';
import { SkinManager } from '@/managers/SkinManager';
import { TRACK_THEMES } from '@/config/TrackThemes';
import { SKINS } from '@/config/UnlockData';
import { Button } from '@/ui/Button';

export default class ProgressionScene extends Phaser.Scene {
  private progression!: ProgressionManager;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super('ProgressionScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0f172a');

    this.progression = new ProgressionManager();

    // Title
    this.add.text(width / 2, 20, '⭐ TIẾN TRÌNH', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── Level display ──────────────────────────────────────
    const level = this.progression.getLevel();
    const levelText = this.add.text(width / 2, 75, `${level}`, {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 115, 'CẤP ĐỘ', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#94a3b8',
    }).setOrigin(0.5);

    // Level-up animation on change
    this.tweens.add({
      targets: levelText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    // ── XP Progress bar ────────────────────────────────────
    const barX = width / 2 - 150;
    const barY = 140;
    const barW = 300;
    const barH = 18;

    // Background
    this.add.rectangle(width / 2, barY, barW, barH, COLORS.trackWall)
      .setStrokeStyle(1, COLORS.ui.panelBorder);

    // Fill (redrawn via graphics)
    this.progressBar = this.add.graphics();
    this.updateProgressBar(barX, barY, barW, barH);

    // XP text
    const xpCurrent = this.progression.progress.xp;
    const xpNext = this.progression.getXPForNextLevel();
    this.add.text(width / 2, barY + 14, `XP: ${xpCurrent} / ${xpNext}`, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#94a3b8',
    }).setOrigin(0.5, 0);

    // ── Stats row ──────────────────────────────────────────
    const statsY = 185;
    const stats = this.progression.progress;
    const winRate = stats.totalRaces > 0
      ? Math.round((stats.wins / stats.totalRaces) * 100)
      : 0;

    const statItems = [
      { label: 'Tổng đua', value: stats.totalRaces.toString() },
      { label: 'Chiến thắng', value: stats.wins.toString() },
      { label: 'Top 3', value: stats.top3.toString() },
      { label: 'Tỉ lệ thắng', value: `${winRate}%` },
    ];

    const statSpacing = 130;
    const statStartX = (width - statSpacing * (statItems.length - 1)) / 2;

    statItems.forEach((item, i) => {
      const sx = statStartX + i * statSpacing;
      this.add.text(sx, statsY, item.value, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(sx, statsY + 28, item.label, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#94a3b8',
      }).setOrigin(0.5);
    });

    // ── Skins unlocked ─────────────────────────────────────
    const skinSectionY = 240;
    this.add.text(40, skinSectionY, '🎨 Lớp da đã mở', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#e2e8f0',
      fontStyle: 'bold',
    });

    const availableSkins = SkinManager.getAvailableSkins(stats);
    const lockedSkins = SKINS.filter((s) => !stats.unlockedSkins.includes(s.id));

    let skinX = 40;
    let skinY = skinSectionY + 30;
    const skinCellSize = 56;
    const skinGap = 8;
    let skinCount = 0;

    for (const skin of availableSkins) {
      if (skinCount > 0 && skinCount % 10 === 0) {
        skinX = 40;
        skinY += skinCellSize + skinGap;
      }

      const container = this.add.container(skinX, skinY);
      const bg = this.add.rectangle(0, 0, skinCellSize, skinCellSize, 0x1e293b);
      bg.setStrokeStyle(1, COLORS.ui.panelBorder);
      container.add(bg);

      const swatch = this.add.rectangle(0, -4, skinCellSize - 12, skinCellSize - 12, skin.tint);
      container.add(swatch);

      const name = this.add.text(0, skinCellSize / 2 - 10, skin.name, {
        fontSize: '8px',
        fontFamily: 'Arial',
        color: '#94a3b8',
      }).setOrigin(0.5);
      container.add(name);

      skinX += skinCellSize + skinGap;
      skinCount++;
    }

    // Locked skins hint
    if (lockedSkins.length > 0) {
      const nextUnlock = lockedSkins.reduce(
        (min, s) => (s.unlockLevel < min ? s.unlockLevel : min),
        Infinity,
      );
      if (nextUnlock < Infinity) {
        this.add.text(40, skinY + skinCellSize + 8, `Mở khóa tiếp theo: Cấp ${nextUnlock}`, {
          fontSize: '11px',
          fontFamily: 'Arial',
          color: '#64748b',
        });
      }
    }

    // ── Trails unlocked ─────────────────────────────────────
    const trailSectionY = skinY + 70;
    this.add.text(40, trailSectionY, '✨ Vệt đã mở', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#e2e8f0',
      fontStyle: 'bold',
    });

    const availableTrails = SkinManager.getAvailableTrails(stats);

    let trailX = 40;
    let trailY = trailSectionY + 30;
    const trailCellSize = 48;
    const trailGap = 8;

    for (let i = 0; i < availableTrails.length; i++) {
      const trail = availableTrails[i]!;
      if (i > 0 && i % 10 === 0) {
        trailX = 40;
        trailY += trailCellSize + trailGap;
      }

      const container = this.add.container(trailX, trailY);
      const bg = this.add.rectangle(0, 0, trailCellSize, trailCellSize, 0x1e293b);
      bg.setStrokeStyle(1, COLORS.ui.panelBorder);
      container.add(bg);

      const dot = this.add.circle(0, -4, 10, trail.color);
      container.add(dot);

      const name = this.add.text(0, trailCellSize / 2 - 10, trail.name, {
        fontSize: '8px',
        fontFamily: 'Arial',
        color: '#94a3b8',
      }).setOrigin(0.5);
      container.add(name);

      trailX += trailCellSize + trailGap;
    }

    // ── Track themes ────────────────────────────────────────
    const themeSectionY = trailY + 60;
    this.add.text(40, themeSectionY, '🛤️ Đường đua', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#e2e8f0',
      fontStyle: 'bold',
    });

    let themeX = 40;
    let themeY = themeSectionY + 30;

    for (let i = 0; i < TRACK_THEMES.length; i++) {
      const theme = TRACK_THEMES[i]!;
      const unlocked = level >= theme.unlockLevel;

      if (i > 0 && i % 4 === 0) {
        themeX = 40;
        themeY += 50;
      }

      const container = this.add.container(themeX, themeY);
      const swatch = this.add.rectangle(0, 0, 70, 30, theme.trackColor);
      swatch.setStrokeStyle(1, COLORS.ui.panelBorder);

      if (!unlocked) {
        const lockOverlay = this.add.rectangle(0, 0, 70, 30, 0x000000, 0.6);
        container.add(lockOverlay);

        const lockIcon = this.add.text(0, -2, '🔒', { fontSize: '14px' }).setOrigin(0.5);
        container.add(lockIcon);
      }

      container.add(swatch);

      const name = this.add.text(themeX, themeY + 18, unlocked ? theme.name : `Cấp ${theme.unlockLevel}`, {
        fontSize: '9px',
        fontFamily: 'Arial',
        color: unlocked ? '#e2e8f0' : '#64748b',
      }).setOrigin(0.5);
      this.add.existing(name);

      themeX += 80;
    }

    // ── Reset button ────────────────────────────────────────
    new Button(this, width - 120, 32, '🔄 Đặt lại', {
      width: 110,
      height: 32,
      fontSize: 13,
      bgColor: 0xef4444,
      hoverColor: 0xdc2626,
      onClick: () => this.confirmReset(),
    });

    // ── Back button ─────────────────────────────────────────
    new Button(this, 80, height - 30, '🔙 Quay lại', {
      width: 140,
      height: 40,
      fontSize: 16,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => this.scene.start('MenuScene'),
    });
  }

  // ── Progress bar ──────────────────────────────────────────

  private updateProgressBar(x: number, y: number, w: number, h: number): void {
    this.progressBar.clear();
    const progress = this.progression.getXPProgress();
    this.progressBar.fillStyle(COLORS.ui.accent, 1);
    this.progressBar.fillRoundedRect(x, y - h / 2, w * progress, h, 4);
  }

  // ── Reset confirmation ────────────────────────────────────

  private confirmReset(): void {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive()
      .setDepth(200);

    const panel = this.add.container(width / 2, height / 2).setDepth(201);

    const bg = this.add.rectangle(0, 0, 380, 180, COLORS.ui.panel);
    bg.setStrokeStyle(2, COLORS.ui.panelBorder);
    panel.add(bg);

    const warnText = this.add.text(0, -50, '⚠️ XÓA TIẾN TRÌNH?', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ef4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    panel.add(warnText);

    const subText = this.add.text(0, -20, 'Tất cả dữ liệu sẽ bị mất!', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#94a3b8',
    }).setOrigin(0.5);
    panel.add(subText);

    const confirmBtn = new Button(this, -80, 40, 'XÁC NHẬN', {
      width: 130,
      height: 40,
      fontSize: 15,
      bgColor: 0xef4444,
      hoverColor: 0xdc2626,
      onClick: () => {
        this.progression.reset();
        overlay.destroy();
        panel.destroy();
        this.scene.restart();
      },
    });
    panel.add(confirmBtn);

    const cancelBtn = new Button(this, 80, 40, 'HỦY', {
      width: 130,
      height: 40,
      fontSize: 15,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => {
        overlay.destroy();
        panel.destroy();
      },
    });
    panel.add(cancelBtn);

    overlay.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
    });
  }
}
