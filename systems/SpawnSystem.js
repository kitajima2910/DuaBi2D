export class SpawnSystem {
  /**
   * @param {import('./MarbleRenderer.js').MarbleRenderer} marbleRenderer
   * @param {import('./PhysicsSystem.js').PhysicsSystem} physicsSystem
   */
  constructor(marbleRenderer, physicsSystem) {
    this.marbleRenderer = marbleRenderer;
    this.physicsSystem = physicsSystem;
    /** @type {Array<{marble: import('../entities/Marble.js').Marble, x: number, y: number}>} */
    this.spawned = [];
  }

  /**
   * Spawn marbles in a centered grid layout.
   * @param {import('../entities/Marble.js').Marble[]} marbles
   * @param {number} sceneWidth
   * @param {number} sceneHeight
   */
  spawn(marbles, sceneWidth, sceneHeight) {
    const rows = Math.ceil(Math.sqrt(marbles.length));
    const cols = Math.ceil(marbles.length / rows);
    const spacing = 32;

    for (let i = 0; i < marbles.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const x = Math.floor(sceneWidth / 2 + (col - (cols - 1) / 2) * spacing);
      const y = Math.floor(sceneHeight / 2 + (row - (rows - 1) / 2) * spacing);

      this.marbleRenderer.create(marbles[i], x, y);
      this.physicsSystem.createBody(marbles[i], x, y);

      this.spawned.push({ marble: marbles[i], x, y });
    }
  }
}
