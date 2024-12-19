export class Agent {
    constructor(id, startX, startY, initialSugar, metabolicRate, vision, reproduceThreshold, maxAge, strategy) {
        this.id = id;
        this.age = 0;
        this.position = { x: startX, y: startY };
        this.sugar = initialSugar;            
        this.metabolicRate = metabolicRate;      
        this.vision = vision;
        this.reproduceThreshold = reproduceThreshold;
        this.isAlive = true;
        this.maxAge = maxAge;
        this.stepsWithoutSugar = 0;
        this.maxStepsWithoutSugar = 5;
        this.strategy = strategy; 
    }

    perceiveEnvironment(grid) {
        const neighbors = grid.getNeighbors(this.position.x, this.position.y, this.vision);
        return neighbors;
    }

    reproduce(grid, agents, occupiedPositions = null, agentCounts = null) {
        if (this.sugar >= this.reproduceThreshold) { 
            const neighbors = grid.getNeighbors(this.position.x, this.position.y, 1);
            const emptyCells = neighbors.filter(cell => (!occupiedPositions || !occupiedPositions.has(`${cell.position.x},${cell.position.y}`)));

            if (emptyCells.length > 0) {
                const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                const childAgent = new Agent(
                    agents.length, 
                    targetCell.position.x,
                    targetCell.position.y,
                    this.sugar / 2, 
                    this.metabolicRate,
                    this.vision,
                    this.reproduceThreshold,
                    this.maxAge,
                    this.strategy 
                );

                agents.push(childAgent);
                if (occupiedPositions) {
                    const childPosKey = `${targetCell.position.x},${targetCell.position.y}`;
                    occupiedPositions.add(childPosKey);
                    if (agentCounts) {
                        agentCounts.set(childPosKey, (agentCounts.get(childPosKey) || 0) + 1);
                    }
                }
                this.sugar /= 2; 
            }
        }
    }

    act(grid, agents = [], occupiedPositions = null, agentCounts = null) {
        if (!this.isAlive) return;

        const currentPosKey = `${this.position.x},${this.position.y}`;
        if (occupiedPositions) {
            occupiedPositions.delete(currentPosKey);
        }
        if (agentCounts) {
            agentCounts.set(currentPosKey, agentCounts.get(currentPosKey) - 1);
            if (agentCounts.get(currentPosKey) <= 0) {
                agentCounts.delete(currentPosKey);
            }
        }

        const cellsInView = this.perceiveEnvironment(grid);

        const targetCell = this.decideMove(cellsInView, occupiedPositions, agentCounts);

        if (targetCell) {
            this.moveTo(targetCell);
            const newPosKey = `${this.position.x},${this.position.y}`;
            if (occupiedPositions) {
                occupiedPositions.add(newPosKey);
            }
            if (agentCounts) {
                agentCounts.set(newPosKey, (agentCounts.get(newPosKey) || 0) + 1);
            }
            this.consumeSugar(targetCell);
            this.stepsWithoutSugar = 0;
        } else {
            this.stepsWithoutSugar += 1;
        }

        this.metabolize();
        this.reproduce(grid, agents, occupiedPositions, agentCounts);
        this.checkVitalSigns();
    }

    decideMove(cells, occupiedPositions = null, agentCounts = null) {
        const strategy = this.strategy;

        let availableCells = cells;
        if (occupiedPositions) {
            availableCells = availableCells.filter(cell => !occupiedPositions.has(`${cell.position.x},${cell.position.y}`));
        }

        if (availableCells.length === 0) return null;

        switch (strategy) {
            case 'random':
                return availableCells[Math.floor(Math.random() * availableCells.length)];

            case 'max_sugar':
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

            case 'avoid_crowds':
                if (!agentCounts) {
                    return availableCells[Math.floor(Math.random() * availableCells.length)];
                }

                let minAgents = Number.MAX_SAFE_INTEGER;
                let bestCells = [];

                for (let cell of availableCells) {
                    const cellKey = `${cell.position.x},${cell.position.y}`;
                    const agentsInCell = agentCounts.get(cellKey) || 0;
                    if (agentsInCell < minAgents) {
                        minAgents = agentsInCell;
                        bestCells = [cell];
                    } else if (agentsInCell === minAgents) {
                        bestCells.push(cell);
                    }
                }

                if (bestCells.length > 1) {
                    let maxSugar = -1;
                    let maxSugarCells = [];
                    for (let cell of bestCells) {
                        if (cell.currentSugar > maxSugar) {
                            maxSugar = cell.currentSugar;
                            maxSugarCells = [cell];
                        } else if (cell.currentSugar === maxSugar) {
                            maxSugarCells.push(cell);
                        }
                    }
                    if (maxSugarCells.length > 0) {
                        return maxSugarCells[Math.floor(Math.random() * maxSugarCells.length)];
                    } else {
                        return bestCells[Math.floor(Math.random() * bestCells.length)];
                    }
                } else if (bestCells.length === 1) {
                    return bestCells[0];
                } else {
                    return null;
                }

            default:
                return availableCells[Math.floor(Math.random() * availableCells.length)];
        }
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
        if (this.sugar <= 0 && this.stepsWithoutSugar >= this.maxStepsWithoutSugar) {
            this.isAlive = false; 
        }
        if (this.age >= this.maxAge) {
            this.isAlive = false; 
        }
    }
}