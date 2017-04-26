
//////////////////////////////////////////////////////////////////
//
//  This example is similar to code03.html, but I am showing you how to
//  use gl elemenntary array, i.e, triangle indices, to draw faces 
//

var gl;
var shaderProgram;


//////////// Init OpenGL Context etc. ///////////////

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

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    var modelVertexPositionBuffer;
    var modelVertexNormalBuffer;
    var modelVertexIndexBuffer;
    var model_ambient = [0, 0, 0, 1]; 
  	var	model_diffuse= [0.7, 0.7, 0.7, 1]; 
  	var	model_specular = [.9, .9, .9,1]; 
  	var	model_shine = [50];
    


   ////////////////    Initialize VBO  ////////////////////////

    function initBuffers() {
        var request = new XMLHttpRequest();
    	request.open("GET", "bumblebee.json");
    	request.onreadystatechange =
      	function () {
          	if (request.readyState == 4) {
              	console.log("state =" + request.readyState);
              	handleLoadedModel(JSON.parse(request.responseText));
          	}
      	}
   		request.send();
    }

    function handleLoadedModel(modelData) {
		console.log(" in handleLoadedModel");
		console.leg("Data:" + modelData);
		/*
		teapotVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexPositions), gl.STATIC_DRAW);
		teapotVertexPositionBuffer.itemSize = 3;
		teapotVertexPositionBuffer.numItems = teapotData.vertexPositions.length / 3;

		teapotVertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexNormals), gl.STATIC_DRAW);
		teapotVertexNormalBuffer.itemSize = 3;
		teapotVertexNormalBuffer.numItems = teapotData.vertexNormals.length / 3;

		teapotVertexTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexTextureCoords),
			  gl.STATIC_DRAW);
		teapotVertexTextureCoordBuffer.itemSize = 2;
		teapotVertexTextureCoordBuffer.numItems = teapotData.vertexTextureCoords.length / 2;

		teapotVertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapotData.indices), gl.STATIC_DRAW);
		teapotVertexIndexBuffer.itemSize = 1;
		teapotVertexIndexBuffer.numItems = teapotData.indices.length;

		find_range(teapotData.vertexPositions);

		drawScene();
		*/

	}

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////

    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create();  // model matrix
    var pMatrix = mat4.create();  //projection matrix 
    var cameraRotateMatrix = mat4.create();
    var cameraPosition = vec3.create();
    var COI = vec3.create();
    var lightPosition = vec3.create();
    var lightAmbient = [];
    var lightDiffuse = [];
	var lightSpecular = []; 
	var textureOption = 1;

    function setMatrixUniforms(inmMatrix, invMatrix, inpMatrix, innMatrix) {
        gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, inmMatrix);
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, invMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, inpMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, innMatrix);
    }

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }

     function draw_object(vpbuffer, vnbuffer, vibuffer, inmMatrix, inpMatrix, mat_ambient, mat_diffuse, mat_specular, mat_shine) {

		var nMatrix = mat4.create();
		mat4.identity(nMatrix); 
		nMatrix = mat4.multiply(nMatrix, vMatrix);
		nMatrix = mat4.multiply(nMatrix, inmMatrix); 	
		nMatrix = mat4.inverse(nMatrix);
		nMatrix = mat4.transpose(nMatrix); 
        setMatrixUniforms(inmMatrix, vMatrix, inpMatrix, nMatrix);

        gl.uniform4f(shaderProgram.light_posUniform,lightPosition[0], lightPosition[1], lightPosition[2], 1.0); 	
		gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
		gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
		gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
		gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 

		gl.uniform4f(shaderProgram.light_ambientUniform, lightAmbient[0], lightAmbient[1], lightAmbient[2], 1.0); 
		gl.uniform4f(shaderProgram.light_diffuseUniform, lightDiffuse[0], lightDiffuse[1], lightDiffuse[2], 1.0); 
		gl.uniform4f(shaderProgram.light_specularUniform, lightSpecular[0], lightSpecular[1], lightSpecular[2],1.0); 

        gl.bindBuffer(gl.ARRAY_BUFFER, vpbuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, vnbuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vibuffer);
		gl.drawElements(gl.TRIANGLES, vibuffer.numItems, gl.UNSIGNED_SHORT, 0);

    }

    ///////////////////////////////////////////////////////////////

    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        vMatrix = mat4.lookAt(cameraPosition, COI, [0,1,0], vMatrix);
        mat4.multiply(cameraRotateMatrix, vMatrix, vMatrix);
 

        

    }


    ///////////////////////////////////////////////////////////////

     var lastMouseX = 0, lastMouseY = 0;

    ///////////////////////////////////////////////////////////////

     function onDocumentMouseDown( event ) {
          event.preventDefault();
          document.addEventListener( 'mousemove', onDocumentMouseMove, false );
          document.addEventListener( 'mouseup', onDocumentMouseUp, false );
          document.addEventListener( 'mouseout', onDocumentMouseOut, false );
          var mouseX = event.clientX;
          var mouseY = event.clientY;

          lastMouseX = mouseX;
          lastMouseY = mouseY; 

      }

     function onDocumentMouseMove( event ) {
          var mouseX = event.clientX;
          var mouseY = event.ClientY; 

          var diffX = mouseX - lastMouseX;
          var diffY = mouseY - lastMouseY;

          lastMouseX = mouseX;
          lastMouseY = mouseY;

          var tempMatrix = mat4.create();
		  mat4.identity(tempMatrix);
          mat4.rotate(tempMatrix, degToRad(diffX/5), [0, 0, 1]);
          mat4.multiply(tempMatrix, cameraRotateMatrix, cameraRotateMatrix);

          drawScene();
     }

     function onDocumentMouseUp( event ) {
          document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
          document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
          document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
     }

     function onDocumentMouseOut( event ) {
          document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
          document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
          document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
     }

    ///////////////////////////////////////////////////////////////

    function webGLStart() {
        var canvas = document.getElementById("code03-canvas");
        initGL(canvas);
        initShaders();

		gl.enable(gl.DEPTH_TEST); 

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
        shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
        shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");	

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
        shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
        shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
        shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
        shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

        shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
        shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
        shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");

        initBuffers(); 

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 

		vec3.set([0,0,5],cameraPosition);
		vec3.set([0,0,0], COI);
		vec3.set([0,5,5],lightPosition);
		lightAmbient = [0,0,0,1];
		lightDiffuse = [.8,.8,.8,1];
		lightSpecular = [1,1,1,1];
		vMatrix = mat4.lookAt(cameraPosition, COI, [0,1,0], vMatrix);	// set up the view matrix
		mat4.identity(cameraRotateMatrix);

		mat4.identity(mMatrix);


		document.addEventListener('mousedown', onDocumentMouseDown, false); 

        drawScene();
    }

	function moveCOI(i) {
		if(i == 1) {
			vec3.add(COI, [0,0.2,0], COI);
		}
		else if(i == 2) {
			vec3.add(COI, [0,-0.2,0], COI);
		}
		else if(i == 3) {
			vec3.add(COI, [-0.2,0,0], COI);
		}
		else if(i == 4) {
			vec3.add(COI, [0.2,0,0], COI);
		}
		
		drawScene(); 

	} 

	function movePOC(i) {
		if(i == 1) {
			vec3.add(cameraPosition, [0,0.2,0]);
		}
		else if(i == 2) {
			vec3.add(cameraPosition, [0,-0.2,0]);
		}
		else if(i == 3) {
			vec3.add(cameraPosition, [-0.2,0,0]);
		}
		else if(i == 4) {
			vec3.add(cameraPosition, [0.2,0,0]);
		}
		else if(i == 5) {
			vec3.add(cameraPosition, [0,0,-0.2]);
		}
		else if(i == 6) {
			vec3.add(cameraPosition, [0,0,0.2]);
		}
		
		drawScene(); 

	} 

	function moveLight(i) {
		if(i == 1) {
			vec3.add(lightPosition, [0,0.5,0]);
		}
		else if(i == 2) {
			vec3.add(lightPosition, [0,-0.5,0]);
		}
		else if(i == 3) {
			vec3.add(lightPosition, [-0.5,0,0]);
		}
		else if(i == 4) {
			vec3.add(lightPosition, [0.5,0,0]);
		}
		else if(i == 5) {
			vec3.add(lightPosition, [0,0,-0.5]);
		}
		else if(i == 6) {
			vec3.add(lightPosition, [0,0,0.5]);
		}
		
		drawScene(); 

	} 

	function intensity(i) {
		if (i == 1) {
			lightAmbient = [Math.min(1.0,lightAmbient[0]*1.1), Math.min(1.0,lightAmbient[1]*1.1), Math.min(1.0,lightAmbient[2]*1.1),1.0];
			lightDiffuse = [Math.min(1.0,lightDiffuse[0]*1.1), Math.min(1.0,lightDiffuse[1]*1.1), Math.min(1.0,lightDiffuse[2]*1.1), 1.0];
			lightSpecular = [Math.min(1.0,lightSpecular[0]*1.1), Math.min(1.0,lightSpecular[1]*1.1), Math.min(1.0,lightSpecular[2]*1.1),1.0];
		}
		else if (i == 2) {
			lightAmbient = [lightAmbient[0]*0.9, lightAmbient[1]*0.9, lightAmbient[2]*0.9,1.0];
			lightDiffuse = [lightDiffuse[0]*0.9, lightDiffuse[1]*0.9, lightDiffuse[2]*0.9, 1.0];
			lightSpecular = [lightSpecular[0]*0.9, lightSpecular[1]*0.9, lightSpecular[2]*0.9,1.0];
		}
	}

	function rotateCamera(i) {
		if(i == 1) {
			var tempMatrix = mat4.create();
			mat4.identity(tempMatrix);
        	mat4.rotateX(tempMatrix, degToRad(-5), tempMatrix);
        	mat4.multiply(tempMatrix, cameraRotateMatrix, cameraRotateMatrix);
		}
		else if(i == 2) {
			var tempMatrix = mat4.create();
			mat4.identity(tempMatrix);
        	mat4.rotateX(tempMatrix, degToRad(5), tempMatrix);
        	mat4.multiply(tempMatrix, cameraRotateMatrix, cameraRotateMatrix);
		}
		else if(i == 3) {
			var tempMatrix = mat4.create();
			mat4.identity(tempMatrix);
        	mat4.rotateY(tempMatrix, degToRad(-5), tempMatrix);
        	mat4.multiply(tempMatrix, cameraRotateMatrix, cameraRotateMatrix);
		}
		else if(i == 4) {
			var tempMatrix = mat4.create();
			mat4.identity(tempMatrix);
        	mat4.rotateY(tempMatrix, degToRad(5), tempMatrix);
        	mat4.multiply(tempMatrix, cameraRotateMatrix, cameraRotateMatrix);
		}
		
		drawScene(); 
	}

	function redraw() {
		Z_angle = 0; 
		vec3.set([0,0,5],cameraPosition);
		vec3.set([0,0,0], COI);
		vec3.set([0,5,5],lightPosition);
		lightAmbient = [0,0,0,1];
		lightDiffuse = [.8,.8,.8,1];
		lightSpecular = [1,1,1,1];
		vMatrix = mat4.lookAt(cameraPosition, COI, [0,1,0], vMatrix);
		mat4.identity(cameraRotateMatrix);
		drawScene();
		window.setInterval("Rotateball()", 20);
	}