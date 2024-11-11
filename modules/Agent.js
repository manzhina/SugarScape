
export class Agent {
    constructor(id, startX, startY, initialSugar, metabolicRate, vision, speed) {
        this.id = id;
        this.position = { x: startX, y: startY };
        this.sugar = initialSugar;            
        this.metabolicRate = metabolicRate;      
        this.vision = vision;
        this.speed = speed;
        this.isAlive = true;
        this.stepsWithoutSugar = 0;
        this.maxStepsWithoutSugar = 5;
    }

    perceiveEnvironment(grid) {
        const neighbors = grid.getNeighbors(this.position.x, this.position.y, this.vision);
        return neighbors;
    }
    act(grid, occupiedPositions = null) {
        if (!this.isAlive) return;

        const cellsInView = this.perceiveEnvironment(grid);

        // Выбираем клетку для движения
        const targetCell = this.decideMove(cellsInView, occupiedPositions);

        //Двигаемся и едим
        if (targetCell && (!occupiedPositions || !occupiedPositions.has(`${targetCell.position.x},${targetCell.position.y}`))) {
            this.moveTo(targetCell);
            if (occupiedPositions) {
                occupiedPositions.add(`${targetCell.position.x},${targetCell.position.y}`);
            }
            this.consumeSugar(targetCell);
        } else if (occupiedPositions) {
            this.stepsWithoutSugar += 1;
        }

        this.metabolize();
        this.checkVitalSigns();
    }

    decideMove(cells, occupiedPositions = null) {
        let availableCells = cells;

        if (occupiedPositions) {
            availableCells = cells.filter(cell => !occupiedPositions.has(`${cell.position.x},${cell.position.y}`));
        }

        if (availableCells.length === 0) return null;
        let maxSugarCell = null;
        let maxSugar = -1;

        for (let cell of availableCells) {
            if (cell.currentSugar > maxSugar) {
                maxSugar = cell.currentSugar;
                maxSugarCell = cell;
            }
        }

        const highestSugarCells = availableCells.filter(cell => cell.currentSugar === maxSugar);
        if (highestSugarCells.length > 1) {
            maxSugarCell = highestSugarCells[Math.floor(Math.random() * highestSugarCells.length)];
        }

        return maxSugarCell;
    }

    moveTo(cell) {
        if (!cell) return;
        this.position.x = cell.position.x;
        this.position.y = cell.position.y;
    }

    consumeSugar(cell) {
        if (!cell) return;
        if (cell.currentSugar > 0) {
            this.sugar += cell.currentSugar;  
            cell.currentSugar = 0;            
            this.stepsWithoutSugar = 0;
        } else {
            this.stepsWithoutSugar += 1;
        }
    }

    metabolize() {
        this.sugar -= this.metabolicRate;
        if (this.sugar < 0) {
            this.sugar = 0;
        }
    }


    checkVitalSigns() {
        if (this.sugar <= 0) {
            if (this.stepsWithoutSugar >= this.maxStepsWithoutSugar) {
                this.isAlive = false;  // Агент умирает, если превышен лимит шагов без сахара
            }
        }
    }

   
}