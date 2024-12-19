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
        this.context.globalAlpha = 1.0; 
        for (let agent of this.agents) {
            if (agent.isAlive) {
                const x = agent.position.x;
                const y = agent.position.y;

                let color;
                if (agent.strategy === 'random') {
                    color = 'red';
                } else if (agent.strategy === 'max_sugar') {
                    color = 'blue';
                } else if (agent.strategy === 'avoid_crowds') {
                    color = 'black';
                } else {
                    color = 'blue';
                }

                this.context.fillStyle = color;
                this.context.beginPath();
                this.context.arc(
                    x * this.cellSize + this.cellSize / 2,
                    y * this.cellSize + this.cellSize / 2,
                    this.cellSize / 3,
                    0,
                    2 * Math.PI
                );
                this.context.fill();
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