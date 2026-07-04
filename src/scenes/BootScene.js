export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.createLoadingBar();
        this.loadAssets();
        this.loadFont();
    }

    create() {
        // Đợi font load xong
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }

    loadFont() {
        // Đợi Google Fonts load
        document.fonts.ready.then(() => {
            this.loadingText.setText('Sẵn sàng!');
            this.loadingText.setFontFamily('Creepster, cursive');
        });
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.loadingBar = this.add.rectangle(width / 2, height / 2, 0, 20, 0x00ff00);
        this.loadingText = this.add.text(width / 2, height / 2 - 30, 'Đang tải...', {
            fontSize: '24px',
            fontFamily: 'Creepster, cursive',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            this.loadingBar.width = 300 * value;
        });

        this.load.on('complete', () => {
            this.loadingText.setText('Sẵn sàng!');
        });
    }

    loadAssets() {
        // Tải assets cơ bản cho marble race
        // Sẽ được mở rộng khi có assets thật
    }
}
