export class UIController {
    constructor(simulationController) {
        this.simulationController = simulationController;
        this.parameters = {
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
    }

    initializeUI() {
        document.getElementById('startButton').addEventListener('click', () => this.handleStart());
        document.getElementById('stopButton').addEventListener('click', () => this.handleStop());
        document.getElementById('resetButton').addEventListener('click', () => this.handleReset());

        this.bindParameterInputs();

        this.simulationController.onUpdate((aliveAgents, agents) => {
            this.displaySimulationInfo(aliveAgents, agents);
        });
    }

    bindParameterInputs() {
        document.getElementById('numClustersInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 100) {
                this.parameters.distributionParams.numClusters = value;
            } else {
                alert('Number of Clusters must be between 1 and 100');
                event.target.value = this.parameters.distributionParams.numClusters;
            }
        });
        document.getElementById('clusterRadiusInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 10) {
                this.parameters.distributionParams.clusterRadius = value;
            } else {
                alert('Cluster Radius must be between 1 and 10');
                event.target.value = this.parameters.distributionParams.clusterRadius;
            }
        });

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
            this.toggleMultiClusterParams();
        });

        document.getElementById('numRandomAgentsInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 0 && value <= 1000) {
                this.parameters.agentNumbers.random = value;
            } else {
                alert('Number of Random Agents must be between 0 and 1000');
                event.target.value = this.parameters.agentNumbers.random;
            }
        });
        document.getElementById('numMaxSugarAgentsInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 0 && value <= 1000) {
                this.parameters.agentNumbers.max_sugar = value;
            } else {
                alert('Number of Max Sugar Agents must be between 0 and 1000');
                event.target.value = this.parameters.agentNumbers.max_sugar;
            }
        });
        document.getElementById('numAvoidCrowdsAgentsInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 0 && value <= 1000) {
                this.parameters.agentNumbers.avoid_crowds = value;
            } else {
                alert('Number of Avoid Crowds Agents must be between 0 and 1000');
                event.target.value = this.parameters.agentNumbers.avoid_crowds;
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
        document.getElementById('reproduceThresholdInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 1000) {
                this.parameters.agentConfig.reproduceThreshold = value;
            } else {
                alert('Reproduce Threshold must be between 1 and 1000');
                event.target.value = this.parameters.agentConfig.reproduceThreshold;
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
        document.getElementById('maxAgeInput').addEventListener('change', (event) => {
            const value = parseInt(event.target.value);
            if (value >= 1 && value <= 1000) {
                this.parameters.agentConfig.maxAge = value;
            } else {
                alert('Max Age must be between 1 and 1000');
                event.target.value = this.parameters.agentConfig.maxAge;
            }
        });

        document.getElementById('sugarRegenRateInput').addEventListener('change', (event) => {
            const value = parseFloat(event.target.value);
            if (value >= 0 && value <= 5) {
                this.parameters.sugarRegenerationRate = value;
            } else {
                alert('Sugar Regeneration Rate must be between 0 and 5');
                event.target.value = this.parameters.sugarRegenerationRate;
            }
        });
    }

    toggleMultiClusterParams() {
        const distribution = this.parameters.sugarDistribution;
        const multiClusterDiv = document.getElementById('multiClusterParams');
        if (distribution === 'multiCluster') {
            multiClusterDiv.classList.remove('hidden');
        } else {
            multiClusterDiv.classList.add('hidden');
        }
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

    displaySimulationInfo(numAgentsAlive, agents) {
        const infoDisplay = document.getElementById('simulationInfo');
        const counts = { random: 0, max_sugar: 0, avoid_crowds: 0 };
        for (let agent of agents) {
            if (agent.isAlive) {
                counts[agent.strategy] = (counts[agent.strategy] || 0) + 1;
            }
        }
        infoDisplay.textContent = `Agents Alive: ${numAgentsAlive} (Random: ${counts.random || 0}, Max Sugar: ${counts.max_sugar || 0}, Avoid Crowds: ${counts.avoid_crowds || 0})`;
    }
}