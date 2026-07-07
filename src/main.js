import { gameConfig } from '../core/GameConfig.js';
import { BootScene } from '../scenes/BootScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { RaceScene } from '../scenes/RaceScene.js';
import { ResultScene } from '../scenes/ResultScene.js';

gameConfig.scene = [BootScene, MenuScene, RaceScene, ResultScene];

const game = new Phaser.Game(gameConfig);
