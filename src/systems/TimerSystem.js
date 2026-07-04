/**
 * TimerSystem — Countdown 3 → 2 → 1 → GO bằng delta time
 * Không dùng setTimeout.
 */
export class TimerSystem {
    constructor(scene) {
        this.scene = scene;

        /** Thời lượng mỗi tick (ms) */
        this.tickDuration = 1000;

        /** Countdown sequence */
        this.countdownSteps = [3, 2, 1, 'GO'];
        this.currentStepIndex = 0;

        /** Accumulator delta time */
        this.accumulator = 0;

        /** Trạng thái */
        this.isCountingDown = false;
        this.isFinished = false;
    }

    /**
     * Bắt đầu countdown từ 3 → 2 → 1 → GO
     */
    startCountdown() {
        this.currentStepIndex = 0;
        this.accumulator = 0;
        this.isCountingDown = true;
        this.isFinished = false;

        // Phát step đầu tiên ngay lập tức
        this._emitCurrentStep();
    }

    /**
     * Dừng countdown
     */
    stop() {
        this.isCountingDown = false;
    }

    /**
     * Reset timer về trạng thái ban đầu
     */
    reset() {
        this.currentStepIndex = 0;
        this.accumulator = 0;
        this.isCountingDown = false;
        this.isFinished = false;
    }

    /**
     * Lấy giá trị hiển thị hiện tại (số hoặc 'GO')
     */
    getCurrentDisplay() {
        if (this.isFinished) return null;
        return this.countdownSteps[this.currentStepIndex] ?? null;
    }

    // ─── internal ───

    _emitCurrentStep() {
        const value = this.countdownSteps[this.currentStepIndex];
        this.scene.events.emit('countdown-tick', value);
    }

    _advance() {
        this.currentStepIndex++;
        if (this.currentStepIndex >= this.countdownSteps.length) {
            // Countdown xong
            this.isCountingDown = false;
            this.isFinished = true;
            this.scene.events.emit('countdown-complete');
            return;
        }
        this._emitCurrentStep();
    }

    // ─── lifecycle ───

    update(_time, delta) {
        if (!this.isCountingDown) return;

        this.accumulator += delta;

        while (this.accumulator >= this.tickDuration && this.isCountingDown) {
            this.accumulator -= this.tickDuration;
            this._advance();
        }
    }

    destroy() {
        this.reset();
    }
}
