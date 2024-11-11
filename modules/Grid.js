
import { Cell } from './Cell.js';
export class Grid {
    constructor(width, height, distributionType = 'uniform', replenishmentRate = 1.0) {
        console.log(distributionType)
        this.width = width;
        this.height = height;
        this.replenishmentRate = replenishmentRate;
        this.cells = this.initializeGrid(distributionType);
    }

    initializeGrid(distributionType) {
        const grid = [];

        for (let x = 0; x < this.width; x++) {
            const row = [];
            for (let y = 0; y < this.height; y++) {
                let sugar = this.getInitialSugarValue(x, y, distributionType);
                row.push(new Cell(x, y, sugar, this.replenishmentRate));
            }
            grid.push(row);
        }
        return grid;
    }


    getInitialSugarValue(x, y, distributionType) {
        console.log(distributionType)
        switch (distributionType) {
            case 'uniform':
                console.log("chosen")
                return 3; // Средний уровень сахара для равномерного распределения
            case 'random':
                console.log("chosen")
                return Math.floor(Math.random() * 5); 
            case 'clustered':
                console.log("chosen")
                return this.getClusteredSugar(x, y); // Кластерное распределение
            default:
                return 3; 
        }
    }

    getClusteredSugar(x, y) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const distanceToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt((centerX) ** 2 + (centerY) ** 2);
        const sugarLevel = 5 - Math.floor((distanceToCenter / maxDistance) * 5);
        console.log(sugarLevel)
        return sugarLevel;
    }

    update() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.cells[x][y].replenish();
            }
        }
    }

    getCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.cells[x][y];
        }
        return null; 
    }
    //Сканируем пространство в поле зрения 
    getNeighbors(x, y, vision) {
        const neighbors = [];
        for (let i = -vision; i <= vision; i++) {
            for (let j = -vision; j <= vision; j++) {
                if (i === 0 && j === 0) continue; 
                const neighborCell = this.getCell(x + i, y + j);
                if (neighborCell) {
                    neighbors.push(neighborCell);
                }
            }
        }
        return neighbors;
    }
}