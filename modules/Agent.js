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
    
        const targetCell = this.decideMove(cellsInView, occupiedPositions, agentCounts, agents);

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

    decideMove(cells, occupiedPositions = null, agentCounts = null, agents = []) {
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
                const otherAgents = agents.filter(a => a.id !== this.id && a.isAlive);
                if (otherAgents.length === 0) {
                    // Если нет других агентов, выбираем ячейку с максимальным сахаром
                    let maxSugar = -1;
                    let maxSugarCells = [];
    
                    for (let cell of availableCells) {
                        if (cell.currentSugar > maxSugar) {
                            maxSugar = cell.currentSugar;
                            maxSugarCells = [cell];
                        } else if (cell.currentSugar === maxSugar) {
                            maxSugarCells.push(cell);
                        }
                    }
                    return maxSugarCells[Math.floor(Math.random() * maxSugarCells.length)];
                } else {
                    let bestCells = [];
                    let maxScore = -1;
    
                    for (let cell of availableCells) {
                        let minDist = Number.MAX_SAFE_INTEGER;
    
                        for (let otherAgent of otherAgents) {
                            const dx = cell.position.x - otherAgent.position.x;
                            const dy = cell.position.y - otherAgent.position.y;
                            const dist = Math.hypot(dx, dy);
                            if (dist < minDist) {
                                minDist = dist;
                            }
                        }
    
                        // Теперь вычисляем оценку для ячейки
                        const weight_distance = 1.0; // Вес для расстояния
                        const weight_sugar = 0.1;    // Вес для сахара
                        const score = weight_distance * minDist + weight_sugar * cell.currentSugar;
    
                        if (score > maxScore) {
                            maxScore = score;
                            bestCells = [cell];
                        } else if (score === maxScore) {
                            bestCells.push(cell);
                        }
                    }
    
                    if (bestCells.length > 0) {
                        return bestCells[Math.floor(Math.random() * bestCells.length)];
                    } else {
                        return null;
                    }
                }
                break;
    
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