// ============================================================
// Countries Marble Race — Main Race Scene
// ============================================================

import Phaser from 'phaser';
import type { RaceConfig, RaceResult, ReplayData } from '@/types';
import { eventBus } from '@/utils/EventBus';
import { RaceManager } from '@/managers/RaceManager';
import { LeaderboardManager } from '@/managers/LeaderboardManager';
import { CameraManager } from '@/managers/CameraManager';
import { ParticleManager } from '@/managers/ParticleManager';
import { ReplayRecorder } from '@/systems/ReplayRecorder';
import { HUD } from '@/ui/HUD';
import { Button } from '@/ui/Button';
import type { SoundManager } from '@/audio/SoundManager';
import { CollisionSystem } from '@/systems/CollisionSystem';

export default class RaceScene extends Phaser.Scene {
  private raceManager!: RaceManager;
  private leaderboard!: LeaderboardManager;
  private cameraManager!: CameraManager;
  private particleManager!: ParticleManager;
  private hud!: HUD;
  private replayRecorder!: ReplayRecorder;

  private raceConfig!: RaceConfig;
  private isPaused = false;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;
  private escKey!: Phaser.Input.Keyboard.Key;
  private raceFinished = false;
  private transitionStarted = false;
  private recordedReplay: ReplayData | null = null;
  /** Track last roll sound time per marble for throttle */
  private lastRollTime = 0;

  // Countdown display
  private countdownText!: Phaser.GameObjects.Text;

  constructor() {
    super('RaceScene');
  }

  // ── Init ──────────────────────────────────────────────────────

  init(data: { raceConfig: RaceConfig }): void {
    this.raceConfig = data.raceConfig;
    this.isPaused = false;
    this.raceFinished = false;
    this.transitionStarted = false;
  }

  // ── Create ────────────────────────────────────────────────────

  create(): void {
    this.cameras.main.setBackgroundColor('#0f172a');

    // === Start race music (it will continue during countdown) ===
    this.getSoundManager()?.playMusic('music_race');

    // === Countdown text (simple overlay) ===
    const { width, height } = this.scale;
    this.countdownText = this.add
      .text(width / 2, height / 2, '', {
        fontSize: '128px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(950)
      .setAlpha(0);

    // === Replay Recorder ===
    this.replayRecorder = new ReplayRecorder(this.raceConfig.countryIds.length);

    // === Race Manager ===
    this.raceManager = new RaceManager(this, this.raceConfig);
    this.raceManager.startRace(); // Creates track + marbles + starts countdown
    this.replayRecorder.start(this.raceConfig);

    // === Dependent managers (raceManager has track & marbles now) ===
    this.leaderboard = new LeaderboardManager(
      this.raceManager.marbles,
    );

    // Camera manager follows leaders
    this.cameraManager = new CameraManager(this.cameras.main);

    // Particle effects
    this.particleManager = new ParticleManager(this);

    // HUD
    this.hud = new HUD(this);

    // === Collision system (marble↔marble, marble↔wall, marble↔obstacle) ===
    const allObstacles = this.raceManager.track
      ? this.collectObstacles()
      : [];
    CollisionSystem.setup(this, this.raceManager.marbles, allObstacles);

    // === Event listeners ===
    eventBus.on('race:countdown-tick', this.onCountdownTick);
    eventBus.on('race:phase-change', this.onPhaseChange);
    eventBus.on('race:marble-finish', this.onMarbleFinish);
    eventBus.on('race:marble-eliminate', this.onMarbleEliminate);
    eventBus.on('race:finish-all', this.onRaceFinishAll);

    // === Sound: booster hit → play boost sound ===
    this.events.on('booster-hit', () => {
      this.getSoundManager()?.play('boost', { volume: 0.5 });
    });

    // === Sound: marble collision → play bounce sound ===
    this.events.on('marble-bounce', () => {
      this.getSoundManager()?.play('bounce', { volume: 0.2 });
    });

    // === ESC key → pause ===
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => {
      if (!this.raceFinished && !this.transitionStarted) {
        this.togglePause();
      }
    });

    // === Register cleanup on scene shutdown ===
    this.events.on('shutdown', this.cleanup, this);
  }

  // ── Update ────────────────────────────────────────────────────

  override update(_time: number, delta: number): void {
    if (this.isPaused) return;

    // Let RaceManager handle its internal state (countdown → racing → finished)
    this.raceManager.update(delta);

    const phase = this.raceManager.phase;

    if (phase === 'RACING' && !this.raceFinished) {
      // Rolling sound — play looped roll while marbles are moving
      const now = this.time.now;
      if (now - this.lastRollTime > 400) {
        const anyMoving = this.raceManager.marbles.some(
          (m) => !m.marbleState.finished && !m.marbleState.eliminated && m.marbleState.speed > 2,
        );
        if (anyMoving) {
          this.getSoundManager()?.play('roll', { volume: 0.08, loop: false });
        }
        this.lastRollTime = now;
      }

      // Record replay frames during racing
      this.replayRecorder.recordFrame(this.raceManager.marbles);

      // Build marble positions for camera
      const positions = this.raceManager.marbles
        .filter((m) => !m.marbleState.eliminated)
        .map((m) => ({ x: m.x, y: m.y }));

      // Set camera target to leader (first uneliminated marble)
      if (positions.length > 0) {
        this.cameraManager.setLeaderTarget(positions[0]!);
      }

      // Update camera smoothly
      this.cameraManager.update(delta, positions);

      // Update leaderboard
      this.leaderboard.update();

      // HUD
      this.hud.updateLeaderboard(this.leaderboard.entries);
      this.hud.updateTimer(this.raceManager.elapsed);

      // Particles
      this.particleManager.update(delta);
    }

    // Race just finished → transition to result scene
    if (phase === 'FINISHED' && !this.transitionStarted) {
      this.raceFinished = true;
      this.transitionStarted = true;

      this.time.delayedCall(2000, () => {
        const results = this.raceManager.getResults();
        // Stop and get replay data
        this.recordedReplay = this.replayRecorder.stop();
        this.scene.start('ResultScene', { results, replayData: this.recordedReplay });
      });
    }
  }

  // ── Event handlers ────────────────────────────────────────────

  private onCountdownTick = (value: number): void => {
    const sm = this.getSoundManager();
    this.countdownText.setAlpha(1).setScale(1.5);

    if (value > 0) {
      this.countdownText.setText(value.toString());
      this.countdownText.setColor('#ffffff');
      sm?.play('countdown_tick');
    }

    // Scale bounce animation
    this.tweens.add({
      targets: this.countdownText,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Fade out
    this.tweens.add({
      targets: this.countdownText,
      alpha: 0,
      duration: 200,
      delay: 600,
    });
  };

  private onPhaseChange = (phase: string): void => {
    if (phase === 'RACING') {
      // Show "GO!" briefly
      this.countdownText.setText('GO!');
      this.countdownText.setColor('#22c55e');
      this.getSoundManager()?.play('countdown_go');
      this.countdownText.setAlpha(1).setScale(1.5);

      this.tweens.add({
        targets: this.countdownText,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut',
      });

      this.tweens.add({
        targets: this.countdownText,
        alpha: 0,
        duration: 300,
        delay: 600,
      });

      // Enable camera racing mode
      this.cameraManager.setRacing(true);
    }
  };

  private onMarbleFinish = (_marbleId: string): void => {
    this.getSoundManager()?.play('finish', { volume: 0.5 });
  };

  private onMarbleEliminate = (_marbleId: string): void => {
    this.getSoundManager()?.play('eliminate');
  };

  private onRaceFinishAll = (_results: RaceResult[]): void => {
    // Transition handled in update() loop
  };

  // ── Pause / Resume ────────────────────────────────────────────

  private togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.time.timeScale = 0;
      this.showPauseOverlay();
    } else {
      this.time.timeScale = 1;
      this.hidePauseOverlay();
    }
  }

  private showPauseOverlay(): void {
    const { width, height } = this.scale;

    this.pauseOverlay = this.add.container(0, 0).setDepth(500);

    const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
      .setInteractive();
    this.pauseOverlay.add(dimBg);

    const pauseText = this.add
      .text(width / 2, height / 2 - 60, '⏸ TẠM DỪNG', {
        fontSize: '42px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.pauseOverlay.add(pauseText);

    const resumeBtn = new Button(this, width / 2, height / 2 + 20, '▶ TIẾP TỤC', {
      onClick: () => this.togglePause(),
    });
    this.pauseOverlay.add(resumeBtn);

    const quitBtn = new Button(this, width / 2, height / 2 + 80, '🚪 THOÁT ĐUA', {
      width: 200,
      fontSize: 18,
      bgColor: 0xef4444,
      hoverColor: 0xdc2626,
      onClick: () => {
        this.time.timeScale = 1;
        this.scene.start('MenuScene');
      },
    });
    this.pauseOverlay.add(quitBtn);
  }

  private hidePauseOverlay(): void {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
  }

  // ── Sound helper ─────────────────────────────────────────────

  private getSoundManager(): SoundManager | undefined {
    return this.registry.get('soundManager') as SoundManager | undefined;
  }

  // ── Helper: collect all obstacle instances from track ────────

  private collectObstacles(): import('@/entities/obstacles/BaseObstacle').BaseObstacle[] {
    // Obstacles are created via the track's obstacle registry (if any).
    // For now, return an empty array — obstacles are instantiated
    // separately during track generation and should be collected here.
    // This hook ensures the CollisionSystem can register them.
    const obstacles: import('@/entities/obstacles/BaseObstacle').BaseObstacle[] = [];
    // TODO: When obstacle generation is wired into TrackGenerator,
    // collect them from this.raceManager.track or a dedicated registry.
    return obstacles;
  }

  // ── Cleanup ───────────────────────────────────────────────────

  private cleanup(): void {
    eventBus.off('race:countdown-tick', this.onCountdownTick);
    eventBus.off('race:phase-change', this.onPhaseChange);
    eventBus.off('race:marble-finish', this.onMarbleFinish);
    eventBus.off('race:marble-eliminate', this.onMarbleEliminate);
    eventBus.off('race:finish-all', this.onRaceFinishAll);

    this.events.off('booster-hit');
    this.events.off('marble-bounce');

    // Clear collision cooldowns
    CollisionSystem.clearCooldowns();

    this.hidePauseOverlay();

    if (this.particleManager) {
      this.particleManager.destroy();
    }
  }
}
