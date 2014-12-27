/**
 * This is the pen.
 *
 * @package ks-gl-sketch04
 * @author Kenji Saito <k.saito.1985@gmail.com>
 */

var PT_NUMBER = 2000;

// --------------------------

var GRAVITY = 0.05;//重力
var RANGE = 50;//影響半径
var RANGE2 = RANGE * RANGE;//影響半径の二乗
var DENSITY = 1;//流体の密度
var PRESSURE = 2;//圧力係数
var VISCOSITY = 0.075;//粘性係数

// --------------------------

var positionLocation, colorLocation;
var resolutionLocation, colorLocation;

var ksGl = require("ks-gl-initializer");
var Particle = require("./particle");


var canvas = document.getElementById("c");
console.log(canvas)
var gl = ksGl.setupWebGL(canvas, {width: window.innerWidth, height: window.innerHeight});

if (!gl) return;

// setup GLSL program

var program = ksGl.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);
gl.useProgram(program);



positionLocation = gl.getAttribLocation(program, "a_position");
colorLocation = gl.getAttribLocation(program, "a_color");

resolutionLocation = gl.getUniformLocation(program, "u_resolution");

var buffer = gl.createBuffer();




var colbuffer = gl.createBuffer();

//gl.enableVertexAttribArray(colorLocation);





gl.uniform2f(resolutionLocation, window.innerWidth, window.innerHeight);


//var points = [];
var particles = [];
var pts = [];
var cols = [];

for(var ii = 0; ii < PT_NUMBER; ii++){
    var xPos = Math.random() * window.innerWidth;
    var yPos = (Math.random() * .1 +.1) * window.innerHeight;

    var _particle = new Particle(xPos, yPos);
    _particle.vy = 5;
    particles.push(_particle)
}
var count = 0;

loop();
//changeGravity();
setTimeout(reset, 4000);

function loop(){
    move();

    pts = [];
    cols = [];
    for(var ii = 0; ii < particles.length; ii++){

        pts.push(particles[ii].x);
        pts.push(particles[ii].y);

        var vel = Math.sqrt(particles[ii].vx * particles[ii].vx + particles[ii].vy * particles[ii].vy)/5;
        if(vel > 1.0) vel = 1.0;
        //else if(vel < .1) vel = .1;
        vel *= vel;
        if(vel < .1) vel = 0.1;

        cols.push(vel);
        cols.push(vel);
        cols.push(vel);
    }
    pts = new Float32Array(pts);
    cols = new Float32Array(cols);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);


    gl.bindBuffer(gl.ARRAY_BUFFER, colbuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, cols, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);

    gl.drawArrays(gl.POINTS, 0, pts.length/2);
    gl.flush();

    requestAnimationFrame(loop);
}

function reset(){
    count++;

    for(ii = 0; ii < particles.length; ii++){
        particles[ii].reset();
    }

    if(count % 2 == 0) setTimeout(reset, 3000);
        else setTimeout(reset, 1000);
}

function move(){
    var ii, jj;
    var pi, pj;
    var dx;
    var dy;
    var weight;
    var dist;
    var pressureWeight;
    var viscosityWeight;

    for(ii = 0; ii < particles.length; ii++){
        pi = particles[ii];
        pi.numNeighbors = 0;
        pi.neighbors = [];

        for(jj = 0; jj < ii; jj++){
            pj = particles[jj];

            if((pi.x - pj.x) * (pi.x - pj.x) + (pi.y - pj.y) * (pi.y - pj.y) < RANGE2) {
                pi.neighbors[pi.numNeighbors++] = pj;
                pj.neighbors[pj.numNeighbors++] = pi;
            }
        }
    }


    //console.log(particles[0].numNeighbors);



    // ================================

    for(ii = 0; ii < particles.length; ii++){
        pi = particles[ii];
        pi.density = 0;

        for(jj = 0; jj < pi.numNeighbors; jj++){
            pj = pi.neighbors[jj];

            dist = Math.sqrt((pi.x - pj.x) * (pi.x - pj.x) + (pi.y - pj.y) * (pi.y - pj.y));
            pi.density += (1 - dist / RANGE) * (1 - dist / RANGE);
        }

        if(pi.density < DENSITY)
            pi.density = DENSITY;
        pi.pressure = pi.density - DENSITY;

    }

    // ================================

    for(ii = 0; ii < particles.length; ii++){
        pi = particles[ii];
        pi.fx = 0;
        pi.fy = 0;

        for(jj = 0; jj < pi.numNeighbors; jj++){
            pj = pi.neighbors[jj];

            dx = pi.x - pj.x;
            dy = pi.y - pj.y;
            dist = Math.sqrt(dx * dx + dy * dy);
            weight = 1 - dist / RANGE;
            pressureWeight = weight * (pi.pressure + pj.pressure) / (2 * pj.density) * PRESSURE;
            dist = 1 / dist;
            dx *= dist;
            dy *= dist;
            pi.fx += dx * pressureWeight;
            pi.fy += dy * pressureWeight;
            viscosityWeight = weight / pj.density * VISCOSITY;
            dx = pi.vx - pj.vx;
            dy = pi.vy - pj.vy;
            pi.fx -= dx * viscosityWeight;
            pi.fy -= dy * viscosityWeight;
        }

    }

    // ================================

    for(ii = 0; ii < particles.length; ii++){
        particles[ii].update();
    }

}
