   /*
    *Sets buffers to load all of the position and color information for the boid model.
    */
    setupBoidBuffers = function (boidVertexPositionBuffer,boidVertexColorBuffer,gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, boidVertexPositionBuffer);
        var vertices = [
            // Front face1
             0.0,  1.0,  0.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,

            // Right face1
             0.0,  1.0,  0.0,
             1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,

            // Back face1
             0.0,  1.0,  0.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,

            // Left face1
             0.0,  1.0,  0.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,

             // Front face2
             0.0, -5.0,  0.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face2
             0.0,  -5.0,  0.0,
             1.0,  -1.0, -1.0,
             1.0,  -1.0,  1.0,

            // Back face2
             0.0,  -5.0,  0.0,
             -1.0, -1.0, -1.0,
             1.0,  -1.0, -1.0,

            // Left face
             0.0,  -5.0,  0.0,
             -1.0, -1.0,  1.0,
            -1.0, -1.0, -1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        boidVertexPositionBuffer.itemSize = 3;
        boidVertexPositionBuffer.numItems = 24;

        //boidVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boidVertexColorBuffer);
        var colors = [
            // Front face
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,

            // Right face
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            // Back face
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Left face
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,

            // Front face
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,

            // Right face
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            // Back face
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Left face
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        boidVertexColorBuffer.itemSize = 4;
        boidVertexColorBuffer.numItems = 24;
    };