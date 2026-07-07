export class FinishLine {
  /**
   * @param {object} config
   * @param {number} config.x1  Start X
   * @param {number} config.y1  Start Y
   * @param {number} config.x2  End X
   * @param {number} config.y2  End Y
   */
  constructor(config) {
    this.x1 = config.x1;
    this.y1 = config.y1;
    this.x2 = config.x2;
    this.y2 = config.y2;

    /** Computed center */
    this.cx = (config.x1 + config.x2) / 2;
    this.cy = (config.y1 + config.y2) / 2;

    /** Width of the finish line (distance between the two points) */
    this.width = Math.sqrt(
      (config.x2 - config.x1) ** 2 + (config.y2 - config.y1) ** 2,
    );

    /** Thin static body height */
    this.height = 8;

    /** Angle from (x1,y1) to (x2,y2) in radians */
    this.angle = Math.atan2(config.y2 - config.y1, config.x2 - config.x1);

    /** @type {MatterJS.BodyType | null} — set by TrackSystem */
    this.body = null;
  }
}
