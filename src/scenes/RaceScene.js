import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { RaceSystem } from '../systems/RaceSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { UISystem } from '../systems/UISystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { RankingSystem } from '../systems/RankingSystem.js';
import { TimerSystem } from '../systems/TimerSystem.js';

export class RaceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RaceScene' });
    }

    init() {
        this.systems = {};
        this.isInitialized = false;
    }

    create() {
        this.initializeSystems();
        this.setupMatterWorld();
        this.createEventListeners();
        this.isInitialized = true;
    }

    initializeSystems() {
        this.systems.physics = new PhysicsSystem(this);
        this.systems.race = new RaceSystem(this);
        this.systems.camera = new CameraSystem(this);
        this.systems.ui = new UISystem(this);
        this.systems.spawn = new SpawnSystem(this);
        this.systems.ranking = new RankingSystem(this);
        this.systems.timer = new TimerSystem(this);
    }

    setupMatterWorld() {
        const { width, height } = this.cameras.main;
        
        // Thiết lập Matter World cơ bản
        this.matter.world.setBounds(0, 0, width * 3, height * 2);
        
        // Tạo ground cơ bản
        this.createGround(width, height);
    }

    createGround(width, height) {
        const ground = this.matter.add.rectangle(width / 2, height - 25, width * 3, 50, {
            isStatic: true,
            friction: 0.8,
            restitution: 0.3
        });
        
        this.ground = ground;
    }

    createEventListeners() {
        // Lắng nghe sự kiện từ systems
        this.events.on('race-start', this.onRaceStart, this);
        this.events.on('race-end', this.onRaceEnd, this);
        this.events.on('marble-finish', this.onMarbleFinish, this);
    }

    onRaceStart() {
        console.log('Race started!');
    }

    onRaceEnd() {
        console.log('Race ended!');
    }

    onMarbleFinish(marbleData) {
        console.log('Marble finished:', marbleData);
    }

    update(time, delta) {
        if (!this.isInitialized) return;

        // Update tất cả systems
        Object.values(this.systems).forEach(system => {
            if (system.update) {
                system.update(time, delta);
            }
        });
    }

    shutdown() {
        // Cleanup khi scene kết thúc
        this.events.off('race-start');
        this.events.off('race-end');
        this.events.off('marble-finish');
        
        Object.values(this.systems).forEach(system => {
            if (system.destroy) {
                system.destroy();
            }
        });
    }
}
