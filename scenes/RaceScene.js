import { CountrySystem } from '../systems/CountrySystem.js';
import { RaceSystem } from '../systems/RaceSystem.js';
import { EventBus } from '../systems/EventBus.js';
import { MarbleRenderer } from '../systems/MarbleRenderer.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';

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
    this.raceSystem = new RaceSystem(this.eventBus);

    // ── Create first race ───────────────────────────────────
    const marbles = this.countrySystem.getRandomMarbles(4);
    this.raceSystem.createRace(marbles);
    this.raceSystem.startCountdown();

    // ── Systems: renderer, physics, spawn ───────────────────
    this.marbleRenderer = new MarbleRenderer(this);
    this.physicsSystem = new PhysicsSystem(this, this.eventBus);
    this.physicsSystem.setRenderer(this.marbleRenderer);
    this.spawnSystem = new SpawnSystem(this.marbleRenderer, this.physicsSystem);
    this.spawnSystem.spawn(marbles, width, height);

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
