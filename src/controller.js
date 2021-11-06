export default class Controller {
    constructor(){
        // Main switch
        this.isActive = false
        this.isPaused = false

        // Directions
        this.leftActive = false;
        this.rightActive = false;
        this.upActive = false;

        // Shooting
        this.shouldFire = false;
    }

    keyUpdate(type, keyCode) {
        
        switch(keyCode){
            case 87:    // w
                switch(type) {
                    case "keydown":
                        this.upActive = true; 
                        if (this.isActive == false) {this.isActive = true;} // Start game round
                        if (this.isPaused == true) {this.isPaused = false;} // Resume game
                        break;
                    case "keyup": this.upActive = false; break;
                }
                break;

            case 68:    // d
                switch(type) {
                    case "keydown": this.rightActive = true; break;
                    case "keyup": this.rightActive = false; break;
                }
                break;   

            case 65:    // a
                switch(type) {
                    case "keydown": this.leftActive = true; break;
                    case "keyup": this.leftActive = false; break;
                }
                break;

            case 32:    // " "
                switch(type) {
                    case "keydown": this.shouldFire = true; break;} // Firing
                break;
            case 80:    // p
                switch(type) {
                    case "keydown": this.isPaused = !this.isPaused; break;} // Pause and resume
                break;

        }
        

    }
}