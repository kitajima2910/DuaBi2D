export class Marble {
  /**
   * @param {object} config
   * @param {string} config.id
   * @param {string} config.countryName
   * @param {string} config.color   Hex color
   * @param {string} config.flag    Emoji flag
   * @param {number} [config.strength=50]
   * @param {number} [config.agility=50]
   * @param {number} [config.luck=50]
   */
  constructor(config) {
    this.id = config.id;
    this.countryName = config.countryName;
    this.color = config.color;
    this.flag = config.flag;
    this.strength = config.strength ?? 50;
    this.agility = config.agility ?? 50;
    this.luck = config.luck ?? 50;
  }
}
