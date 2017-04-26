How to use my program:
	-open the html file
	-click button to move the point of interest or camera position in world space
	-click button to rotate camera about X or Y axis
	-use mouse to rotate camera about Z axis
	-click button to move the light source and change intensity
	-click Go Back! button to make objects back to original position

How do I control intensity and light move:
	-define a variable 'lightPosition' and when button clicked, modify its value
	-when intensity button clicked, multiply the three light parameters (lightAmbient, lightDiffuse and lightSpecular) by 1.1 or 0.9, clamp to 1 if any component larger than one
	-every time drawScene() called (and drawObject() called), send lightPosition, lightAmbient, lightDiffuse and lightSpecular to vertex shader
	
Browser/OS:
	-Chrome and Windows10