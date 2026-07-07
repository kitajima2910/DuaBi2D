export class MarbleRenderer {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    /** @type {Map<string, Phaser.GameObjects.Arc>} */
    this.gameObjects = new Map();
  }

  /**
   * Create a visual circle for a marble at (x, y).
   * @param {import('../entities/Marble.js').Marble} marble
   * @param {number} x
   * @param {number} y
   * @returns {Phaser.GameObjects.Arc}
   */
  create(marble, x, y) {
    const color = Phaser.Display.Color.HexStringToColor(marble.color).color;
    const circle = this.scene.add.circle(x, y, 12, color);
    this.gameObjects.set(marble.id, circle);
    marble.gameObject = circle;
    return circle;
  }

  /**
   * Retrieve the game object for a marble.
   * @param {string} marbleId
   * @returns {Phaser.GameObjects.Arc | undefined}
   */
  getGameObject(marbleId) {
    return this.gameObjects.get(marbleId);
  }

  /**
   * Remove all game objects and clear the map.
   */
  destroy() {
    this.gameObjects.forEach((go) => go.destroy());
    this.gameObjects.clear();
  }
}
