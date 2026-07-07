export class Obstacle {
  /**
   * @param {object} config
   * @param {string} config.id
   * @param {string} config.type  Obstacle type (e.g. 'block')
   * @param {number} config.x     Center X
   * @param {number} config.y     Center Y
   * @param {number} config.width
   * @param {number} config.height
   */
  constructor(config) {
    this.id = config.id;
    this.type = config.type || 'block';
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    /** @type {MatterJS.BodyType | null} — set by TrackSystem */
    this.body = null;
  }
}
