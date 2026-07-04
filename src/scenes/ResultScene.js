export class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    init(data) {
        this.raceResults = data.results || [];
        this.raceTime = data.time || 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.createBackground(width, height);
        this.createTitle(width, height);
        this.createResultsList(width, height);
        this.createButtons(width, height);
    }

    createBackground(width, height) {
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    }

    createTitle(width, height) {
        this.add.text(width / 2, 60, 'RACE RESULTS', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 110, `Time: ${this.formatTime(this.raceTime)}`, {
            fontSize: '24px',
            color: '#888888'
        }).setOrigin(0.5);
    }

    createResultsList(width, height) {
        const startY = 160;
        const itemHeight = 50;

        this.raceResults.forEach((result, index) => {
            const y = startY + index * itemHeight;
            
            // Huy chương
            const medal = this.getMedal(index);
            this.add.text(100, y, medal, {
                fontSize: '32px'
            }).setOrigin(0.5);

            // Tên marble
            this.add.text(150, y, result.name || `Marble ${index + 1}`, {
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            // Thời gian
            this.add.text(width - 100, y, this.formatTime(result.time), {
                fontSize: '20px',
                color: '#888888'
            }).setOrigin(1, 0.5);
        });
    }

    getMedal(index) {
        const medals = ['🥇', '🥈', '🥉'];
        return index < 3 ? medals[index] : `${index + 1}.`;
    }

    createButtons(width, height) {
        const buttonY = height - 80;

        // Nút Race Again
        const raceAgainBtn = this.add.text(width / 2 - 80, buttonY, '🔄 RACE AGAIN', {
            fontSize: '24px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        raceAgainBtn.on('pointerover', () => raceAgainBtn.setColor('#ffff00'));
        raceAgainBtn.on('pointerout', () => raceAgainBtn.setColor('#00ff00'));
        raceAgainBtn.on('pointerdown', () => {
            this.scene.start('RaceScene');
        });

        // Nút Menu
        const menuBtn = this.add.text(width / 2 + 80, buttonY, '🏠 MENU', {
            fontSize: '24px',
            color: '#888888'
        }).setOrigin(0.5).setInteractive();

        menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
        menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}
