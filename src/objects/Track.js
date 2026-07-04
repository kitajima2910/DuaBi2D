export class Track {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.width = config.width || 2400;
        this.height = config.height || 600;
        this.segments = [];
        this.obstacles = [];
        this.finishLine = null;
        
        this.create();
    }

    create() {
        this.createBackground();
        this.createGround();
        this.createWalls();
        this.createFinishLine();
    }

    createBackground() {
        // Nền đơn giản
        this.scene.add.rectangle(
            this.width / 2, 
            this.height / 2, 
            this.width, 
            this.height, 
            0x2a2a4a
        );
    }

    createGround() {
        const ground = this.scene.matter.add.rectangle(
            this.width / 2, 
            this.height - 25, 
            this.width, 
            50, 
            {
                isStatic: true,
                friction: 0.8,
                restitution: 0.3
            }
        );
        this.segments.push(ground);
    }

    createWalls() {
        // Tường trên
        const topWall = this.scene.matter.add.rectangle(
            this.width / 2, 
            25, 
            this.width, 
            50, 
            { isStatic: true }
        );
        this.segments.push(topWall);

        // Tường trái
        const leftWall = this.scene.matter.add.rectangle(
            25, 
            this.height / 2, 
            50, 
            this.height, 
            { isStatic: true }
        );
        this.segments.push(leftWall);

        // Tường phải
        const rightWall = this.scene.matter.add.rectangle(
            this.width - 25, 
            this.height / 2, 
            50, 
            this.height, 
            { isStatic: true }
        );
        this.segments.push(rightWall);
    }

    createFinishLine() {
        this.finishLine = {
            x: this.width - 100,
            y: this.height - 75,
            width: 20,
            height: 50
        };

        // Vẽ finish line
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(
            this.finishLine.x - this.finishLine.width / 2,
            this.finishLine.y - this.finishLine.height / 2,
            this.finishLine.width,
            this.finishLine.height
        );
    }

    addObstacle(x, y, width, height, angle = 0) {
        const obstacle = this.scene.matter.add.rectangle(x, y, width, height, {
            isStatic: true,
            friction: 0.5,
            angle: Phaser.Math.DegToRad(angle)
        });
        this.obstacles.push(obstacle);
        return obstacle;
    }

    addPlatform(x, y, width, angle = 0) {
        const platform = this.scene.matter.add.rectangle(x, y, width, 20, {
            isStatic: true,
            friction: 0.6,
            angle: Phaser.Math.DegToRad(angle)
        });
        this.segments.push(platform);
        return platform;
    }

    getSpawnPoint() {
        return { x: 100, y: this.height - 100 };
    }

    getFinishLine() {
        return this.finishLine;
    }

    update(time, delta) {
        // Update track nếu cần
    }

    destroy() {
        this.segments = [];
        this.obstacles = [];
    }
}
