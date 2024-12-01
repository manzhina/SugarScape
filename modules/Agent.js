
export class Agent {
    constructor(id, startX, startY, initialSugar, metabolicRate, vision, reproduceThreshold, maxAge) {
        this.id = id;
        this.age = 0;
        this.position = { x: startX, y: startY };
        this.sugar = initialSugar;            
        this.metabolicRate = metabolicRate;      
        this.vision = vision;
        this.reproduceThreshold = reproduceThreshold
        this.isAlive = true;
        this.maxAge = maxAge;
        this.stepsWithoutSugar = 0;
        this.maxStepsWithoutSugar = 5;
    }

    perceiveEnvironment(grid) {
        const neighbors = grid.getNeighbors(this.position.x, this.position.y, this.vision);
        return neighbors;
    }
    reproduce(grid, agents, occupiedPositions) {
        if (this.sugar >= this.reproduceThreshold) { // Порог размножения
            const neighbors = grid.getNeighbors(this.position.x, this.position.y, 1);
            const emptyCells = neighbors.filter(cell => cell.currentSugar === 0 && (!occupiedPositions || !occupiedPositions.has(`${cell.position.x},${cell.position.y}`)));
    
            if (emptyCells.length > 0) {
                const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                const childAgent = new Agent(
                    agents.length, 
                    targetCell.position.x,
                    targetCell.position.y,
                    this.sugar / 2, // Передаем половину сахара ребенку
                    this.metabolicRate,
                    this.vision,
                    this.reproduceThreshold,
                    this.maxAge
                );
    
                agents.push(childAgent);
                if (occupiedPositions) {
                    occupiedPositions.add(`${targetCell.position.x},${targetCell.position.y}`);
                }
                this.sugar /= 2; // Потеря сахара на размножение
            }
        }
    }
    
    act(grid, agents = [], occupiedPositions = null,) {
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
        this.reproduce(grid, agents, occupiedPositions);
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
        this.age++;
        console.log(this.age, this.maxAge)
        if (this.sugar <= 0 && this.stepsWithoutSugar >= this.maxStepsWithoutSugar) {
            this.isAlive = false; 
        }
        if (this.age >= this.maxAge) {
            this.isAlive = false; // Умирает от старости
        }
    }

   
}
