// ============================================================
// Countries Marble Race — Countdown Overlay
// "3" → "2" → "1" → "GO!" with scale + fade animations.
// ============================================================

import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COUNTDOWN_SECONDS } from "@/config/GameConfig";

const TICK_DURATION = 900; // ms per countdown tick
const FADE_DURATION = 200;
const GO_DISPLAY_DURATION = 800;

export class CountdownOverlay {
  readonly container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;

  /** Semi-transparent black overlay */
  private overlay: Phaser.GameObjects.Rectangle;

  /** The countdown number text */
  private numberText: Phaser.GameObjects.Text;

  private onComplete: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(950);

    // Full-screen black overlay
    this.overlay = scene.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.6,
    );
    this.container.add(this.overlay);

    // Countdown number text
    this.numberText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '128px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.numberText.setOrigin(0.5);
    this.container.add(this.numberText);

    // Hidden by default; shown when startCountdown is called
    this.container.setVisible(false);
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Start the countdown animation sequence.
   * @param onComplete Called when the full countdown (including "GO!") finishes.
   */
  startCountdown(onComplete: () => void): void {
    this.onComplete = onComplete;
    this.container.setVisible(true);
    this.overlay.setAlpha(0.6);

    // Start the countdown chain
    this.showNumber(COUNTDOWN_SECONDS, () => {
      this.showNumber(COUNTDOWN_SECONDS - 1, () => {
        this.showNumber(COUNTDOWN_SECONDS - 2, () => {
          this.showGo();
        });
      });
    });
  }

  /**
   * Clean up.
   */
  destroy(): void {
    this.scene.tweens.killTweensOf(this.numberText);
    this.scene.tweens.killTweensOf(this.overlay);
    this.numberText.destroy();
    this.overlay.destroy();
    this.container.destroy();
  }

  // ============================================================
  // Internals
  // ============================================================

  /**
   * Show a number with scale-in + fade-out animation.
   */
  private showNumber(num: number, next: () => void): void {
    this.numberText.setText(num.toString());
    this.numberText.setColor('#ffffff');
    this.numberText.setScale(2);
    this.numberText.setAlpha(1);

    // Scale down to 1 and then fade out
    this.scene.tweens.add({
      targets: this.numberText,
      scaleX: 1,
      scaleY: 1,
      duration: TICK_DURATION * 0.6,
      ease: 'Back.easeOut',
    });

    this.scene.tweens.add({
      targets: this.numberText,
      alpha: 0,
      duration: FADE_DURATION,
      delay: TICK_DURATION - FADE_DURATION,
      ease: 'Sine.easeIn',
      onComplete: next,
    });
  }

  /**
   * Show "GO!" in green, then call onComplete.
   */
  private showGo(): void {
    this.numberText.setText('GO!');
    this.numberText.setColor('#22c55e');
    this.numberText.setScale(1.5);
    this.numberText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.numberText,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut',
    });

    // Fade out overlay + text after display duration
    this.scene.tweens.add({
      targets: [this.numberText, this.overlay],
      alpha: 0,
      duration: 300,
      delay: GO_DISPLAY_DURATION,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.container.setVisible(false);
        this.onComplete?.();
      },
    });
  }
}
