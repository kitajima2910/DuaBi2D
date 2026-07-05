// ============================================================
// Countries Marble Race — Country Selection Scene
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '@/config/GameConfig';
import { COUNTRIES } from '@/config/CountryData';
import type { CountryData, RaceConfig } from '@/types';
import { Button } from '@/ui/Button';

interface SelectableCountry {
  data: CountryData;
  container: Phaser.GameObjects.Container;
  flag: Phaser.GameObjects.Image;
  nameText: Phaser.GameObjects.Text;
  border: Phaser.GameObjects.Rectangle;
  checkMark: Phaser.GameObjects.Text;
  selected: boolean;
}

export default class SelectScene extends Phaser.Scene {
  private countries: SelectableCountry[] = [];
  private selectedIds = new Set<string>();
  private counterText!: Phaser.GameObjects.Text;
  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private contentHeight = 0;
  private readonly visibleHeight: number;
  private readonly scrollStartY: number;
  private difficulty = 6; // default: medium → 6 sectors

  constructor() {
    super('SelectScene');
    this.visibleHeight = 500;
    this.scrollStartY = 140;
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0f172a');
    this.selectedIds = new Set<string>();

    // ---- Header ----
    this.add
      .text(width / 2, 30, 'CHỌN QUỐC GIA THAM GIA', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // ---- Counter ----
    this.counterText = this.add
      .text(width / 2, 65, `Đã chọn: ${this.selectedIds.size}/${COUNTRIES.length}`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#94a3b8',
      })
      .setOrigin(0.5);

    // ---- Scrollable grid container ----
    this.scrollContainer = this.add.container(0, 0);

    const cols = 4;
    const cellW = 150;
    const cellH = 70;
    const gridStartX = (width - cols * cellW) / 2 + cellW / 2;
    const gridStartY = 20;

    this.countries = [];

    COUNTRIES.forEach((country, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cx = gridStartX + col * cellW;
      const cy = gridStartY + row * cellH;

      const container = this.add.container(cx, cy);

      // Border
      const border = this.add.rectangle(0, 0, cellW - 12, cellH - 8, 0x1e293b);
      border.setStrokeStyle(2, 0x475569);
      container.add(border);

      // Flag marble texture
      const flag = this.add.image(-28, 0, `flag_${country.id}`);
      flag.setScale(1);
      container.add(flag);

      // Country name
      const nameText = this.add.text(12, 0, country.name, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#e2e8f0',
      }).setOrigin(0, 0.5);
      container.add(nameText);

      // Check mark (hidden by default)
      const checkMark = this.add.text(cellW / 2 - 24, -cellH / 2 + 10, '✓', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#22c55e',
        fontStyle: 'bold',
      }).setOrigin(0.5).setVisible(false);
      container.add(checkMark);

      // Hit zone
      const hitZone = this.add.rectangle(0, 0, cellW - 12, cellH - 8, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      container.add(hitZone);

      const entry: SelectableCountry = {
        data: country,
        container,
        flag,
        nameText,
        border,
        checkMark,
        selected: false,
      };
      this.countries.push(entry);
      this.scrollContainer.add(container);

      hitZone.on('pointerdown', () => this.toggleCountry(entry));
      hitZone.on('pointerover', () => {
        if (!entry.selected) border.setStrokeStyle(2, 0x94a3b8);
      });
      hitZone.on('pointerout', () => {
        if (!entry.selected) border.setStrokeStyle(2, 0x475569);
      });
    });

    this.contentHeight = Math.ceil(COUNTRIES.length / cols) * cellH + 40;

    // ---- Scroll mask ----
    const maskShape = this.make.graphics({ x: 0, y: 0 });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.scrollStartY, width, this.visibleHeight);
    const mask = maskShape.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // ---- Drag-to-scroll ----
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      const dy = pointer.y - pointer.prevPosition.y;
      this.scrollY = Phaser.Math.Clamp(
        this.scrollY + dy,
        -(this.contentHeight - this.visibleHeight),
        0,
      );
      this.scrollContainer.y = this.scrollY;
    });

    // ---- Difficulty slider ----
    const diffY = height - 70;

    this.add.text(80, diffY - 18, 'Độ khó:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
    }).setOrigin(0, 0.5);

    const diffSteps = [
      { label: 'Dễ', sectors: 3 },
      { label: 'Trung bình', sectors: 6 },
      { label: 'Khó', sectors: 10 },
      { label: 'Siêu khó', sectors: 14 },
    ];

    const sliderX = 180;
    const sliderW = 300;
    const sliderY = diffY;

    // Track background
    this.add.rectangle(sliderX, sliderY, sliderW, 6, COLORS.trackWall)
      .setOrigin(0, 0.5);

    const trackFill = this.add.rectangle(sliderX, sliderY, 0, 6, COLORS.ui.gold)
      .setOrigin(0, 0.5);

    // Handle
    const handle = this.add.circle(sliderX, sliderY, 12, 0xfbbf24)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xffffff);

    // Label
    const diffLabel = this.add.text(sliderX + sliderW + 20, sliderY, 'Trung bình', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#fbbf24',
    }).setOrigin(0, 0.5);

    // Step markers
    diffSteps.forEach((step, i) => {
      const stepX = sliderX + (i / (diffSteps.length - 1)) * sliderW;
      const stepLabel = this.add.text(stepX, sliderY + 18, step.label, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: '#64748b',
      }).setOrigin(0.5, 0);

      stepLabel.setInteractive({ useHandCursor: true });
      stepLabel.on('pointerdown', () => {
        this.difficulty = step.sectors;
        this.updateDifficultyUI(handle, trackFill, diffLabel, sliderX, sliderW, diffSteps);
      });
    });

    // Drag handle
    this.input.setDraggable(handle);
    handle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const minX = sliderX;
      const maxX = sliderX + sliderW;
      const newX = Phaser.Math.Clamp(dragX, minX, maxX);
      handle.x = newX;

      const t = (newX - minX) / sliderW;
      const stepIndex = Math.round(t * (diffSteps.length - 1));
      this.difficulty = diffSteps[stepIndex]!.sectors;
      this.updateDifficultyUI(handle, trackFill, diffLabel, sliderX, sliderW, diffSteps);
    });

    // Set initial position
    this.updateDifficultyUI(handle, trackFill, diffLabel, sliderX, sliderW, diffSteps);

    // ---- Buttons ----
    new Button(this, width - 120, diffY, '🏁 ĐUA!', {
      bgColor: 0xf59e0b,
      hoverColor: 0xd97706,
      textColor: 0x1e293b,
      onClick: () => this.startRace(),
    });

    new Button(this, 80, height - 20, '🔙 Quay lại', {
      width: 140,
      height: 40,
      fontSize: 16,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => this.scene.start('MenuScene'),
    });
  }

  // ── Toggle country selection ──────────────────────────────────

  private toggleCountry(entry: SelectableCountry): void {
    entry.selected = !entry.selected;

    if (entry.selected) {
      this.selectedIds.add(entry.data.id);
      entry.border.setStrokeStyle(3, 0xfbbf24);
      entry.checkMark.setVisible(true);
    } else {
      this.selectedIds.delete(entry.data.id);
      entry.border.setStrokeStyle(2, 0x475569);
      entry.checkMark.setVisible(false);
    }

    this.counterText.setText(`Đã chọn: ${this.selectedIds.size}/${COUNTRIES.length}`);
  }

  // ── Start race ────────────────────────────────────────────────

  private startRace(): void {
    if (this.selectedIds.size < 2) {
      this.showWarning('Chọn ít nhất 2 quốc gia!');
      return;
    }

    const countryIds = Array.from(this.selectedIds);
    const seed = Date.now();

    const raceConfig: RaceConfig = {
      marbleCount: countryIds.length,
      trackSeed: seed,
      difficulty: this.difficulty,
      lapCount: 1,
      countryIds,
    };

    this.scene.start('RaceScene', { raceConfig });
  }

  // ── Warning toast ─────────────────────────────────────────────

  private showWarning(message: string): void {
    const { width, height } = this.scale;

    const bg = this.add.rectangle(width / 2, height / 2, 400, 60, 0x000000, 0.85)
      .setDepth(200);

    const text = this.add
      .text(width / 2, height / 2, `⚠️ ${message}`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#f59e0b',
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [bg, text],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          bg.destroy();
          text.destroy();
        },
      });
    });
  }

  // ── Difficulty UI updater ─────────────────────────────────────

  private updateDifficultyUI(
    handle: Phaser.GameObjects.Arc,
    fill: Phaser.GameObjects.Rectangle,
    label: Phaser.GameObjects.Text,
    sliderX: number,
    sliderW: number,
    steps: { label: string; sectors: number }[],
  ): void {
    const idx = steps.findIndex((s) => s.sectors === this.difficulty);
    const t = idx / (steps.length - 1);
    handle.x = sliderX + t * sliderW;
    fill.width = t * sliderW;
    const step = steps[idx];
    if (step) {
      label.setText(step.label);
    }
  }
}
