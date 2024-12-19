import { Grid } from './Grid.js';
import { Agent } from './Agent.js';
import { Visualization } from './Visualization.js';

export class SimulationController {
    constructor(grid, agents) {
        this.grid = grid;
        this.agents = agents;
        this.isRunning = false;
        this.intervalId = null;
        this.timeStep = 100; 
        this.visualization = new Visualization(this.grid, this.agents, 'simulationCanvas');
        this.visualization.initializeCanvas();
        this.visualization.render();
        this.onUpdateListeners = [];
    }

    onUpdate(callback) {
        this.onUpdateListeners.push(callback);
    }

    initializeSimulation(parameters) {
        const { gridWidth, gridHeight, sugarDistribution, sugarRegenerationRate, agentConfig, distributionParams, agentNumbers } = parameters;

        this.grid = new Grid(gridWidth, gridHeight, sugarDistribution, sugarRegenerationRate, distributionParams);
        this.agents = [];
        let agentId = 0;

        const strategies = ['random', 'max_sugar', 'avoid_crowds'];

        for (let strategy of strategies) {
            const numAgents = agentNumbers[strategy];
            for (let i = 0; i < numAgents; i++) {
                let startX, startY;
                let cell;
                do {
                    startX = Math.floor(Math.random() * gridWidth);
                    startY = Math.floor(Math.random() * gridHeight);
                    cell = this.grid.getCell(startX, startY);
                } while (!cell);

                const agent = new Agent(
                    agentId++,
                    startX,
                    startY,
                    agentConfig.initialSugar,
                    agentConfig.metabolicRate,
                    agentConfig.vision,
                    agentConfig.reproduceThreshold,
                    agentConfig.maxAge,
                    strategy
                );
                this.agents.push(agent);
            }
        }

        this.visualization = new Visualization(this.grid, this.agents, 'simulationCanvas');
        this.visualization.initializeCanvas();
        this.visualization.render();

        this.notifyUpdate();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.intervalId = setInterval(() => {
            this.update();
        }, this.timeStep);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
    }

    reset(parameters) {
        this.stop();
        this.initializeSimulation(parameters);
    }

    update() {
        const occupiedPositions = new Set();
        const agentCounts = new Map();

        for (let agent of this.agents) {
            if (agent.isAlive) {
                const posKey = `${agent.position.x},${agent.position.y}`;
                occupiedPositions.add(posKey);
                agentCounts.set(posKey, (agentCounts.get(posKey) || 0) + 1);
            }
        }

        for (let agent of this.agents) {
            if (agent.isAlive) {
                agent.act(this.grid, this.agents, occupiedPositions, agentCounts);
            }
        }

        this.agents = this.agents.filter(agent => agent.isAlive);

        this.grid.update();
        this.visualization.agents = this.agents;
        this.visualization.render();

        this.notifyUpdate();

        if (this.agents.length === 0) {
            console.log('All agents have died.');
            this.stop();
        }
    }

    notifyUpdate() {
        const aliveAgents = this.agents.filter(agent => agent.isAlive).length;
        this.onUpdateListeners.forEach(callback => callback(aliveAgents, this.agents));
    }

    handleUserInput(input) {
        const { action, parameters } = input;

        switch (action) {
            case 'start':
                this.start();
                break;
            case 'stop':
                this.stop();
                break;
            case 'reset':
                this.reset(parameters);
                break;
            case 'updateParameters':
                this.reset(parameters);
                break;
            default:
                console.warn('Unknown action:', action);
                break;
        }
    }
}