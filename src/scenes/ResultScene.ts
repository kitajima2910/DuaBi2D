// ============================================================
// Countries Marble Race — Race Results Scene
// ============================================================

import Phaser from 'phaser';
import type { RaceResult, ReplayData } from '@/types';
import { FinishCelebration } from '@/ui/FinishCelebration';
import { LeaderboardPanel } from '@/ui/LeaderboardPanel';
import { ProgressionManager } from '@/managers/ProgressionManager';
import { saveReplay } from '@/utils/Storage';
import { Button } from '@/ui/Button';
import type { SoundManager } from '@/audio/SoundManager';

export default class ResultScene extends Phaser.Scene {
  private results: RaceResult[] = [];
  private replayData: ReplayData | null = null;
  private progression!: ProgressionManager;

  constructor() {
    super('ResultScene');
  }

  init(data: { results: RaceResult[]; replayData?: ReplayData }): void {
    this.results = data.results ?? [];
    this.replayData = data.replayData ?? null;
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0f172a');

    // ---- Victory music ----
    this.getSoundManager()?.playMusic('music_victory');

    // ---- Progression ----
    this.progression = new ProgressionManager();

    // Calculate XP from race performance
    for (const result of this.results) {
      if (!result.eliminated) {
        this.progression.recordRace(result.rank, this.results.length);
      }
    }
    // ---- Save replay ----
    if (this.replayData) {
      saveReplay(this.replayData);
    }

    // ---- Sparkle background ----
    this.createSparkleBackground(width, height);

    // ---- Title ----
    const title = this.add
      .text(width / 2, 30, '🏁 KẾT QUẢ CUỘC ĐUA', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 35,
      duration: 600,
      ease: 'Power2',
    });

    // ---- Top 3 Podium ----
    const top3 = this.results.filter((r) => !r.eliminated && r.rank <= 3);
    // FinishCelebration auto-adds to scene; pass onComplete as noop
    new FinishCelebration(this, top3, () => {
      // Tap-to-continue handler
    });

    // ---- Full results list ----
    const panelX = (width - 480) / 2;
    const panelY = height * 0.58;
    new LeaderboardPanel(this, this.results, panelX, panelY);

    // ---- Stats ----
    const finishers = this.results.filter((r) => !r.eliminated);
    const avgSpeed =
      finishers.length > 0
        ? Math.round(
            finishers.reduce((sum, r) => sum + r.averageSpeed, 0) / finishers.length,
          )
        : 0;
    const topSpeed = Math.round(
      this.results.reduce((max, r) => Math.max(max, r.topSpeed), 0),
    );

    const statsY = height - 80;
    const statsStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#94a3b8',
    };

    this.add
      .text(width * 0.25, statsY, `Về đích: ${finishers.length}/${this.results.length}`, statsStyle)
      .setOrigin(0.5);

    this.add
      .text(width * 0.50, statsY, `Tốc độ tối đa: ${topSpeed} px/s`, statsStyle)
      .setOrigin(0.5);

    this.add
      .text(width * 0.75, statsY, `Tốc độ TB: ${avgSpeed} px/s`, statsStyle)
      .setOrigin(0.5);

    // ---- Action buttons ----
    const btnY = height - 30;

    new Button(this, width * 0.3, btnY, '🔁 ĐUA LẠI', {
      width: 180,
      fontSize: 18,
      bgColor: 0x3b82f6,
      hoverColor: 0x2563eb,
      onClick: () => this.scene.start('SelectScene'),
    });

    new Button(this, width * 0.5, btnY, '🏠 VỀ MENU', {
      width: 180,
      fontSize: 18,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => this.scene.start('MenuScene'),
    });

    new Button(this, width * 0.7, btnY, '📺 XEM LẠI', {
      width: 180,
      fontSize: 18,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => {
        if (this.replayData) {
          this.scene.start('ReplayScene', { replayData: this.replayData });
        }
      },
    });

    // ---- XP animation ----
    this.showXPAnimation(width, height);

    // === Register cleanup on scene shutdown ===
    this.events.on('shutdown', this.cleanup, this);
  }

  // ── Sparkle particles ─────────────────────────────────────────

  private createSparkleBackground(width: number, height: number): void {
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(1, 3);
      const dot = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.2, 0.6));

      this.tweens.add({
        targets: dot,
        alpha: 0,
        y: y - Phaser.Math.Between(20, 60),
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut',
      });
    }
  }

  // ── XP animation ──────────────────────────────────────────────

  private showXPAnimation(width: number, height: number): void {
    const xpText = this.add
      .text(width / 2, height * 0.34, '+200 XP', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#22c55e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: xpText,
      alpha: 1,
      y: height * 0.30,
      duration: 800,
      delay: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: xpText,
          alpha: 0,
          y: height * 0.24,
          duration: 600,
          delay: 800,
          ease: 'Power2',
        });
      },
    });
  }

  // ── Sound helper ─────────────────────────────────────────────

  private getSoundManager(): SoundManager | undefined {
    return this.registry.get('soundManager') as SoundManager | undefined;
  }

  // ── Cleanup ───────────────────────────────────────────────────

  private cleanup(): void {
    // Stop victory music when leaving result screen
    this.getSoundManager()?.stopMusic();
  }
}
