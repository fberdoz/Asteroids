export default class Display {

    static LINE_WIDTH = 3;
    static OUTER_SHIP_COLOR = "white";
    static INNER_SHIP_COLOR = "black"
    static OUTER_ASTEROID_COLOR = "lightgrey";
    static INNER_ASTEROID_COLOR = "black";
    static PROJECTILE_COLOR = "white";
    static PROJECTILE_SIZE = 3;
    
    static LARGE_FONT = "50px Audiowide";
    static SMALL_FONT = "25px Audiowide";
    static LINEBREAK = 35; 

    static TEXT_COLOR = "white";

    constructor(canvas) {
        this.buffer  = document.createElement("canvas").getContext("2d"),
        this.ctx = canvas.getContext("2d");
    }

    fill(color) {
        this.buffer.fillStyle = color;
        this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);
    }

    drawShip(ship) {
        
        // Extract variables
        const x = ship.x;
        const y = ship.y;
        const alpha = ship.alpha;
        const span = ship.span;
        const length = ship.length;
        const beta = ship.beta;

        // Thrust drawing
        if (ship.isThrust) {

            // Creating thrusters gradient
            let thrustGradient = this.buffer.createRadialGradient(x, y, (1/8) * span, x, y, (1/2) * span);
            thrustGradient.addColorStop(0, 'red');
            thrustGradient.addColorStop(0.8, 'yellow');
            
            // Sketching thrusters
            this.buffer.beginPath();
            this.buffer.moveTo(x, y)
            this.buffer.arc(x, y, (1/2) * span, beta + alpha, - beta + alpha + 2 * Math.PI);
            this.buffer.closePath();

            // Drawing thrusters
            this.buffer.fillStyle = thrustGradient;
            this.buffer.fill(); 
        }

        // Ship layout
        this.buffer.beginPath();
        this.buffer.moveTo(x, y)
        this.buffer.lineTo(x + Math.cos(alpha - beta) * span, y + Math.sin(alpha - beta) * span); // Left
        this.buffer.lineTo(x + Math.cos(alpha) * length, y + Math.sin(alpha) * length); // Front
        this.buffer.lineTo(x + Math.cos(alpha + beta) * span, y + Math.sin(alpha + beta) * span); // Right
        this.buffer.closePath();

        // Drawing ship contour 
        this.buffer.lineWidth = Display.LINE_WIDTH;
        this.buffer.strokeStyle = Display.OUTER_SHIP_COLOR;
        this.buffer.stroke();
 
        // Coloring ship body
        this.buffer.fillStyle = Display.INNER_SHIP_COLOR;
        this.buffer.fill();
    }

    drawAsteroid(asteroid) {

        // Extract variables
        const x = asteroid.x;
        const y = asteroid.y;
        const alpha = asteroid.alpha;
        const r = asteroid.r;
        const vert = asteroid.vert;
        const offs = asteroid.offs;

        // Sketching the asteroid
        this.buffer.beginPath();
        this.buffer.moveTo(x + r * offs[0] * Math.cos(alpha), y + r * offs[0] * Math.sin(alpha));
        for (let i = 1; i < vert; i++ ) {
            this.buffer.lineTo(x + r * offs[i] * Math.cos(alpha + 2 * Math.PI * i / vert), y + r * offs[i] * Math.sin(alpha + 2 * Math.PI * i / vert));
        }
        this.buffer.closePath();

        // Drawing asteroid edges
        this.buffer.lineWidth = Display.LINE_WIDTH;
        this.buffer.strokeStyle = Display.OUTER_ASTEROID_COLOR;
        this.buffer.stroke();

        // Coloring asteroid body
        this.buffer.fillStyle = Display.INNER_ASTEROID_COLOR;
        this.buffer.fill();

    }

    drawBelt(belt) {
        belt.asteroids.forEach(this.drawAsteroid.bind(this));
    }

    drawProjectile(projectile) {
        this.buffer.fillStyle = Display.PROJECTILE_COLOR;
        this.buffer.fillRect(Math.floor(projectile.x - Display.PROJECTILE_SIZE / 2), Math.floor(projectile.y - Display.PROJECTILE_SIZE / 2),Display.PROJECTILE_SIZE, Display.PROJECTILE_SIZE);
    }

    drawBurst(burst) {
        burst.bullets.forEach(this.drawProjectile.bind(this));
    }

    resize(width, height) {
        this.buffer.canvas.width = width;
        this.buffer.canvas.height = height;
        this.buffer.imageSmoothingEnabled = false;

        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;
        this.ctx.imageSmoothingEnabled = false;
    }

    writePause() {
        this.buffer.font = Display.LARGE_FONT;
        this.buffer.textAlign = "center"
        this.buffer.strokeStyle = Display.TEXT_COLOR;
        this.buffer.strokeText("Pause", this.buffer.canvas.width/2, this.buffer.canvas.height/2);
    }

    startInstruction() {
        this.buffer.font = Display.SMALL_FONT;
        this.buffer.textAlign = "center"
        this.buffer.fillStyle = Display.TEXT_COLOR;
        this.buffer.fillText("Press 'w' to start and thrust", this.buffer.canvas.width / 2, this.buffer.canvas.height * (2/3));
        this.buffer.fillText("Press 'a' and 'd' to turn left and right", this.buffer.canvas.width / 2, this.buffer.canvas.height * (2/3) + Display.LINEBREAK);
        this.buffer.fillText("Press space to shoot", this.buffer.canvas.width / 2, this.buffer.canvas.height * (2/3) + 2*Display.LINEBREAK);
        this.buffer.fillText("Press 'p' to pause", this.buffer.canvas.width / 2, this.buffer.canvas.height * (2/3) + 3*Display.LINEBREAK);
    }

    writeLvl(lvl) {
        this.buffer.font = Display.SMALL_FONT;
        this.buffer.textAlign = "left"
        this.buffer.fillStyle = Display.TEXT_COLOR;
        this.buffer.fillText("Level " + lvl, 20, 30);

    }

    render(){
        this.ctx.drawImage(this.buffer.canvas, 0, 0);   
    }



}