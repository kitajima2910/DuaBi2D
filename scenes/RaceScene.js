import { CountrySystem } from '../systems/CountrySystem.js';
import { RaceSystem } from '../systems/RaceSystem.js';
import { EventBus } from '../systems/EventBus.js';
import { MarbleRenderer } from '../systems/MarbleRenderer.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { TrackLoader } from '../systems/TrackLoader.js';
import { TrackSystem } from '../systems/TrackSystem.js';
import { CountdownSystem } from '../systems/CountdownSystem.js';
import { FinishDetectionSystem } from '../systems/FinishDetectionSystem.js';
import { RankingSystem } from '../systems/RankingSystem.js';

export class RaceScene extends Phaser.Scene {
  constructor() {
    super('RaceScene');
  }

  async create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#16213e');

    // ── Initialize systems ──────────────────────────────────
    this.eventBus = new EventBus();
    this.countrySystem = new CountrySystem();
    await this.countrySystem.init();
    this.rankingSystem = new RankingSystem();
    this.raceSystem = new RaceSystem(this.eventBus, this.rankingSystem);

    // ── Track system ───────────────────────────────────────
    this.trackLoader = new TrackLoader();
    await this.trackLoader.init();
    this.trackSystem = new TrackSystem(this, this.trackLoader.getTrack(0));
    this.trackSystem.build();

    // ── Systems: renderer, physics, spawn ───────────────────
    this.marbleRenderer = new MarbleRenderer(this);
    this.physicsSystem = new PhysicsSystem(this, this.eventBus);
    this.physicsSystem.setRenderer(this.marbleRenderer);
    this.spawnSystem = new SpawnSystem(this.marbleRenderer, this.physicsSystem);

    // ── Race systems: countdown + finish detection ──────────
    this.countdownSystem = new CountdownSystem(this.physicsSystem, this.eventBus);
    this.finishDetectionSystem = new FinishDetectionSystem(this.eventBus, this.rankingSystem);

    // ── Create & start first race ───────────────────────────
    const marbles = this.countrySystem.getRandomMarbles(4);
    this.raceSystem.createRace(marbles);
    this.spawnSystem.spawn(marbles, width, height);
    this.raceSystem.startCountdown();

    // ── Countdown UI: large centered text ─────────────────────
    const countdownText = this.add.text(width / 2, height / 2 - 40, '3', {
      fontSize: '96px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(100);
    this.eventBus.on('countdown:tick', ({ value, index }) => {
      countdownText.setText(String(value));
      // Scale pop animation
      countdownText.setScale(1.4);
      this.tweens.add({
        targets: countdownText,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut',
      });
      if (value === 'GO!') {
        // Fade out after a short display
        this.tweens.add({
          targets: countdownText,
          alpha: 0,
          duration: 600,
          delay: 400,
          ease: 'Power2',
        });
      }
    });

    // Countdown → unlocks marbles → RUNNING → activate finish detection
    this.countdownSystem.start(marbles, () => {
      this.raceSystem.startRace();
      this.finishDetectionSystem.activate();
    });

    // ESC or click → back to MenuScene
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
    this.input.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  update() {
    this.physicsSystem?.update();
  }
}
