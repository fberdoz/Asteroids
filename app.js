import Display from  "./src/display.js";
import Controller from  "./src/controller.js";
import Game from  "./src/game.js";
import Engine from  "./src/engine.js";

"use strict";

var controller = new Controller();
var display    = new Display(document.getElementById("playground"));
var game       = new Game();
var engine     = new Engine();

var update = function(timeStep) {

    let nb_active = 0;
    let alpha = 0;

    if (controller.upActive) {game.propulse();}
    else {game.stopPropulsing();} 

    if (controller.leftActive) {game.turnLeft();}
    else {game.stopTurningLeft();} 

    if (controller.rightActive) {game.turnRight();} 
    else {game.stopTurningRight();} 

    if (controller.shouldFire) {
        game.fire();
        controller.shouldFire = false;
    }

    game.update(timeStep);

    if (game.gameOver) {
        engine.stop();
        controller.isActive = false;
        game.reset();
    }

    if (game.lvlOver) {
        engine.stop();
        controller.isActive = false;
        game.nextLevel();
    }

    if (controller.isPaused) {
        engine.stop();
    }

}

var render = function() {
    display.fill(game.world.backgroundcolor)
    display.drawShip(game.ship);
    display.drawBelt(game.belt);
    display.drawBurst(game.burst);
    if (controller.isPaused) {display.writePause();}
    if (!controller.isActive) {display.startInstruction();}
    display.writeLvl(game.lvl);
    display.render();
}

var resize = function(event) {
    const newWidth = document.documentElement.clientWidth;
    const newHeight = document.documentElement.clientHeight;
    game.resize(newWidth, newHeight);
    display.resize(newWidth, newHeight);

    render();
}

engine.render = render;
engine.update = update;

resize()

var keyUpdate = function(event) { 
    controller.keyUpdate(event.type, event.keyCode)
    if (!engine.isRunning && controller.isActive && !controller.isPaused) {engine.start();}
    //else if (engine.isRunning && (!controller.isActive || controller.isPaused)) {engine.stop();}
  };

window.addEventListener("resize",  resize);
window.addEventListener("keydown", keyUpdate);
window.addEventListener("keyup",   keyUpdate);





