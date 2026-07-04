export class SpawnSystem {
    constructor(scene) {
        this.scene = scene;
        this.spawnPoints = [];
        this.activeObjects = [];
        this.maxObjects = 100;
    }

    addSpawnPoint(x, y, options = {}) {
        this.spawnPoints.push({
            x,
            y,
            options: {
                type: options.type || 'marble',
                color: options.color || 0x00ff00,
                size: options.size || 20,
                ...options
            }
        });
    }

    removeSpawnPoint(index) {
        this.spawnPoints.splice(index, 1);
    }

    spawnAtPoint(index, customOptions = {}) {
        const spawnPoint = this.spawnPoints[index];
        if (!spawnPoint) return null;

        const options = { ...spawnPoint.options, ...customOptions };
        return this.spawn(spawnPoint.x, spawnPoint.y, options);
    }

    spawn(x, y, options = {}) {
        if (this.activeObjects.length >= this.maxObjects) {
            console.warn('Max objects reached');
            return null;
        }

        const config = {
            type: 'marble',
            color: 0x00ff00,
            size: 20,
            ...options
        };

        let object;

        switch (config.type) {
            case 'marble':
                object = this.spawnMarble(x, y, config);
                break;
            case 'obstacle':
                object = this.spawnObstacle(x, y, config);
                break;
            case 'powerup':
                object = this.spawnPowerUp(x, y, config);
                break;
            default:
                object = this.spawnMarble(x, y, config);
        }

        if (object) {
            this.activeObjects.push(object);
        }

        return object;
    }

    spawnMarble(x, y, config) {
        const marble = this.scene.matter.add.circle(x, y, config.size, {
            restitution: 0.8,
            friction: 0.3,
            density: 0.001
        });

        return {
            body: marble,
            type: 'marble',
            color: config.color,
            size: config.size,
            id: `marble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    spawnObstacle(x, y, config) {
        const obstacle = this.scene.matter.add.rectangle(x, y, config.width || 100, config.height || 20, {
            isStatic: true,
            friction: 0.5
        });

        return {
            body: obstacle,
            type: 'obstacle',
            width: config.width || 100,
            height: config.height || 20
        };
    }

    spawnPowerUp(x, y, config) {
        const powerup = this.scene.matter.add.circle(x, y, config.size || 15, {
            isStatic: true,
            isSensor: true
        });

        return {
            body: powerup,
            type: 'powerup',
            effect: config.effect || 'speed',
            size: config.size || 15
        };
    }

    despawn(object) {
        const index = this.activeObjects.indexOf(object);
        if (index !== -1) {
            this.scene.matter.world.remove(object.body);
            this.activeObjects.splice(index, 1);
        }
    }

    despawnAll() {
        this.activeObjects.forEach(obj => {
            this.scene.matter.world.remove(obj.body);
        });
        this.activeObjects = [];
    }

    getActiveObjects(type = null) {
        if (type) {
            return this.activeObjects.filter(obj => obj.type === type);
        }
        return this.activeObjects;
    }

    update(time, delta) {
        // Cleanup objects nếu cần
    }

    destroy() {
        this.despawnAll();
        this.spawnPoints = [];
    }
}
