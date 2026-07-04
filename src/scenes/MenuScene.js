export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.createBackground(width, height);
        this.createTitle(width, height);
        this.createPlayButton(width, height);
        this.createSettingsButton(width, height);
    }

    createBackground(width, height) {
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    }

    createTitle(width, height) {
        this.add.text(width / 2, height / 3, 'MARBLE RACE', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
    }

    createPlayButton(width, height) {
        const playBtn = this.add.text(width / 2, height / 2, '▶ PLAY', {
            fontSize: '36px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        playBtn.on('pointerover', () => {
            playBtn.setScale(1.1);
            playBtn.setColor('#ffff00');
        });

        playBtn.on('pointerout', () => {
            playBtn.setScale(1);
            playBtn.setColor('#00ff00');
        });

        playBtn.on('pointerdown', () => {
            this.scene.start('RaceScene');
        });
    }

    createSettingsButton(width, height) {
        const settingsBtn = this.add.text(width / 2, height / 2 + 80, '⚙ SETTINGS', {
            fontSize: '24px',
            color: '#888888'
        }).setOrigin(0.5).setInteractive();

        settingsBtn.on('pointerover', () => settingsBtn.setColor('#ffffff'));
        settingsBtn.on('pointerout', () => settingsBtn.setColor('#888888'));
        settingsBtn.on('pointerdown', () => {
            // Settings sẽ được thêm sau
        });
    }
}
