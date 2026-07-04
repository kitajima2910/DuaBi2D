export class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.isInitialized = false;
        this.gameState = 'idle';
        this.settings = {
            maxMarbles: 8,
            raceLength: 2000,
            difficulty: 'normal'
        };
    }

    init() {
        this.isInitialized = true;
        this.gameState = 'initialized';
    }

    startGame(config = {}) {
        this.settings = { ...this.settings, ...config };
        this.gameState = 'playing';
        this.scene.events.emit('game-start', this.settings);
    }

    pauseGame() {
        this.gameState = 'paused';
        this.scene.events.emit('game-pause');
    }

    resumeGame() {
        this.gameState = 'playing';
        this.scene.events.emit('game-resume');
    }

    endGame(results) {
        this.gameState = 'ended';
        this.scene.events.emit('game-end', results);
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSetting(key, value) {
        this.settings[key] = value;
    }

    getState() {
        return this.gameState;
    }

    update(time, delta) {
        // Update game logic nếu cần
    }

    destroy() {
        this.isInitialized = false;
        this.gameState = 'idle';
    }
}
