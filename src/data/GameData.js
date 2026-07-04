export const GameData = {
    marble: {
        defaultSize: 20,
        defaultSpeed: 5,
        defaultFriction: 0.3,
        defaultBounciness: 0.8,
        colors: [
            0xff0000, // Đỏ
            0x00ff00, // Xanh lá
            0x0000ff, // Xanh dương
            0xffff00, // Vàng
            0xff00ff, // Tím
            0x00ffff, // Cyan
            0xff8800, // Cam
            0x8800ff  // Tím đậm
        ]
    },

    track: {
        defaultWidth: 2400,
        defaultHeight: 600,
        groundHeight: 50,
        wallThickness: 50
    },

    race: {
        defaultMaxMarbles: 8,
        defaultRaceLength: 2000,
        countdownTime: 3,
        finishDelay: 1000
    },

    physics: {
        gravity: { x: 0, y: 1 },
        defaultFriction: 0.5,
        defaultRestitution: 0.3,
        defaultDensity: 0.001
    },

    ui: {
        fontSize: {
            small: '16px',
            medium: '24px',
            large: '32px',
            xlarge: '48px',
            xxlarge: '64px'
        },
        colors: {
            primary: '#00ff00',
            secondary: '#888888',
            accent: '#ffff00',
            background: '#1a1a2e',
            text: '#ffffff'
        }
    },

    difficulty: {
        easy: {
            marbleSize: 25,
            friction: 0.4,
            bounciness: 0.9,
            obstacleCount: 3
        },
        normal: {
            marbleSize: 20,
            friction: 0.3,
            bounciness: 0.8,
            obstacleCount: 5
        },
        hard: {
            marbleSize: 15,
            friction: 0.2,
            bounciness: 0.7,
            obstacleCount: 8
        }
    },

    sounds: {
        bounce: 'bounce',
        finish: 'finish',
        countdown: 'countdown',
        bgm: 'bgm'
    }
};

export default GameData;
