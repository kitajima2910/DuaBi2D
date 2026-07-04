export class PhysicsSystem {
    constructor(scene) {
        this.scene = scene;
        this.matterWorld = scene.matter.world;
        this.bodies = new Map();
        this.collisionCategories = this.setupCollisionCategories();
    }

    setupCollisionCategories() {
        return {
            MARBLE: 0x0001,
            GROUND: 0x0002,
            OBSTACLE: 0x0004,
            FINISH_LINE: 0x0008,
            POWER_UP: 0x0010
        };
    }

    addBody(key, body, options = {}) {
        this.bodies.set(key, {
            body,
            options: {
                isStatic: options.isStatic || false,
                friction: options.friction || 0.5,
                restitution: options.restitution || 0.3,
                density: options.density || 0.001,
                ...options
            }
        });

        this.applyPhysicsProperties(body, options);
        return body;
    }

    applyPhysicsProperties(body, options) {
        if (options.friction !== undefined) {
            body.friction = options.friction;
        }
        if (options.restitution !== undefined) {
            body.restitution = options.restitution;
        }
        if (options.density !== undefined) {
            body.density = options.density;
        }
    }

    removeBody(key) {
        const bodyData = this.bodies.get(key);
        if (bodyData) {
            this.matterWorld.remove(bodyData.body);
            this.bodies.delete(key);
        }
    }

    getBody(key) {
        return this.bodies.get(key)?.body;
    }

    applyForce(key, force) {
        const body = this.getBody(key);
        if (body) {
            this.matterWorld.applyForce(body, body.position, force);
        }
    }

    setVelocity(key, velocity) {
        const body = this.getBody(key);
        if (body) {
            body.velocity = velocity;
        }
    }

    getVelocity(key) {
        const body = this.getBody(key);
        return body ? body.velocity : null;
    }

    checkCollision(bodyA, bodyB) {
        return this.matterWorld.collides(bodyA, bodyB);
    }

    onCollision(callback) {
        this.matterWorld.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                callback(pair.bodyA, pair.bodyB);
            });
        });
    }

    update(time, delta) {
        // Cập nhật vật lý nếu cần
    }

    destroy() {
        this.bodies.clear();
    }
}
