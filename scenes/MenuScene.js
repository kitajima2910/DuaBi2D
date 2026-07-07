export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(width / 2, height * 0.3, 'ĐUA XE 2D', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Start button
    const btn = this.add.text(width / 2, height * 0.6, '▶ BẮT ĐẦU', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      backgroundColor: '#2ecc71',
      padding: { x: 32, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Hover effects
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#f1c40f' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#2ecc71' }));

    // Click → RaceScene
    btn.on('pointerdown', () => {
      this.scene.start('RaceScene');
    });
  }
}
