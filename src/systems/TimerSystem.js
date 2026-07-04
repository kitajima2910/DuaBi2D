export class TimerSystem {
    constructor(scene) {
        this.scene = scene;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.laps = [];
        this.currentLap = 0;
    }

    start() {
        this.startTime = this.scene.time.now;
        this.isRunning = true;
        this.elapsedTime = 0;
    }

    stop() {
        this.isRunning = false;
    }

    reset() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.laps = [];
        this.currentLap = 0;
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
    }

    lap() {
        if (!this.isRunning) return null;

        const lapTime = this.elapsedTime;
        this.laps.push(lapTime);
        this.currentLap++;
        return lapTime;
    }

    getElapsedTime() {
        if (!this.isRunning) return this.elapsedTime;
        return this.scene.time.now - this.startTime;
    }

    getCurrentLapTime() {
        if (this.laps.length === 0) {
            return this.getElapsedTime();
        }
        return this.getElapsedTime() - this.laps[this.laps.length - 1];
    }

    getBestLap() {
        if (this.laps.length === 0) return null;
        return Math.min(...this.laps);
    }

    getWorstLap() {
        if (this.laps.length === 0) return null;
        return Math.max(...this.laps);
    }

    getAverageLap() {
        if (this.laps.length === 0) return null;
        const total = this.laps.reduce((sum, lap) => sum + lap, 0);
        return total / this.laps.length;
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }

    formatTimeShort(ms) {
        const seconds = Math.floor(ms / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);

        return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
    }

    update(time, delta) {
        if (this.isRunning) {
            this.elapsedTime = time - this.startTime;
        }
    }

    destroy() {
        this.reset();
    }
}
