import { Grid } from './modules/Grid.js';
import { Agent } from './modules/Agent.js';
import { SimulationController } from './modules/SimulationController.js';
import { UIController } from './modules/UIController.js';

function initializeSimulation() {
    const parameters = {
        gridWidth: 20,
        gridHeight: 20,
        sugarDistribution: 'clustered',
        sugarRegenerationRate: 1.0,
        agentConfig: {
            initialSugar: 20,
            metabolicRate: 1,
            vision: 3,
            reproduceThreshold: 40,
            maxAge: 20
        },
        distributionParams: {
            numClusters: 5,
            clusterRadius: 2
        },
        agentNumbers: {
            random: 10,
            max_sugar: 10,
            avoid_crowds: 10
        }
    };

    const grid = new Grid(parameters.gridWidth, parameters.gridHeight, parameters.sugarDistribution, parameters.sugarRegenerationRate, parameters.distributionParams);

    const agents = [];
    let agentId = 0;
    const strategies = ['random', 'max_sugar', 'avoid_crowds'];

    for (let strategy of strategies) {
        const numAgents = parameters.agentNumbers[strategy];
        for (let i = 0; i < numAgents; i++) {
            let startX, startY;
            let cell;
            do {
                startX = Math.floor(Math.random() * parameters.gridWidth);
                startY = Math.floor(Math.random() * parameters.gridHeight);
                cell = grid.getCell(startX, startY);
            } while (!cell);

            const agent = new Agent(
                agentId++,
                startX,
                startY,
                parameters.agentConfig.initialSugar,
                parameters.agentConfig.metabolicRate,
                parameters.agentConfig.vision,
                parameters.agentConfig.reproduceThreshold, 
                parameters.agentConfig.maxAge,
                strategy
            );
            agents.push(agent);
        }
    }

    const simulationController = new SimulationController(grid, agents);
    const uiController = new UIController(simulationController);
    uiController.initializeUI();

    simulationController.onUpdate((aliveAgents, agents) => {
        uiController.displaySimulationInfo(aliveAgents, agents);
    });

    uiController.displaySimulationInfo(agents.length, agents);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSimulation();
});