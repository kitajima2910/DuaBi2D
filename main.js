import Phaser from 'phaser';
import { BootScene } from './src/scenes/BootScene.js';
import { MenuScene } from './src/scenes/MenuScene.js';
import { RaceScene } from './src/scenes/RaceScene.js';
import { ResultScene } from './src/scenes/ResultScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false,
            enableSleeping: false
        }
    },
    scene: [BootScene, MenuScene, RaceScene, ResultScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        touch: true,
        keyboard: true
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
    }
};

const game = new Phaser.Game(config);

export default game;
