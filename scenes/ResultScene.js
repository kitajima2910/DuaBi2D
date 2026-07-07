export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0f3460');

    this.add.text(width / 2, height * 0.35, 'Kết quả — Placeholder', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '40px',
      color: '#e0e0e0',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Back to menu button
    const btn = this.add.text(width / 2, height * 0.65, 'VỀ MENU', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
      backgroundColor: '#533483',
      padding: { x: 28, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#e94560' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#533483' }));

    btn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
