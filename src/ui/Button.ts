// ============================================================
// Countries Marble Race — Premium Button Component
// Rounded rect with hover/click animations.
// ============================================================

import Phaser from "phaser";

export interface ButtonConfig {
  width?: number;
  height?: number;
  fontSize?: number;
  bgColor?: number;
  hoverColor?: number;
  textColor?: number;
  borderRadius?: number;
  onClick?: () => void;
}

const DEFAULTS: Required<ButtonConfig> = {
  width: 200,
  height: 56,
  fontSize: 20,
  bgColor: 0x3b82f6,
  hoverColor: 0x2563eb,
  textColor: 0xffffff,
  borderRadius: 12,
  onClick: () => {
    /* noop */
  },
};

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private config: Required<ButtonConfig>;
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config?: ButtonConfig,
  ) {
    super(scene, x, y);

    this.config = { ...DEFAULTS, ...config };

    // Background
    this.bg = scene.add.graphics();
    this.drawBg(this.config.bgColor);
    this.add(this.bg);

    // Text
    this.label = scene.add.text(0, 0, text, {
      fontSize: `${this.config.fontSize}px`,
      fontFamily: 'Arial, sans-serif',
      color: `#${this.config.textColor.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    // Hit area
    this.setSize(this.config.width, this.config.height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.config.width / 2,
        -this.config.height / 2,
        this.config.width,
        this.config.height,
      ),
      Phaser.Geom.Rectangle.Contains,
    );
    if (this.input) {
      this.input.cursor = 'pointer';
    }

    // Events
    this.on('pointerover', this.onHover, this);
    this.on('pointerout', this.onOut, this);
    this.on('pointerdown', this.onDown, this);
    this.on('pointerup', this.onUp, this);

    scene.add.existing(this);
    this.setDepth(100);
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Enable or disable the button.
   * Disabled buttons appear dimmed and don't respond to clicks.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.5;

    if (enabled) {
      this.setInteractive();
      if (this.input) {
        this.input.cursor = 'pointer';
      }
    } else {
      this.disableInteractive();
    }
  }

  /**
   * Change the button text.
   */
  setText(text: string): void {
    this.label.setText(text);
  }

  /**
   * Clean up.
   */
  override destroy(): void {
    this.removeAllListeners();
    this.bg.destroy();
    this.label.destroy();
    super.destroy();
  }

  // ============================================================
  // Internals
  // ============================================================

  private drawBg(color: number): void {
    const { width, height, borderRadius } = this.config;
    const w = width;
    const h = height;
    const r = Math.min(borderRadius, w / 2, h / 2);

    this.bg.clear();
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  }

  private onHover(): void {
    if (!this.enabled) return;

    this.drawBg(this.config.hoverColor);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Sine.easeOut',
    });

    this.playSound('ui_hover', 0.3);
  }

  private onOut(): void {
    if (!this.enabled) return;

    this.drawBg(this.config.bgColor);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Sine.easeOut',
    });
  }

  private onDown(): void {
    if (!this.enabled) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 80,
      ease: 'Sine.easeIn',
    });

    this.playSound('ui_click', 0.5);
  }

  private onUp(): void {
    if (!this.enabled) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 80,
      ease: 'Sine.easeOut',
    });

    this.config.onClick();
  }

  private playSound(id: string, volume: number): void {
    const sm = this.scene.registry.get('soundManager') as
      | { play: (id: string, config?: { volume?: number }) => void }
      | undefined;
    if (sm) {
      sm.play(id, { volume });
    }
  }
}
