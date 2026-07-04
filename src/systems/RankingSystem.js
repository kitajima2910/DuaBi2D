export class RankingSystem {
    constructor(scene) {
        this.scene = scene;
        this.rankings = [];
        this.finishTimes = new Map();
    }

    addParticipant(id, name, color) {
        this.rankings.push({
            id,
            name,
            color,
            position: 0,
            finishTime: null,
            isFinished: false
        });
    }

    removeParticipant(id) {
        this.rankings = this.rankings.filter(r => r.id !== id);
        this.finishTimes.delete(id);
    }

    updatePosition(id, position) {
        const participant = this.rankings.find(r => r.id === id);
        if (participant) {
            participant.position = position;
        }
    }

    setFinishTime(id, time) {
        const participant = this.rankings.find(r => r.id === id);
        if (participant) {
            participant.finishTime = time;
            participant.isFinished = true;
            this.finishTimes.set(id, time);
            this.updateRankings();
        }
    }

    updateRankings() {
        // Sắp xếp theo finish time (nhỏ nhất trước)
        this.rankings.sort((a, b) => {
            if (a.isFinished && !b.isFinished) return -1;
            if (!a.isFinished && b.isFinished) return 1;
            if (a.isFinished && b.isFinished) return a.finishTime - b.finishTime;
            return b.position - a.position;
        });
    }

    getCurrentRankings() {
        return this.rankings.map((r, index) => ({
            ...r,
            rank: index + 1
        }));
    }

    getTopThree() {
        return this.rankings.slice(0, 3).map((r, index) => ({
            ...r,
            rank: index + 1
        }));
    }

    getWinner() {
        return this.rankings.find(r => r.isFinished) || null;
    }

    getRank(id) {
        const index = this.rankings.findIndex(r => r.id === id);
        return index !== -1 ? index + 1 : null;
    }

    isAllFinished() {
        return this.rankings.every(r => r.isFinished);
    }

    reset() {
        this.rankings.forEach(r => {
            r.position = 0;
            r.finishTime = null;
            r.isFinished = false;
        });
        this.finishTimes.clear();
    }

    update(time, delta) {
        // Cập nhật rankings real-time nếu cần
    }

    destroy() {
        this.rankings = [];
        this.finishTimes.clear();
    }
}
