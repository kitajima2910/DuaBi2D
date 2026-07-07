import { Marble } from '../entities/Marble.js';

export class CountrySystem {
  constructor() {
    this.countries = [];
    this.marbles = [];
  }

  /**
   * Fetch countries.json, validate entries, instantiate Marble entities.
   * @returns {Promise<CountrySystem>}
   */
  async init() {
    const resp = await fetch('/data/countries.json');
    if (!resp.ok) throw new Error(`Failed to load countries.json: ${resp.status}`);

    /** @type {object[]} */
    const raw = await resp.json();

    if (!Array.isArray(raw)) throw new Error('countries.json must be an array');

    this.countries = raw.filter((entry) => this._validate(entry));
    this.marbles = this.countries.map(
      (c) =>
        new Marble({
          id: c.id,
          countryName: c.name,
          color: c.color,
          flag: c.flag,
          strength: c.strength,
          agility: c.agility,
          luck: c.luck,
        }),
    );

    return this;
  }

  /**
   * Validate a country entry has required fields.
   * @param {object} entry
   * @returns {boolean}
   */
  _validate(entry) {
    if (!entry || typeof entry !== 'object') return false;
    if (typeof entry.id !== 'string' || entry.id.length === 0) return false;
    if (typeof entry.name !== 'string' || entry.name.length === 0) return false;
    if (typeof entry.color !== 'string' || entry.color.length === 0) return false;
    return true;
  }

  /** @param {string} id */
  getMarble(id) {
    return this.marbles.find((m) => m.id === id) ?? null;
  }

  /**
   * Pick `count` random marbles (shuffled).
   * @param {number} count
   * @returns {Marble[]}
   */
  getRandomMarbles(count) {
    const shuffled = [...this.marbles].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
