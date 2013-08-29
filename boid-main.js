//Generator Constants
NUM_FLOCKS = 5;
NUM_FLOCK_VARS = 7;
MAX_ADDED_FLOCK_MEMBERS = 15;
MIN_FLOCK_SIZE = 5;
MIN_FLOCK_CENTER = -50;
MAX_FLOCK_CENTER_OFFSET = 100;
MIN_INIT_VEL = -10;
MAX_ADDED_INIT_VEL = 20;
MIN_MAX_VEL = 2;
MAX_ADDED_MAX_VEL = 23;
MIN_FORCE = 100;
MAX_ADDED_FORCE = 100;
MIN_WEIGHT = 10;
MAX_ADDED_WEIGHT = 20;
MIN_DISTANCE = 1;
MAX_ADDED_DISTANCE = 19;


//Shared Variables
boxHW = 22.0;
halfWidths = [72.0,72.0,60.0];
MAX_FORCE = 155;
MAX_SPEED = 15.0;
spread = 5
buffer = 10.0;

var gl;

/*
 *Initialize WebGL and store a reference in the gl var.
 */
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

/*
 *Finds the target shader as a HTML component and compiles it.
 */
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

/*
 * Initialize the shaders and register them with WebGL.
 */
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);//registered with WebGL
    
    //Store shader attribute locations in a safe place in the shader program
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create(); //Model View Matrix
var mvMatrixStack = [];
var pMatrix = mat4.create(); //Perspective Matrix

/*
 *Push the current MV matrix on the stack
 */
function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

/*
 *Pop the last pushed MV matrix off the stack
 */
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

/*
 *Update the matrices in the shader program.
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/*
 * Convert degrees to radians.
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


var boidVertexPositionBuffer;
var boidVertexColorBuffer;

var wallVertexPositionBuffer;
var wallVertexColorBuffer;

/*
 *Create the boid and wall buffers.
 */
function initBuffers() {
    boidVertexPositionBuffer = gl.createBuffer();
    boidVertexColorBuffer = gl.createBuffer();
    setupPyramidBuffers(boidVertexPositionBuffer,boidVertexColorBuffer,gl);

    wallVertexPositionBuffer = gl.createBuffer();
    wallVertexColorBuffer = gl.createBuffer();
    setupWallBuffers(wallVertexPositionBuffer,wallVertexColorBuffer,gl);
}

var boids = [];
/*
 * Load a default boid simulation.
 */
function initBoids(){
    boids[0] = spawnFlock([-55,5.0,0],[3,0,0],20,0);
    boids[0]= boids[0].concat(spawnFlock([55,5.0,0],[-3,0,0],20,0));
    boids[0]= boids[0].concat(spawnFlock([0,-15.0,0],[-5,2,5],10,0));
    boids[0]= boids[0].concat(spawnFlock([2,45.0,0],[5,-2,-5],10,0));
    boids[0]= boids[0].concat(spawnFlock([-20,-55.0,20],[-2,1,-5],10,0));
    linkBehavior(boids[0],20.6,8.0,180,seperation);
    linkBehavior(boids[0],20.6,15.0,180,cohesion);
    linkBehavior(boids[0],20.5,5,180,alignment);

    //linkBehavior(boids[1],0.6,3.0,180,seperation);
    //linkBehavior(boids[1],0.6,15.0,180,cohesion);
    //linkBehavior(boids[1],0.5,20,180,alignment);

}

/*
 *Supply an array of 43 numbers between 0 and 1 to load a boid simulation.
 */
function loadBoids(parms){
    boids[0] = [];
    for(var i=0;i<NUM_FLOCKS;i++){
        var flockSize = MIN_FLOCK_SIZE + Math.round(parms[i*NUM_FLOCK_VARS] * MAX_ADDED_FLOCK_MEMBERS);
        var flockCenterX = MIN_FLOCK_CENTER + Math.round(parms[i*NUM_FLOCK_VARS+1] * MAX_FLOCK_CENTER_OFFSET);
        var flockCenterY = MIN_FLOCK_CENTER + Math.round(parms[i*NUM_FLOCK_VARS+2] * MAX_FLOCK_CENTER_OFFSET);
        var flockCenterZ = MIN_FLOCK_CENTER + Math.round(parms[i*NUM_FLOCK_VARS+3] * MAX_FLOCK_CENTER_OFFSET);
        var flockInitVelX = MIN_INIT_VEL + Math.round(parms[i*NUM_FLOCK_VARS+4] * MAX_ADDED_INIT_VEL);
        var flockInitVelY = MIN_INIT_VEL + Math.round(parms[i*NUM_FLOCK_VARS+5] * MAX_ADDED_INIT_VEL);
        var flockInitVelZ = MIN_INIT_VEL + Math.round(parms[i*NUM_FLOCK_VARS+6] * MAX_ADDED_INIT_VEL);
        var center = [flockCenterX,flockCenterY,flockCenterZ];
        var vel = [flockInitVelX,flockInitVelY,flockInitVelZ];
        boids[0] = boids[0].concat(spawnFlock(center,vel,flockSize,0));
    }
    //Determine the properties of the stearing forces
    var separationWeight = MIN_WEIGHT + Math.round(parms[NUM_FLOCKS*NUM_FLOCK_VARS] * MAX_ADDED_WEIGHT);
    var separationDistance = MIN_DISTANCE + Math.round(parms[(NUM_FLOCKS*NUM_FLOCK_VARS) + 1] * MAX_ADDED_DISTANCE);
    var cohesionWeight = MIN_WEIGHT + Math.round(parms[(NUM_FLOCKS*NUM_FLOCK_VARS) + 2] * MAX_ADDED_WEIGHT);
    var cohesionDistance = MIN_DISTANCE + Math.round(parms[(NUM_FLOCKS*NUM_FLOCK_VARS) + 3] * MAX_ADDED_DISTANCE);
    var alignmentWeight = MIN_WEIGHT + Math.round(parms[(NUM_FLOCKS*NUM_FLOCK_VARS) + 4] * MAX_ADDED_WEIGHT);
    var alignmentDistance = MIN_DISTANCE + Math.round(parms[(NUM_FLOCKS*NUM_FLOCK_VARS) + 5] * MAX_ADDED_DISTANCE);
    linkBehavior(boids[0],separationWeight,separationDistance,180,seperation);
    linkBehavior(boids[0],cohesionWeight,cohesionDistance,180,cohesion);
    linkBehavior(boids[0],alignmentWeight,alignmentDistance,180,alignment);

    //Set environmental properties
    MAX_SPEED = MIN_MAX_VEL + Math.round(parms[(NUM_FLOCKS*NUM_FLOCK_VARS)+6] * MAX_ADDED_MAX_VEL);
    MAX_FORCE = MIN_FORCE + Math.round(parms[(NUM_FLOCKS*NUM_FLOCK_VARS)+7] * MAX_ADDED_FORCE);
}

/*
 *Clears the current boid simulation.
 */
function clearBoids(){
    boids = [];
}

/*
 * Renders the current frame.
 */
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(70, gl.viewportWidth / gl.viewportHeight, 0.1, 300.0, pMatrix);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -100.0]);

    // draw walls
    gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, wallVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, wallVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
      setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, wallVertexPositionBuffer.numItems);

    // draw boids
    gl.bindBuffer(gl.ARRAY_BUFFER, boidVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, boidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, boidVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, boidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    for (var j=0; j<boids.length; j++){ // for each flock
        for(var i=0; i < boids[j].length; i++){
            //mat4.translate(mvMatrix, [-1.5, 0.0, -8.0]);
            mvPushMatrix();
            //mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);
            var boidTransform = boids[j][i].getTransformation();
            mat4.multiply(mvMatrix, boidTransform,mvMatrix);
            mat4.rotate(mvMatrix, degToRad(-90), [0, 0, 1]);
            setMatrixUniforms();
            gl.drawArrays(gl.TRIANGLES, 0, boidVertexPositionBuffer.numItems);
            mvPopMatrix();
        }
    }
}


var lastTime = 0;

/*
 *Updates the boid simulation
 */
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = (timeNow - lastTime)/1000;
        for (var j=0; j<boids.length; j++){ // for each flock
            for(var i=0; i < boids[j].length; i++){
               boids[j][i].update(elapsed);
               //console.log("boid["+i +"] pos:["+boids[i].position[0]+","+boids[i].position[1]+","+boids[i].position[2]+"]");
               //console.log("boid["+i +"] up:["+boids[i].up[0]+","+boids[i].up[1]+","+boids[i].up[2]+"]");
               //console.log("boid["+i +"] forward:["+boids[i].forward[0]+","+boids[i].forward[1]+","+boids[i].forward[2]+"]");

            }
        }
        for (var j=0; j<boids.length; j++){ // for each flock
            for(var i=0; i < boids[j].length; i++){
                boids[j][i].updateStearing(boids[j],elapsed);
            }
        }
    }
    lastTime = timeNow;
}

/*
 *The main loop.
 */
function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}

/*
 *Kicks off startup
 */
function webGLStart() {
    var canvas = document.getElementById("BoidTest");
    initGL(canvas);
    initShaders()
    initBuffers();
    //initBoids();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}

/*
 * Wall buffer information.
 */
setupWallBuffers = function (wallVertexPositionBuffer,wallVertexColorBuffer,gl) {
    var hwx = halfWidths[0];
    var hwy = halfWidths[1];
    var hwz = halfWidths[2];
    // wall vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexPositionBuffer);
    var vertices = [
        // Rear wall
        -hwx,  hwy, -hwz,
        -hwx, -hwy, -hwz,
         hwx,  hwy, -hwz,

        -hwx, -hwy, -hwz,
         hwx, -hwy, -hwz,
         hwx,  hwy, -hwz,

         // Left Wall
        -hwx, hwy, hwz,
        -hwx, -hwy, hwx,
        -hwx, -hwy, -hwz,

        -hwx, hwy, hwz,
        -hwx, -hwy, -hwz,
        -hwx, hwy, -hwz,

        // Right Wall
         hwx, hwy, hwz,
         hwx, -hwy, hwx,
         hwx, -hwy, -hwz,

         hwx, hwy, hwz,
         hwx, -hwy, -hwz,
         hwx, hwy, -hwz,

         // Bottom Wall
         -hwx, -hwy, -hwz,
         -hwx, -hwy, hwz,
         hwx, -hwy, -hwz,
         -hwx, -hwy, hwz, 
         hwx, -hwy, hwz,
         hwx, -hwy, -hwz,

         // Top Wall
         -hwx, hwy, -hwz,
         -hwx, hwy, hwz,
         hwx, hwy, -hwz,
         -hwx, hwy, hwz, 
         hwx, hwy, hwz,
         hwx, hwy, -hwz
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    wallVertexPositionBuffer.itemSize = 3;
    wallVertexPositionBuffer.numItems = 30;

    // wall colors
    gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexColorBuffer);
    var colors = [
        // Rear Wall
        0.1, 0.0, 0.1, 1.0,
        0.12, 0.0, 0.12, 1.0,
        0.1, 0.0, 0.1, 1.0,
        0.12, 0.0, 0.12, 1.0,
        0.1, 0.0, 0.1, 1.0,
        0.1, 0.0, 0.1, 1.0,

        // Left wall
        0.15, 0.0, 0.15, 1.0,
        0.1, 0.0, 0.1, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.1, 0.0, 0.1, 1.0,

        // Right wall
        0.15, 0.0, 0.15, 1.0,
        0.1, 0.0, 0.1, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.1, 0.0, 0.1, 1.0,

        // Bottom Wall
        0.15, 0.0, 0.15, 1.0,
        0.20, 0.0, 0.20, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.20, 0.0, 0.20, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.15, 0.0, 0.15, 1.0,

        // Top Wall
        0.15, 0.0, 0.15, 1.0,
        0.20, 0.0, 0.20, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.20, 0.0, 0.20, 1.0,
        0.15, 0.0, 0.15, 1.0,
        0.15, 0.0, 0.15, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    wallVertexColorBuffer.itemSize = 4;
    wallVertexColorBuffer.numItems = 30;
};