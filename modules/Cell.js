export class Cell {
    constructor(x, y, maxSugar, replenishmentRate) {
        this.position = { x: x, y: y };
        this.maxSugar = Math.min(Math.max(maxSugar, 0), 5);
        this.currentSugar = this.maxSugar;
        this.replenishmentRate = replenishmentRate;
    }
    replenish() {
        if (this.currentSugar < this.maxSugar) {
            this.currentSugar = Math.min(this.maxSugar, this.currentSugar + this.replenishmentRate);
        }
    }
}