export default class Engine {
    
    constructor() {

        this.lastTime = undefined;
        this.render = undefined;
        this.update = undefined;
        this.AFR = undefined;
        this.isRunning = false;

    }


    run(timeStamp) {
        
        let deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        this.AFR = window.requestAnimationFrame(this.run.bind(this));

        this.update(deltaTime);
        this.render();
    }

    
    start() {
        this.lastTime = window.performance.now();
        this.AFR = window.requestAnimationFrame(this.run.bind(this));
        this.isRunning = true;
    }

    stop() {
        window.cancelAnimationFrame(this.AFR);
        this.isRunning = false;
    }


        
    
}