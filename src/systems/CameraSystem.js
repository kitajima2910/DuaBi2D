export class CameraSystem {
    constructor(scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;
        this.target = null;
        this.offset = { x: 0, y: 0 };
        this.smoothing = 0.1;
        this.bounds = null;
    }

    setTarget(target) {
        this.target = target;
    }

    setBounds(x, y, width, height) {
        this.bounds = { x, y, width, height };
        this.camera.setBounds(x, y, width, height);
    }

    setSmoothing(smoothing) {
        this.smoothing = smoothing;
    }

    follow(target, offset = { x: 0, y: 0 }) {
        this.target = target;
        this.offset = offset;
    }

    update(time, delta) {
        if (!this.target) return;

        const targetX = this.target.x + this.offset.x;
        const targetY = this.target.y + this.offset.y;

        // Smooth camera follow
        this.camera.scrollX += (targetX - this.camera.width / 2 - this.camera.scrollX) * this.smoothing;
        this.camera.scrollY += (targetY - this.camera.height / 2 - this.camera.scrollY) * this.smoothing;

        // Apply bounds
        if (this.bounds) {
            this.camera.scrollX = Phaser.Math.Clamp(
                this.camera.scrollX,
                this.bounds.x,
                this.bounds.x + this.bounds.width - this.camera.width
            );
            this.camera.scrollY = Phaser.Math.Clamp(
                this.camera.scrollY,
                this.bounds.y,
                this.bounds.y + this.bounds.height - this.camera.height
            );
        }
    }

    shake(duration, intensity) {
        this.camera.shake(duration, intensity);
    }

    flash(duration, r, g, b) {
        this.camera.flash(duration, r, g, b);
    }

    fadeIn(duration, r, g, b) {
        this.camera.fadeIn(duration, r, g, b);
    }

    fadeOut(duration, r, g, b) {
        this.camera.fadeOut(duration, r, g, b);
    }

    destroy() {
        this.target = null;
        this.bounds = null;
    }
}
