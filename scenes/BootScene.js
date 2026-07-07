export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // TODO: preload assets here later
    this.scene.start('MenuScene');
  }
}
