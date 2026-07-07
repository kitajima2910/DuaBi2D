import { CountrySystem } from '../systems/CountrySystem.js';
import { RaceSystem } from '../systems/RaceSystem.js';
import { EventBus } from '../systems/EventBus.js';

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

    // ── UI placeholder ──────────────────────────────────────
    this.add.text(width / 2, height / 2, 'RaceScene — Đã khởi tạo hệ thống', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    // ESC or click → back to MenuScene
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
    this.input.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
