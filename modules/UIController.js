
export class UIController {
    constructor(simulationController) {
        this.simulationController = simulationController;
        this.parameters = {
            gridWidth: 20,
            gridHeight: 20,
            sugarDistribution: 'clustered',
            numAgents: 10,
            agentConfig: {
                initialSugar: 20,
                metabolicRate: 1,
                vision: 3,
                speed: 1,
                sugarRegenerationRate: 1.0
            }
        };
    }

    initializeUI() {
        document.getElementById('startButton').addEventListener('click', () => this.handleStart());
        document.getElementById('stopButton').addEventListener('click', () => this.handleStop());
        document.getElementById('resetButton').addEventListener('click', () => this.handleReset());

        this.bindParameterInputs();

        this.simulationController.onUpdate((aliveAgents) => {
            this.displaySimulationInfo(aliveAgents);
        });
    }

    bindParameterInputs() {
        document.getElementById('gridWidthInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 5 && value <= 100) {
                this.parameters.gridWidth = value;
            } else {
                alert('Grid Width must be between 5 and 100');
                event.target.value = this.parameters.gridWidth;
            }
        });
        document.getElementById('gridHeightInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 5 && value <= 100) {
                this.parameters.gridHeight = value;
            } else {
                alert('Grid Height must be between 5 and 100');
                event.target.value = this.parameters.gridHeight;
            }
        });

        document.getElementById('sugarDistributionSelect').addEventListener('change', (event) => {
            this.parameters.sugarDistribution = event.target.value;
        });

        document.getElementById('numAgentsInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 1000) {
                this.parameters.numAgents = value;
            } else {
                alert('Number of Agents must be between 1 and 1000');
                event.target.value = this.parameters.numAgents;
            }
        });

        document.getElementById('initialSugarInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 100) {
                this.parameters.agentConfig.initialSugar = value;
            } else {
                alert('Initial Sugar must be between 1 and 100');
                event.target.value = this.parameters.agentConfig.initialSugar;
            }
        });
        document.getElementById('metabolicRateInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 0 && value <= 10) {
                this.parameters.agentConfig.metabolicRate = value;
            } else {
                alert('Metabolic Rate must be between 0 and 10');
                event.target.value = this.parameters.agentConfig.metabolicRate;
            }
        });
        document.getElementById('visionInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 10) {
                this.parameters.agentConfig.vision = value;
            } else {
                alert('Vision Range must be between 1 and 10');
                event.target.value = this.parameters.agentConfig.vision;
            }
        });
        document.getElementById('speedInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 5) {
                this.parameters.agentConfig.speed = value;
            } else {
                alert('Movement Speed must be between 1 and 5');
                event.target.value = this.parameters.agentConfig.speed;
            }
        });

        document.getElementById('sugarRegenRateInput').addEventListener('change', (event) => {
            const value = parseFloat(event.target.value);
            if (value >= 0 && value <= 5) {
                this.parameters.agentConfig.sugarRegenerationRate = value;
            } else {
                alert('Sugar Regeneration Rate must be between 0 and 5');
                event.target.value = this.parameters.agentConfig.sugarRegenerationRate;
            }
        });
    }

    handleStart() {
        this.simulationController.start();
    }

    handleStop() {
        this.simulationController.stop();
    }

    handleReset() {
        this.simulationController.reset(this.parameters);
    }

    displaySimulationInfo(numAgentsAlive) {
        const infoDisplay = document.getElementById('simulationInfo');
        infoDisplay.textContent = `Agents Alive: ${numAgentsAlive}`;
    }
}