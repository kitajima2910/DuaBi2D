import { Obstacle } from '../entities/Obstacle.js';
import { FinishLine } from '../entities/FinishLine.js';

export class TrackLoader {
  constructor() {
    /** @type {Array<{id:string, name:string, world:{width:number,height:number}, spawnArea:{x:number,y:number,width:number,height:number}, finishArea:FinishLine, walls:Array<{x:number,y:number,width:number,height:number}>, obstacles:Obstacle[]}>} */
    this.tracks = [];
  }

  /**
   * Fetch /data/tracks.json, validate, and hydrate into entity instances.
   * @returns {Promise<TrackLoader>}
   */
  async init() {
    const resp = await fetch('/data/tracks.json');
    if (!resp.ok) throw new Error(`Failed to load tracks.json: ${resp.status}`);

    /** @type {object} */
    const raw = await resp.json();

    if (!raw || typeof raw !== 'object') throw new Error('tracks.json must be an object');
    if (!Array.isArray(raw.tracks)) throw new Error('tracks.json must contain a "tracks" array');

    // Filter valid tracks and hydrate
    const valid = raw.tracks.filter((entry) => this._validate(entry));
    this.tracks = valid.map((entry) => this._hydrate(entry));

    if (this.tracks.length === 0) {
      throw new Error('No valid tracks found in tracks.json');
    }

    return this;
  }

  /**
   * Validate a raw track entry.
   * @param {object} entry
   * @returns {boolean}
   */
  _validate(entry) {
    if (!entry || typeof entry !== 'object') return false;

    // id
    if (typeof entry.id !== 'string' || entry.id.length === 0) return false;
    // name
    if (typeof entry.name !== 'string' || entry.name.length === 0) return false;

    // world
    if (!entry.world || typeof entry.world !== 'object') return false;
    if (typeof entry.world.width !== 'number' || entry.world.width <= 0) return false;
    if (typeof entry.world.height !== 'number' || entry.world.height <= 0) return false;

    // spawnArea
    if (!entry.spawnArea || typeof entry.spawnArea !== 'object') return false;
    if (typeof entry.spawnArea.x !== 'number') return false;
    if (typeof entry.spawnArea.y !== 'number') return false;
    if (typeof entry.spawnArea.width !== 'number' || entry.spawnArea.width <= 0) return false;
    if (typeof entry.spawnArea.height !== 'number' || entry.spawnArea.height <= 0) return false;

    // finishArea
    if (!entry.finishArea || typeof entry.finishArea !== 'object') return false;
    if (typeof entry.finishArea.x1 !== 'number') return false;
    if (typeof entry.finishArea.y1 !== 'number') return false;
    if (typeof entry.finishArea.x2 !== 'number') return false;
    if (typeof entry.finishArea.y2 !== 'number') return false;

    // walls (optional, defaults to empty)
    if (entry.walls !== undefined) {
      if (!Array.isArray(entry.walls)) return false;
      for (const w of entry.walls) {
        if (typeof w.x !== 'number' || typeof w.y !== 'number') return false;
        if (typeof w.width !== 'number' || typeof w.height !== 'number') return false;
      }
    }

    // obstacles (optional, defaults to empty)
    if (entry.obstacles !== undefined) {
      if (!Array.isArray(entry.obstacles)) return false;
      for (const o of entry.obstacles) {
        if (typeof o.id !== 'string' || o.id.length === 0) return false;
        if (typeof o.x !== 'number' || typeof o.y !== 'number') return false;
        if (typeof o.width !== 'number' || typeof o.height !== 'number') return false;
      }
    }

    return true;
  }

  /**
   * Convert a raw track entry into hydrated form with entity instances.
   * @param {object} entry
   * @returns {object}
   */
  _hydrate(entry) {
    return {
      id: entry.id,
      name: entry.name,
      world: { width: entry.world.width, height: entry.world.height },
      spawnArea: { x: entry.spawnArea.x, y: entry.spawnArea.y, width: entry.spawnArea.width, height: entry.spawnArea.height },
      finishArea: new FinishLine(entry.finishArea),
      walls: (entry.walls || []).map((w) => ({ ...w })),
      obstacles: (entry.obstacles || []).map((o) => new Obstacle(o)),
    };
  }

  /**
   * Get a track by its array index.
   * @param {number} index
   * @returns {object | undefined}
   */
  getTrack(index) {
    return this.tracks[index];
  }

  /**
   * Get a track by its id string.
   * @param {string} id
   * @returns {object | undefined}
   */
  getTrackById(id) {
    return this.tracks.find((t) => t.id === id);
  }
}
