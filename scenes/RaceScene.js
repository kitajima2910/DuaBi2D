export class RaceScene extends Phaser.Scene {
  constructor() {
    super('RaceScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#16213e');

    this.add.text(width / 2, height / 2, 'RaceScene — Đang phát triển', {
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
