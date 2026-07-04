export class Marble {
    constructor(scene, x, y, config = {}) {
        this.scene = scene;
        this.id = `marble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name || `Marble ${Math.floor(Math.random() * 1000)}`;
        this.color = config.color || Phaser.Display.Color.RandomRGB().color;
        this.size = config.size || 20;
        
        this.body = null;
        this.graphics = null;
        
        this.stats = {
            speed: config.speed || 5,
            friction: config.friction || 0.3,
            bounciness: config.bounciness || 0.8
        };
        
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.isFinished = false;
        this.finishTime = null;
        
        this.create(x, y);
    }

    create(x, y) {
        // Tạo body vật lý
        this.body = this.scene.matter.add.circle(x, y, this.size, {
            restitution: this.stats.bounciness,
            friction: this.stats.friction,
            density: 0.001
        });

        // Tạo visual
        this.graphics = this.scene.add.graphics();
        this.draw();
    }

    draw() {
        if (!this.graphics) return;
        
        this.graphics.clear();
        this.graphics.fillStyle(this.color, 1);
        this.graphics.fillCircle(this.position.x, this.position.y, this.size);
        
        // Viền
        this.graphics.lineStyle(2, 0xffffff, 1);
        this.graphics.strokeCircle(this.position.x, this.position.y, this.size);
    }

    update(time, delta) {
        if (this.isFinished) return;

        // Cập nhật vị trí từ body vật lý
        if (this.body) {
            this.position.x = this.body.position.x;
            this.position.y = this.body.position.y;
            this.velocity.x = this.body.velocity.x;
            this.velocity.y = this.body.velocity.y;
        }

        this.draw();
    }

    applyForce(force) {
        if (this.body) {
            this.scene.matter.world.applyForce(this.body, this.body.position, force);
        }
    }

    setVelocity(x, y) {
        if (this.body) {
            this.body.velocity = { x, y };
        }
    }

    setPosition(x, y) {
        if (this.body) {
            this.scene.matter.world.remove(this.body);
            this.body = this.scene.matter.add.circle(x, y, this.size, {
                restitution: this.stats.bounciness,
                friction: this.stats.friction,
                density: 0.001
            });
        }
        this.position.x = x;
        this.position.y = y;
    }

    finish(time) {
        this.isFinished = true;
        this.finishTime = time;
    }

    reset() {
        this.isFinished = false;
        this.finishTime = null;
        this.velocity = { x: 0, y: 0 };
    }

    destroy() {
        if (this.body) {
            this.scene.matter.world.remove(this.body);
        }
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}
