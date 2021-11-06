

class Ship {
    static RELOADING_TIME = 1; // Time between firing

    constructor(){
        // Geommetry
        this.length = 20; // Size from center to nose in px
        this.span = 12; // Wing span in px
        this.beta = (2/3) * Math.PI // Wing angle in rad

        // State
        this.isThrust = false; // Thrusters activated
        this.isTurningLeft = false; // Rotation left
        this.isTurningLeft = false; // Rotation right
        this.hasCollided = false; // Collision with asteroid

        // Cinetic
        this.x = document.documentElement.clientWidth / 2; // Horizontal position in px
        this.y = document.documentElement.clientHeight / 2; // Vertical position in px
        this.vx = 0; // Horizontal velocity in px/s
        this.vy = 0; // Vertical velocity in px/s
        this.alpha = - Math.PI / 2; // Orientation in rad
        
        // Dynamic
        this.roatationalThrust = Math.PI; // Rotational speed in rad/s
        this.mass = 1; // Mass of the ship in kg
        this.thrust = 200; // Thrust of the ship in kg*px/ s^2

        // Weponry
        this.lastShot = 0;

    }

    frontCoord() {
        return [this.x + Math.cos(this.alpha) * this.length, this.y + Math.sin(this.alpha) * this.length];
        console.log("Frontal collision");
    }

    leftCoord() {
        return [this.x + Math.cos(this.alpha - this.beta) * this.span, this.y + Math.sin(this.alpha - this.beta) * this.span];
        console.log("Left collision");
    }

    rightCoord() {
        return [this.x + Math.cos(this.alpha + this.beta) * this.span, this.y + Math.sin(this.alpha + this.beta) * this.span];
    }

    update(timeStep, world) {

        // Updating orientation (without inertia)
        let valpha = 0;
        if (this.isTurningRight) {
            valpha += this.roatationalThrust;}
        if (this.isTurningLeft) {
            valpha -= this.roatationalThrust;}
        this.alpha += valpha * (timeStep/1000);

        // Updating velocities (with inertia)
        if (this.isThrust) {
            this.vx += (this.thrust / this.mass) * Math.cos(this.alpha) * (timeStep/1000);
            this.vy += (this.thrust / this.mass) * Math.sin(this.alpha) * (timeStep/1000);
        }
        // Updating positions (with inertia)
        this.x += this.vx * (timeStep/1000);
        this.y += this.vy * (timeStep/1000);

        // Edge collision management
        world.edgeManagement(this);
    }

}

class Asteroid {

    static VELOCITY = 30; // Average initial velocity in px/s
    static ROTATION = 0.5 * Math.PI; // Maximum (absolute) roatational speed
    static LEVEL_MULTIPLYER = 1.2 // Velocity increase between levels
    static OFFSET = 0.4; // Randomness of the offset (0: perfect polygons, 1: highest randomness)
    static MIN_VERT = 6; // Minimal number of verticies
    static MAX_VERT = 15; // Maximal number of verticies
    
    constructor(x, y, r, lvl) {
        // Meta
        this.lvl = lvl;
        this.hasExploded = false; 

        // Cinetic
        this.x = x;
        this.y = y;
        this.vx = 2 * (Math.random() - 0.5) * Asteroid.VELOCITY * (Math.pow(Asteroid.LEVEL_MULTIPLYER, this.lvl));
        this.vy = 2 * (Math.random() - 0.5) * Asteroid.VELOCITY * (Math.pow(Asteroid.LEVEL_MULTIPLYER, this.lvl));
        this.alpha = Math.random() * 2 * Math.PI;
        this.valpha =  2 * (Math.random() - 0.5) * Asteroid.ROTATION;

        // Geometry
        this.r = r
        this.vert = Math.floor(Asteroid.MIN_VERT + Math.random() * (Asteroid.MAX_VERT - Asteroid.MIN_VERT));
        this.offs = [];
        for (let i = 0; i < this.vert; i++) {
            this.offs.push(1 + 2 * (Math.random() - (1/2)) * Asteroid.OFFSET);
        }

    }

    update(timeStep, world) {
        this.x += this.vx * (timeStep/1000);
        this.y += this.vy * (timeStep/1000);
        this.alpha += this.valpha * (timeStep/1000);

        // Edge collision management
        world.edgeManagement(this);
    }

    collisionManagement(ship) {
        const [xFront, yFront] = ship.frontCoord();
        const [xLeft, yLeft] = ship.leftCoord();
        const [xRight, yRight] = ship.rightCoord();

        if (Math.sqrt(Math.pow(this.x - xFront, 2) + Math.pow(this.y - yFront, 2)) < this.r ||
            Math.sqrt(Math.pow(this.x - xLeft, 2) + Math.pow(this.y - yLeft, 2)) < this.r ||
            Math.sqrt(Math.pow(this.x - xRight, 2) + Math.pow(this.y - yRight, 2)) < this.r ) {
                ship.hasCollided = true;
                console.log("Collision");
            }
    }

    explosionManagement(burst) {
        for (let i = 0; i < burst.bullets.length; i++) {
            if (Math.sqrt(Math.pow(this.x-burst.bullets[i].x, 2) + Math.pow(this.y-burst.bullets[i].y, 2)) < this.r) {
                burst.bullets[i].hasReached = true;
                this.hasExploded = true;
            }
        }

    }
}

class AsteroidsBelt {
    static NB = 5; // Average initial number of asteroids
    static STD_NB = 2; // Variance of the initial number of asteroids
    static LEVEL_MULTIPLYER = 1.2; // Nb of asteroids increase between levels
    static MIN_R_I = 20; // Minimal initial asteroid radius 
    static MAX_R_I = 50; // Maxiimal initial asteroid radius 
    static MIN_R = 10; // Minimal asteroid radius
    static NB_CHILDREN = 0.05; // Fraction of the size in px of the parent asteroid

    constructor(lvl, world, ship) {
        // Meta
        this.lvl = lvl

        // Belt properties
        this.nb = Math.floor((AsteroidsBelt.NB + 2 * (Math.random() - 0.5) * AsteroidsBelt.STD_NB ) * Math.pow(AsteroidsBelt.LEVEL_MULTIPLYER, this.lvl));

        // Populating the belt
        this.asteroids = []

        let i = 0;
        let safety = 0;
        while (i < this.nb && safety < 1000) {
            const r = AsteroidsBelt.MIN_R_I + Math.random() * (AsteroidsBelt.MAX_R_I - AsteroidsBelt.MIN_R_I);
            const x = r + Math.random() * (world.width -r);
            const y = r + Math.random() * (world.height - r);
            
            if (Math.sqrt(Math.pow(x - ship.x, 2) + Math.pow(y - ship.y, 2)) > 2 * r ) {
                this.asteroids.push(new Asteroid(x, y, r, this.lvl))
                i++;
            }
            safety++
        }
    }

    destroys(i) {
        // Deleting old asteroid
        let [oldAsteroid] = this.asteroids.splice(i, 1); 
        this.nb --;

        // Creating children if old asteroid was big enough
        if (oldAsteroid.r > 2 * AsteroidsBelt.MIN_R) {
            let nbChildren = Math.floor(oldAsteroid.r * AsteroidsBelt.NB_CHILDREN);
            for (let j = 0; j < nbChildren; j++) {
                let rChild = AsteroidsBelt.MIN_R + Math.random() * (oldAsteroid.r - AsteroidsBelt.MIN_R);
                this.asteroids.push(new Asteroid(oldAsteroid.x, oldAsteroid.y, rChild, oldAsteroid.lvl))
                this.nb ++;
            }
        }

    }
    
    update(timeStep, world, ship, burst) {
        for (let i = 0; i < this.nb; i++) {
            this.asteroids[i].update(timeStep, world);
            this.asteroids[i].collisionManagement(ship);
            this.asteroids[i].explosionManagement(burst);
            if (this.asteroids[i].hasExploded) {
                this.destroys(i);
            }
        }
    }

}

class Projectile {
    static VELOCITY = 300; // Velocity in px/s;
    static RANGE = 0.8; // Fraction of max of the world witdth and height 

    constructor(x, y, alpha) {
        this.x = x;
        this.y = y;
        this.alpha = alpha;
        this.distTravelled = 0;
        this.hasReached = false;
    }

    update(timeStep, world) {
        this.x += Projectile.VELOCITY * Math.cos(this.alpha) * (timeStep/1000);
        this.y += Projectile.VELOCITY * Math.sin(this.alpha) * (timeStep/1000);
        this.distTravelled += Projectile.VELOCITY * (timeStep/1000);
        world.edgeManagement(this)
    }

}

class Burst {

    constructor() {
        this.bullets = [];
    }

    update(timeStep, world) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update(timeStep, world);
            if (this.bullets[i].distTravelled > Projectile.RANGE * Math.min(world.width, world.height) || this.bullets[i].hasReached) {
                this.bullets.splice(i, 1);
            }
        }

    }
}

class Score {

}

class World {
    constructor() {
        this.width = document.documentElement.clientWidth;
        this.height = document.documentElement.clientHeight;
        this.backgroundcolor = "black";
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    edgeManagement(obj) {

        // Edge collision management
        if (obj.x < 0) {
            obj.x = (obj.x % this.width) + this.width;}
        else {
            obj.x = obj.x % this.width;}
        
        if (obj.y < 0) {
            obj.y = (obj.y % this.height) + this.height;}
        else {
            obj.y = obj.y % this.height;}
    }
}

export default class Game {
    constructor() {
        // Meta
        this.lvl = 0;
        this.gameOver = false;
        this.lvlOver = false;

        // World
        this.world = new World();

        // Ship
        this.ship = new Ship();

        // Asteroid belt
        this.belt = new AsteroidsBelt(0, this.world, this.ship);

        // Projectiles
        this.burst = new Burst();

    }

    turnRight() {
        this.ship.isTurningRight = true;
    }

    stopTurningRight() {
        this.ship.isTurningRight = false;
    }

    turnLeft() {
        this.ship.isTurningLeft = true;
    }

    stopTurningLeft() {
        this.ship.isTurningLeft = false;
    }

    propulse() {
        this.ship.isThrust = true;
    }

    stopPropulsing() {
        this.ship.isThrust = false;
    }

    fire() {
        const [xFront, yFront] = this.ship.frontCoord();
        this.burst.bullets.push(new Projectile(xFront, yFront, this.ship.alpha));
    }

    resize(width, height) {
        this.world.resize(width, height);
    }

    reset() { 
        this.gameOver = false;
        this.lvl = 0;
        this.ship = new Ship()
        this.belt = new AsteroidsBelt(0, this.world, this.ship);
        this.burst = new Burst();
    }

    nextLevel() {
        this.lvlOver = false;
        this.lvl ++;
        this.belt = new AsteroidsBelt(this.lvl, this.world, this.ship);
        this.burst = new Burst();

    }

    update(timeStep) {
        this.ship.update(timeStep, this.world);
        this.burst.update(timeStep, this.world);
        this.belt.update(timeStep, this.world, this.ship, this.burst);

        if (this.ship.hasCollided) {this.gameOver = true;}
        if (this.belt.nb == 0) {this.lvlOver = true;}
    }
    
}