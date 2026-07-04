import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { RaceSystem } from '../systems/RaceSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { UISystem } from '../systems/UISystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { RankingSystem } from '../systems/RankingSystem.js';
import { TimerSystem } from '../systems/TimerSystem.js';

/**
 * RaceScene — Chỉ khởi tạo Systems, spawn marble, spawn gate,
 * bắt đầu countdown. Không chứa logic gameplay.
 */
export class RaceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RaceScene' });
    }

    init() {
        this.systems = {};
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Khởi tạo systems
        this._initSystems();

        // 2. Setup Matter world
        this._setupWorld(width, height);

        // 3. Spawn marble + gate
        this.systems.spawn.spawnAllMarbles();
        this.systems.spawn.spawnGate();

        // 4. Setup UI layer
        this.systems.ui.createUI();

        // 5. Lắng nghe countdown xong → mở gate, bắt đầu chạy
        this._bindRaceFlow();

        // 6. Bắt đầu countdown
        this.systems.race.startCountdown();
        this.systems.timer.startCountdown();
    }

    // ────────────────── PRIVATE ──────────────────

    _initSystems() {
        this.systems.physics  = new PhysicsSystem(this);
        this.systems.race     = new RaceSystem(this);
        this.systems.camera   = new CameraSystem(this);
        this.systems.ui       = new UISystem(this);
        this.systems.spawn    = new SpawnSystem(this);
        this.systems.ranking  = new RankingSystem(this);
        this.systems.timer    = new TimerSystem(this);
    }

    _setupWorld(width, height) {
        this.matter.world.setBounds(0, 0, width * 3, height * 2);

        // Ground
        this.matter.add.rectangle(width / 2, height - 25, width * 3, 50, {
            isStatic: true,
            friction: 0.8,
            restitution: 0.3,
        });
    }

    /**
     * Khi countdown hoàn tất:
     *  1. RaceSystem → RUNNING
     *  2. SpawnSystem → mở gate, marble bắt đầu chạy
     */
    _bindRaceFlow() {
        this.events.once('countdown-complete', () => {
            this.systems.race.startRunning();
            this.systems.spawn.openGate();
        });
    }

    // ────────────────── UPDATE / SHUTDOWN ──────────────────

    update(time, delta) {
        Object.values(this.systems).forEach(system => {
            if (system.update) system.update(time, delta);
        });
    }

    shutdown() {
        Object.values(this.systems).forEach(system => {
            if (system.destroy) system.destroy();
        });
        this.systems = {};
    }
}
