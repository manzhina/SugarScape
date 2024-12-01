
import { Grid } from './modules/Grid.js';
import { Agent } from './modules/Agent.js';
import { SimulationController } from './modules/SimulationController.js';
import { UIController } from './modules/UIController.js';

function initializeSimulation() {
    console.log('Main script loaded');
    const parameters = {
        gridWidth: 20,
        gridHeight: 20,
        numAgents: 10,
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
        }
        
    };

    const grid = new Grid(parameters.gridWidth, parameters.gridHeight, parameters.sugarDistribution, parameters.sugarRegenerationRate, parameters.distributionParams);

    const agents = [];
    for (let i = 0; i < parameters.numAgents; i++) {
        let startX, startY;
        let cell;
        do {
            startX = Math.floor(Math.random() * parameters.gridWidth);
            startY = Math.floor(Math.random() * parameters.gridHeight);
            cell = grid.getCell(startX, startY);
        } while (!cell);

        const agent = new Agent(
            i,
            startX,
            startY,
            parameters.agentConfig.initialSugar,
            parameters.agentConfig.metabolicRate,
            parameters.agentConfig.vision,
            parameters.agentConfig.reproduceThreshold, 
            parameters.agentConfig.maxAge
        );
        agents.push(agent);
    }

    const simulationController = new SimulationController(grid, agents);
    const uiController = new UIController(simulationController);
    uiController.initializeUI();

    simulationController.onUpdate((aliveAgents) => {
        uiController.displaySimulationInfo(aliveAgents);
    });

    uiController.displaySimulationInfo(agents.length);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSimulation();
});