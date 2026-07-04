export class RaceSystem {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.marbles = [];
        this.finishLine = null;
        this.raceConfig = {
            maxMarbles: 8,
            raceLength: 2000,
            obstacles: true
        };
    }

    startRace(marbles) {
        this.marbles = marbles;
        this.isActive = true;
        this.scene.events.emit('race-start');
    }

    endRace() {
        this.isActive = false;
        this.scene.events.emit('race-end', this.getResults());
    }

    getResults() {
        return this.marbles
            .sort((a, b) => a.finishTime - b.finishTime)
            .map((marble, index) => ({
                position: index + 1,
                name: marble.name,
                color: marble.color,
                time: marble.finishTime
            }));
    }

    updateMarblePosition(marbleId, position) {
        const marble = this.marbles.find(m => m.id === marbleId);
        if (marble) {
            marble.currentPosition = position;
        }
    }

    checkFinishLine(marble) {
        if (!this.finishLine || !this.isActive) return false;
        
        const marbleBody = marble.body;
        const finishBody = this.finishLine;
        
        return marbleBody.position.x >= finishBody.position.x;
    }

    setFinishLine(x, y, width, height) {
        this.finishLine = {
            position: { x, y },
            width,
            height
        };
    }

    getRaceProgress() {
        if (!this.isActive) return 0;
        
        const totalDistance = this.raceConfig.raceLength;
        const leader = this.marbles.reduce((leader, marble) => {
            return marble.currentPosition.x > leader.currentPosition.x ? marble : leader;
        }, this.marbles[0]);

        return leader ? leader.currentPosition.x / totalDistance : 0;
    }

    update(time, delta) {
        if (!this.isActive) return;

        // Kiểm tra finish line cho mỗi marble
        this.marbles.forEach(marble => {
            if (this.checkFinishLine(marble)) {
                marble.finishTime = time;
                this.scene.events.emit('marble-finish', {
                    id: marble.id,
                    name: marble.name,
                    time: marble.finishTime
                });
            }
        });

        // Kiểm tra nếu tất cả đã finish
        const allFinished = this.marbles.every(m => m.finishTime !== undefined);
        if (allFinished) {
            this.endRace();
        }
    }

    destroy() {
        this.marbles = [];
        this.isActive = false;
    }
}
