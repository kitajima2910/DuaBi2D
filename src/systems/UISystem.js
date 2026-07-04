/**
 * UISystem — Hiển thị countdown ở giữa màn hình, tự ẩn
 *
 * Lắng nghe:
 *   'countdown-tick'      → value (number | 'GO')
 *   'countdown-complete'  → ẩn countdown
 */
export class UISystem {
    constructor(scene) {
        this.scene = scene;
        this.elements = new Map();

        /** Countdown text ở giữa màn hình */
        this.countdownText = null;

        this._bindEvents();
    }

    // ────────────────── SETUP ──────────────────

    /**
     * Khởi tạo UI layer — gọi 1 lần khi scene create
     */
    createUI() {
        const { width, height } = this.scene.cameras.main;

        this.countdownText = this.scene.add.text(width / 2, height / 2, '', {
            fontSize: '96px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: 'rgba(0,0,0,0.5)',
                blur: 8,
                fill: true,
            },
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000)
            .setVisible(false);

        this.elements.set('countdown', this.countdownText);
    }

    // ────────────────── COUNTDOWN ──────────────────

    /**
     * Hiển thị 1 giá trị countdown rồi tween ẩn
     */
    showCountdown(value) {
        if (!this.countdownText) return;

        const label = value === 'GO' ? 'GO!' : String(value);
        const color = value === 'GO' ? '#00ff00' : '#ffffff';

        this.countdownText
            .setText(label)
            .setColor(color)
            .setAlpha(1)
            .setScale(1.6)
            .setVisible(true);

        // Tween: scale down → normal, rồi fade out
        this.scene.tweens.add({
            targets: this.countdownText,
            scaleX: 1,
            scaleY: 1,
            alpha: 0,
            duration: 900,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.countdownText.setVisible(false);
            },
        });
    }

    /**
     Ẩn countdown (khi hoàn tất)
     */
    hideCountdown() {
        if (this.countdownText) {
            this.scene.tweens.killTweensOf(this.countdownText);
            this.countdownText.setVisible(false);
        }
    }

    // ────────────────── GENERIC ELEMENT API ──────────────────

    createText(key, x, y, text, style = {}) {
        const defaultStyle = {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
        };
        const textObject = this.scene.add.text(x, y, text, { ...defaultStyle, ...style });
        this.elements.set(key, textObject);
        return textObject;
    }

    updateText(key, text) {
        const el = this.elements.get(key);
        if (el?.setText) el.setText(text);
    }

    showElement(key) {
        this.elements.get(key)?.setVisible(true);
    }

    hideElement(key) {
        this.elements.get(key)?.setVisible(false);
    }

    removeElement(key) {
        const el = this.elements.get(key);
        if (el) {
            el.destroy();
            this.elements.delete(key);
        }
    }

    // ────────────────── EVENT BINDING ──────────────────

    _bindEvents() {
        this.scene.events.on('countdown-tick', (value) => {
            this.showCountdown(value);
        });

        this.scene.events.on('countdown-complete', () => {
            // GO! đã hiển thị bởi tick cuối, sau đó tự ẩn
        });
    }

    // ────────────────── LIFECYCLE ──────────────────

    update(_time, _delta) {
        // UI tweens tự chạy qua Phaser tween manager
    }

    destroy() {
        this.scene.events.off('countdown-tick');
        this.scene.events.off('countdown-complete');

        this.elements.forEach(el => el.destroy());
        this.elements.clear();
        this.countdownText = null;
    }
}
