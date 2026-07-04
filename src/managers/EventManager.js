export class EventManager {
    constructor(scene) {
        this.scene = scene;
        this.listeners = new Map();
        this.eventQueue = [];
    }

    on(event, callback, context) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, context });
        
        this.scene.events.on(event, callback, context);
    }

    off(event, callback, context) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.findIndex(
                l => l.callback === callback && l.context === context
            );
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
        this.scene.events.off(event, callback, context);
    }

    emit(event, data) {
        this.scene.events.emit(event, data);
    }

    queueEvent(event, data, delay = 0) {
        this.eventQueue.push({ event, data, delay, timestamp: Date.now() });
    }

    processQueue() {
        const now = Date.now();
        const readyEvents = this.eventQueue.filter(e => now - e.timestamp >= e.delay);
        
        readyEvents.forEach(e => {
            this.emit(e.event, e.data);
        });

        this.eventQueue = this.eventQueue.filter(e => now - e.timestamp < e.delay);
    }

    removeAllListeners() {
        this.listeners.forEach((listeners, event) => {
            listeners.forEach(({ callback, context }) => {
                this.scene.events.off(event, callback, context);
            });
        });
        this.listeners.clear();
    }

    update(time, delta) {
        this.processQueue();
    }

    destroy() {
        this.removeAllListeners();
        this.eventQueue = [];
    }
}
