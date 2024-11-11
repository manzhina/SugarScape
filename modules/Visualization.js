
export class Visualization {
    constructor(grid, agents, canvasId) {
        this.grid = grid;            
        this.agents = agents;      
        this.canvas = document.getElementById(canvasId); 
        this.context = this.canvas.getContext('2d');   
        this.cellSize = 20;         
    }
    initializeCanvas() {
        this.canvas.width = this.grid.width * this.cellSize;
        this.canvas.height = this.grid.height * this.cellSize;
    }

    render() {
        this.clearCanvas();
        this.drawGrid();
        this.drawAgents();
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                const cell = this.grid.getCell(x, y);
                this.context.fillStyle = this.getSugarColor(cell.currentSugar, 5);
                this.context.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                this.context.strokeStyle = '#ccc';
                this.context.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }

    getSugarColor(currentSugar, maxSugar) {
        const intensity = (currentSugar / maxSugar) * 255;
        return `rgb(${255 - intensity}, ${255}, ${255 - intensity})`;
    }

    drawAgents() {
        const agentCounts = Array.from({ length: this.grid.width }, () =>
            Array(this.grid.height).fill(0)
        );

        this.agents.forEach(agent => {
            if (agent.isAlive) {
                agentCounts[agent.position.x][agent.position.y] += 1;
            }
        });

        for (let x = 0; x < this.grid.width; x++) {
            for (let y = 0; y < this.grid.height; y++) {
                const count = agentCounts[x][y];
                if (count > 0) {
                    this.context.fillStyle = 'blue';
                    this.context.font = `${this.cellSize / 2}px Arial`;
                    this.context.textAlign = 'center';
                    this.context.textBaseline = 'middle';
                    this.context.fillText(
                        count > 1 ? count : '●', 
                        x * this.cellSize + this.cellSize / 2,
                        y * this.cellSize + this.cellSize / 2
                    );
                }
            }
        }
    }

    updateCellSize(width, height) {
        this.cellSize = Math.min(
            this.canvas.width / width,
            this.canvas.height / height
        );
    }
}