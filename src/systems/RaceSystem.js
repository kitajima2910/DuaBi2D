/**
 * RaceSystem — Chỉ quản lý 3 trạng thái đua:
 *   IDLE → COUNTDOWN → RUNNING
 */
export const RaceState = Object.freeze({
    IDLE:      'IDLE',
    COUNTDOWN: 'COUNTDOWN',
    RUNNING:   'RUNNING',
});

export class RaceSystem {
    constructor(scene) {
        this.scene = scene;
        this.state = RaceState.IDLE;
    }

    /** Chuyển sang COUNTDOWN */
    startCountdown() {
        if (this.state !== RaceState.IDLE) return;
        this.state = RaceState.COUNTDOWN;
        this.scene.events.emit('race-state-change', this.state);
    }

    /** Chuyển sang RUNNING (gate mở, marble chạy) */
    startRunning() {
        if (this.state !== RaceState.COUNTDOWN) return;
        this.state = RaceState.RUNNING;
        this.scene.events.emit('race-state-change', this.state);
        this.scene.events.emit('race-start');
    }

    /** Reset về IDLE */
    reset() {
        this.state = RaceState.IDLE;
        this.scene.events.emit('race-state-change', this.state);
    }

    /** Kiểm tra trạng thái */
    isIdle()      { return this.state === RaceState.IDLE; }
    isCountdown() { return this.state === RaceState.COUNTDOWN; }
    isRunning()   { return this.state === RaceState.RUNNING; }

    update(_time, _delta) {
        // State machine — logic chuyển state do TimerSystem / Scene điều phối
    }

    destroy() {
        this.state = RaceState.IDLE;
    }
}
