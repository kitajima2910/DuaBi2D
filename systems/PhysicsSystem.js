export class PhysicsSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('./EventBus.js').EventBus} eventBus
   */
  constructor(scene, eventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
    /** @type {Map<string, MatterJS.BodyType>} */
    this.bodies = new Map();
    /** @type {import('./MarbleRenderer.js').MarbleRenderer | null} */
    this.renderer = null;

    // Register collision callback
    this.scene.matter.world.on('collisionstart', (event) => {
      this.eventBus.emit('collision:start', event);
    });
  }

  /**
   * Create a Matter.js circle body for a marble at (x, y).
   * @param {import('../entities/Marble.js').Marble} marble
   * @param {number} x
   * @param {number} y
   * @returns {MatterJS.BodyType}
   */
  createBody(marble, x, y) {
    const body = Phaser.Physics.Matter.Matter.Bodies.circle(x, y, 12, {
      restitution: 0.9,
      friction: 0.01,
      frictionAir: 0.001,
      label: marble.id,
    });
    this.scene.matter.world.add(body);
    this.bodies.set(marble.id, body);
    marble.body = body;
    return body;
  }

  /**
   * Toggle a body between static (immovable) and dynamic.
   * Used by CountdownSystem to lock/unlock marbles.
   * @param {MatterJS.BodyType} body
   * @param {boolean} isStatic
   */
  setStatic(body, isStatic) {
    Phaser.Physics.Matter.Matter.Body.setStatic(body, isStatic);
  }

  /**
   * Convenience — set static by marble ID.
   * @param {string} marbleId
   * @param {boolean} isStatic
   */
  setStaticById(marbleId, isStatic) {
    const body = this.bodies.get(marbleId);
    if (body) this.setStatic(body, isStatic);
  }

  /**
   * Store reference to MarbleRenderer for visual syncing.
   * @param {import('./MarbleRenderer.js').MarbleRenderer} marbleRenderer
   */
  setRenderer(marbleRenderer) {
    this.renderer = marbleRenderer;
  }

  /**
   * Sync each marble's visual game object position/rotation with its physics body.
   * Call this in the scene's update() loop.
   */
  update() {
    if (!this.renderer) return;

    this.bodies.forEach((body, id) => {
      const go = this.renderer.getGameObject(id);
      if (go && body.position) {
        go.setPosition(body.position.x, body.position.y);
        go.setRotation(body.angle);
      }
    });
  }

  /**
   * Remove all bodies and clear the map.
   */
  destroy() {
    this.bodies.forEach((body) => {
      Phaser.Physics.Matter.Matter.World.remove(this.scene.matter.world, body);
    });
    this.bodies.clear();
  }
}
