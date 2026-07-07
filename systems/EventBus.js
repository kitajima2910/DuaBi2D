export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /** Subscribe — returns unsubscribe function */
  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const list = this._listeners.get(event);
    if (!list) return;
    this._listeners.set(event, list.filter((f) => f !== fn));
  }

  emit(event, data) {
    const list = this._listeners.get(event);
    if (list) list.forEach((fn) => fn(data));
  }

  clear() {
    this._listeners.clear();
  }
}
