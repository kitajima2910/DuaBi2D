// ============================================================
// Countries Marble Race — Skin & Trail Selection Panel
// Grid-based picker with lock/unlock state
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '@/config/GameConfig';
import { SKINS, TRAILS } from '@/config/UnlockData';
import type { SkinDefinition } from '@/config/UnlockData';
import type { PlayerProgress } from '@/types';

const PANEL_W = 500;
const PANEL_H = 400;
const CELL_SIZE = 70;
const SKIN_COLS = 5;
const TRAIL_COLS = 5;
const TRAIL_SIZE = 40;

export class SkinSelectPanel extends Phaser.GameObjects.Container {
  selectedSkin: string;
  selectedTrail: string;

  private skinSlots: Phaser.GameObjects.Container[] = [];
  private trailSlots: Phaser.GameObjects.Container[] = [];
  private scrollY = 0;
  private scrollable: Phaser.GameObjects.Container;
  private contentH = 0;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    progress: PlayerProgress,
    currentSkin: string,
    currentTrail: string,
  ) {
    super(scene, x, y);
    void progress; // used in buildSkinGrid / buildTrailGrid
    this.selectedSkin = currentSkin;
    this.selectedTrail = currentTrail;

    this.setDepth(800);
    scene.add.existing(this);

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(COLORS.ui.panel, 0.95);
    bg.fillRoundedRect(0, 0, PANEL_W, PANEL_H, 12);
    bg.lineStyle(2, COLORS.ui.panelBorder);
    bg.strokeRoundedRect(0, 0, PANEL_W, PANEL_H, 12);
    this.add(bg);

    // Title
    const title = scene.add.text(PANEL_W / 2, 16, '🎨 Trang trí', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(title);

    // Scrollable content
    this.scrollable = scene.add.container(0, 0);
    this.add(this.scrollable);

    this.buildSkinGrid(progress);
    this.buildTrailGrid(progress);

    // Scroll mask
    const maskShape = scene.make.graphics({ x: 0, y: 0 });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(x, y + 40, PANEL_W, PANEL_H - 50);
    const mask = maskShape.createGeometryMask();
    this.scrollable.setMask(mask);
    this.add(maskShape);

    // Scrolling
    this.setSize(PANEL_W, PANEL_H);
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, PANEL_W, PANEL_H),
      Phaser.Geom.Rectangle.Contains,
    );

    this.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _dx: number, dy: number) => {
      this.scrollY = Phaser.Math.Clamp(
        this.scrollY - dy * 0.5,
        -(this.contentH - (PANEL_H - 50)),
        0,
      );
      this.scrollable.setY(this.scrollY);
    });
  }

  // ── Public API ────────────────────────────────────────────

  getSelectedSkin(): string {
    return this.selectedSkin;
  }

  getSelectedTrail(): string {
    return this.selectedTrail;
  }

  override destroy(): void {
    this.removeAllListeners();
    super.destroy();
  }

  // ── Skin grid ──────────────────────────────────────────────

  private buildSkinGrid(progress: PlayerProgress): void {
    const label = (this.scene as Phaser.Scene).add.text(16, 44, 'Lớp da', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#94a3b8',
      fontStyle: 'bold',
    });
    this.scrollable.add(label);

    const gridStartX = 16;
    const gridStartY = 66;

    for (let i = 0; i < SKINS.length; i++) {
      const skin = SKINS[i]!;
      const col = i % SKIN_COLS;
      const row = Math.floor(i / SKIN_COLS);
      const cx = gridStartX + col * (CELL_SIZE + 8);
      const cy = gridStartY + row * (CELL_SIZE + 8);

      const slot = this.createSkinSlot(skin, cx, cy, progress);
      this.skinSlots.push(slot);
      this.scrollable.add(slot);

      this.contentH = cy + CELL_SIZE + 16;
    }
  }

  private createSkinSlot(
    skin: SkinDefinition,
    x: number,
    y: number,
    progress: PlayerProgress,
  ): Phaser.GameObjects.Container {
    const scene = this.scene as Phaser.Scene;
    const slot = scene.add.container(x, y);
    const isUnlocked = progress.unlockedSkins.includes(skin.id);
    const isSelected = this.selectedSkin === skin.id;

    // Background cell
    const cellBg = scene.add.rectangle(0, 0, CELL_SIZE, CELL_SIZE, 0x1e293b);
    cellBg.setStrokeStyle(2, isSelected ? COLORS.ui.gold : COLORS.ui.panelBorder);
    slot.add(cellBg);

    if (isUnlocked) {
      // Colour swatch
      const swatch = scene.add.rectangle(0, -6, CELL_SIZE - 16, CELL_SIZE - 16, skin.tint);
      swatch.setStrokeStyle(1, 0x475569);
      slot.add(swatch);

      // Rarity indicator
      const rarityColors: Record<string, string> = {
        common: '#94a3b8',
        rare: '#3b82f6',
        epic: '#a855f7',
        legendary: '#fbbf24',
      };
      const rarityColor = rarityColors[skin.rarity] ?? '#94a3b8';
      const rarityDot = scene.add.circle(CELL_SIZE / 2 - 10, -CELL_SIZE / 2 + 10, 4, Number(rarityColor));
      slot.add(rarityDot);

      // Name
      const name = scene.add.text(0, CELL_SIZE / 2 - 14, skin.name, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#cbd5e1',
      }).setOrigin(0.5);
      slot.add(name);

      // Interactive
      slot.setSize(CELL_SIZE, CELL_SIZE);
      slot.setInteractive(
        new Phaser.Geom.Rectangle(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE),
        Phaser.Geom.Rectangle.Contains,
      );

      const self = this;
      slot.on('pointerdown', () => {
        self.selectedSkin = skin.id;
        self.refreshSelection();
      });
      slot.on('pointerover', () => {
        if (!isSelected) cellBg.setStrokeStyle(2, 0x94a3b8);
      });
      slot.on('pointerout', () => {
        if (!isSelected) cellBg.setStrokeStyle(2, COLORS.ui.panelBorder);
      });
    } else {
      // Locked overlay
      const lockBg = scene.add.rectangle(0, 0, CELL_SIZE, CELL_SIZE, 0x000000, 0.5);
      slot.add(lockBg);

      const lockIcon = scene.add.text(0, -4, '🔒', {
        fontSize: '20px',
        fontFamily: 'Arial',
      }).setOrigin(0.5);
      slot.add(lockIcon);

      const levelText = scene.add.text(0, CELL_SIZE / 2 - 14, `LV ${skin.unlockLevel}`, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#64748b',
      }).setOrigin(0.5);
      slot.add(levelText);
    }

    return slot;
  }

  // ── Trail grid ──────────────────────────────────────────────

  private buildTrailGrid(progress: PlayerProgress): void {
    const scene = this.scene as Phaser.Scene;
    const gridStartX = 16;
    const skinRows = Math.ceil(SKINS.length / SKIN_COLS);
    const gridStartY = 66 + skinRows * (CELL_SIZE + 8) + 12;

    const label = scene.add.text(16, gridStartY - 14, 'Vệt', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#94a3b8',
      fontStyle: 'bold',
    });
    this.scrollable.add(label);

    for (let i = 0; i < TRAILS.length; i++) {
      const trail = TRAILS[i]!;
      const col = i % TRAIL_COLS;
      const row = Math.floor(i / TRAIL_COLS);
      const cx = gridStartX + col * (TRAIL_SIZE + 8);
      const cy = gridStartY + row * (TRAIL_SIZE + 8);

      const slot = this.createTrailSlot(trail, cx, cy, progress);
      this.trailSlots.push(slot);
      this.scrollable.add(slot);

      this.contentH = Math.max(this.contentH, cy + TRAIL_SIZE + 16);
    }
  }

  private createTrailSlot(
    trail: import('@/config/UnlockData').TrailDefinition,
    x: number,
    y: number,
    progress: PlayerProgress,
  ): Phaser.GameObjects.Container {
    const scene = this.scene as Phaser.Scene;
    const slot = scene.add.container(x, y);
    const isUnlocked = progress.unlockedTrails.includes(trail.id);
    const isSelected = this.selectedTrail === trail.id;

    const cellBg = scene.add.rectangle(0, 0, TRAIL_SIZE, TRAIL_SIZE, 0x1e293b);
    cellBg.setStrokeStyle(2, isSelected ? COLORS.ui.gold : COLORS.ui.panelBorder);
    slot.add(cellBg);

    if (isUnlocked) {
      // Colour circle
      const dot = scene.add.circle(0, 0, 10, trail.color);
      slot.add(dot);

      // Name
      const name = scene.add.text(0, TRAIL_SIZE / 2 - 10, trail.name, {
        fontSize: '9px',
        fontFamily: 'Arial',
        color: '#cbd5e1',
      }).setOrigin(0.5);
      slot.add(name);

      slot.setSize(TRAIL_SIZE, TRAIL_SIZE);
      slot.setInteractive(
        new Phaser.Geom.Rectangle(-TRAIL_SIZE / 2, -TRAIL_SIZE / 2, TRAIL_SIZE, TRAIL_SIZE),
        Phaser.Geom.Rectangle.Contains,
      );

      const self = this;
      slot.on('pointerdown', () => {
        self.selectedTrail = trail.id;
        self.refreshSelection();
      });
      slot.on('pointerover', () => {
        if (!isSelected) cellBg.setStrokeStyle(2, 0x94a3b8);
      });
      slot.on('pointerout', () => {
        if (!isSelected) cellBg.setStrokeStyle(2, COLORS.ui.panelBorder);
      });
    } else {
      const lockBg = scene.add.rectangle(0, 0, TRAIL_SIZE, TRAIL_SIZE, 0x000000, 0.5);
      slot.add(lockBg);

      const lockIcon = scene.add.text(0, -4, '🔒', {
        fontSize: '16px',
        fontFamily: 'Arial',
      }).setOrigin(0.5);
      slot.add(lockIcon);

      const lvText = scene.add.text(0, TRAIL_SIZE / 2 - 10, `LV ${trail.unlockLevel}`, {
        fontSize: '9px',
        fontFamily: 'Arial',
        color: '#64748b',
      }).setOrigin(0.5);
      slot.add(lvText);
    }

    return slot;
  }

  // ── Selection refresh ─────────────────────────────────────

  private refreshSelection(): void {
    for (const slot of this.skinSlots) {
      const bg = slot.getAt(0) as Phaser.GameObjects.Rectangle;
      if (bg) {
        const isSelected = this.selectedSkin === this.getSkinIdFromSlot(slot);
        bg.setStrokeStyle(2, isSelected ? COLORS.ui.gold : COLORS.ui.panelBorder);
      }
    }

    for (const slot of this.trailSlots) {
      const bg = slot.getAt(0) as Phaser.GameObjects.Rectangle;
      if (bg) {
        const isSelected = this.selectedTrail === this.getTrailIdFromSlot(slot);
        bg.setStrokeStyle(2, isSelected ? COLORS.ui.gold : COLORS.ui.panelBorder);
      }
    }
  }

  private getSkinIdFromSlot(slot: Phaser.GameObjects.Container): string {
    const nameText = slot.getAt(2) as Phaser.GameObjects.Text | undefined;
    if (!nameText) return '';
    const name = nameText.text;
    const skin = SKINS.find((s) => s.name === name);
    return skin?.id ?? '';
  }

  private getTrailIdFromSlot(slot: Phaser.GameObjects.Container): string {
    const nameText = slot.getAt(2) as Phaser.GameObjects.Text | undefined;
    if (!nameText) return '';
    const name = nameText.text;
    const trail = TRAILS.find((t) => t.name === name);
    return trail?.id ?? '';
  }
}
