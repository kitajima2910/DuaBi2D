import { teams } from '../data/teams.js';

/**
 * SpawnSystem — Đọc dữ liệu từ teams.js, tạo marble + Gate
 *
 * Marble: Matter Body tròn, id, country, sprite, spawnIndex + graphics
 * Gate:   Static body có API open() / close() + visual
 */
export class SpawnSystem {
    constructor(scene) {
        this.scene = scene;

        /** @type {Array<{id, country, color, sprite, spawnIndex, body, graphics}>} */
        this.marbles = [];

        /** Gate object */
        this.gate = null;

        /** Vị trí spawn mặc định */
        this.spawnOrigin = { x: 150, y: 300 };
        this.marbleRadius = 14;
        this.marbleGap = 38;
        this.gateWidth = 12;
        this.gateHeight = 340;  // đủ cao chặn 8 marble (7 * 38 + padding)
    }

    // ────────────────── MARBLE ──────────────────

    /**
     * Đọc teams.js → tạo toàn bộ marble (body + visual), lưu vào this.marbles
     */
    spawnAllMarbles() {
        this.marbles = [];

        teams.forEach((team, index) => {
            const x = this.spawnOrigin.x;
            const y = this.spawnOrigin.y + index * this.marbleGap - ((teams.length - 1) * this.marbleGap) / 2;

            // Matter Body
            const body = this.scene.matter.add.circle(x, y, this.marbleRadius, {
                restitution: 0.6,
                friction: 0.1,
                density: 0.002,
                frictionAir: 0.01,
                label: `marble_${team.id}`,
            });

            // Graphics — vẽ marble tròn có màu + viền + label flag
            const graphics = this.scene.add.graphics();
            this._drawMarble(graphics, x, y, team.color);

            // Flag sprite text trên marble
            const flag = this.scene.add.text(x, y, team.sprite, {
                fontSize: '12px',
            }).setOrigin(0.5);

            const marble = {
                id: team.id,
                country: team.country,
                color: team.color,
                sprite: team.sprite,
                spawnIndex: index,
                body,
                graphics,
                flag,
            };

            this.marbles.push(marble);
        });

        return this.marbles;
    }

    _drawMarble(graphics, x, y, color) {
        graphics.clear();
        // Shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillCircle(x + 2, y + 2, this.marbleRadius);
        // Body
        graphics.fillStyle(color, 1);
        graphics.fillCircle(x, y, this.marbleRadius);
        // Highlight
        graphics.fillStyle(0xffffff, 0.35);
        graphics.fillCircle(x - 3, y - 3, this.marbleRadius * 0.4);
        // Viền
        graphics.lineStyle(2, 0xffffff, 0.8);
        graphics.strokeCircle(x, y, this.marbleRadius);
    }

    // ────────────────── GATE ──────────────────

    /**
     * Tạo Gate — static body + visual ngay trước mặt các marble
     */
    spawnGate() {
        const x = this.spawnOrigin.x + this.marbleRadius + this.gateWidth + 4;
        const centerY = this.spawnOrigin.y;

        const body = this.scene.matter.add.rectangle(x, centerY, this.gateWidth, this.gateHeight, {
            isStatic: true,
            friction: 0.8,
            restitution: 0,
            label: 'gate',
        });

        // Visual — vẽ cổng
        const graphics = this.scene.add.graphics();
        this._drawGate(graphics, x, centerY, false);

        this.gate = {
            body,
            graphics,
            isOpen: false,
        };

        return this.gate;
    }

    _drawGate(graphics, x, y, isOpen) {
        graphics.clear();
        const hw = this.gateWidth / 2;
        const hh = this.gateHeight / 2;
        const color = isOpen ? 0x00ff00 : 0xff4444;

        // Cột trái
        graphics.fillStyle(color, 0.9);
        graphics.fillRect(x - hw - 6, y - hh, 6, this.gateHeight);
        // Cột phải
        graphics.fillRect(x + hw, y - hh, 6, this.gateHeight);
        // Thanh ngang
        if (!isOpen) {
            graphics.fillStyle(0xcccccc, 0.9);
            graphics.fillRect(x - hw - 6, y - 3, this.gateWidth + 12, 6);
        }
    }

    /**
     * Mở gate → marble được thả
     */
    openGate() {
        if (!this.gate || this.gate.isOpen) return;
        this.gate.isOpen = true;
        this.gate.body.isSensor = true;
        this._drawGate(this.gate.graphics, this.gate.body.position.x, this.gate.body.position.y, true);
    }

    /**
     * Đóng gate → giữ marble lại
     */
    closeGate() {
        if (!this.gate || !this.gate.isOpen) return;
        this.gate.isOpen = false;
        this.gate.body.isSensor = false;
        this._drawGate(this.gate.graphics, this.gate.body.position.x, this.gate.body.position.y, false);
    }

    // ────────────────── HELPERS ──────────────────

    getMarble(id) {
        return this.marbles.find(m => m.id === id);
    }

    getMarbleList() {
        return this.marbles.map(m => ({
            id: m.id,
            country: m.country,
            color: m.color,
            sprite: m.sprite,
            spawnIndex: m.spawnIndex,
        }));
    }

    // ────────────────── LIFECYCLE ──────────────────

    update(_time, _delta) {
        // Cập nhật visual theo body vật lý
        this.marbles.forEach(m => {
            if (m.body && m.graphics) {
                const { x, y } = m.body.position;
                this._drawMarble(m.graphics, x, y, m.color);
                if (m.flag) m.flag.setPosition(x, y);
            }
        });
    }

    destroy() {
        this.marbles.forEach(m => {
            if (m.body) this.scene.matter.world.remove(m.body);
            if (m.graphics) m.graphics.destroy();
            if (m.flag) m.flag.destroy();
        });
        this.marbles = [];

        if (this.gate) {
            if (this.gate.body) this.scene.matter.world.remove(this.gate.body);
            if (this.gate.graphics) this.gate.graphics.destroy();
        }
        this.gate = null;
    }
}
