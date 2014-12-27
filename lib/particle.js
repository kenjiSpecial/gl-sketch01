/**
 *
 * Created by kenji-special on 12/27/14.
 */

var border = -2;

var Particle = function(x, y){
    this.x = x;
    this.y = y;
    this.vx = this.vy = this.fx = this.fy = 0;

    this.lineY = window.innerHeight * (Math.random());

};

Particle.prototype = {
    GRAVITYX: 0,
    GRAVITYY: 1.0,
    isReset : false,

    x : null,
    y : null,
    vx : null,
    vy : null,
    fx : null,
    fy : null,

    lineY : window.innerHeight * (.05 +.9*Math.random()),

    density : null,
    pressure : null,
    neighbors : [],
    numNeighbors : 0,

    reset : function(){

        this.isReset = !this.isReset;

        if(this.isReset){

        }else{
            this.vx =  this.fx = this.fy = 0;
            this.vy = .5;

            this.lineY = window.innerHeight * (Math.random());

            this.x = border + (window.innerWidth - 2 * border) * Math.random();
            this.y = -200  * Math.random();
        }



    },

    update : function(){
        this.vx += this.GRAVITYX;
        this.vy += this.GRAVITYY;

        this.vx += this.fx;
        this.vy += this.fy;

        this.x += this.vx;
        this.y += this.vy;


        if(this.x < border)
            this.vx += border - this.x;
        /**
        if(this.y < border)
            this.vy += border - this.y;
         */

        if( this.x > window.innerWidth - border)
            this.vx += window.innerWidth - border- this.x;


        //if(!this.isReset) {
            if (this.y > this.lineY)
                this.vy += this.lineY- this.y;
        //}


    }

};


module.exports = Particle;
