/**
   Name: Phan Nang Kien
   Commentary
   
   This project creates an image processing application that uses the webcam to perform various tasks, 
   including thresholding, color space conversions, face detection, and two extensions false color 
   heat map and color inversion. The processed images are displayed in a grid, allowing easy 
   comparison of different techniques.
   
   Threshold and Face Detection:
   The project includes an essential feature of splitting webcam images into RGB channels and applying 
   thresholding using sliders for each channel, allowing users to adjust the threshold for each one.  
   Color space HSV and YCbCr conversion were also implemented. These conversions show how the image 
   changes when represented in alternative color models. I also implemented face detection 
   using objectdetect.frontalface. Users can apply various filters like greyscale, blur, HSV, YCbCr, 
   and pixelation onto the detected face area. These filters are triggered by keyboard inputs 1-6.
   
   Extension:
   I implemented two extensions to enhance the project: false color heat map and color inversion.
   The heat map extension visualizes an image by mapping pixel brightness to a color scale, from blue 
   for low values to red for high values. This extension make the images looks like a thermal image,
   which is a unique image visualization.
    
   Another extension, the color inversion extension inverts the RGB channels of the image by subtracting 
   the pixel values from 255. This extension show how a simple color flip can drastically change how an 
   image feels.
   
   Challenges and Solutions:
   One of the challenges I faced in this project was optimizing performance, especially after the 
   user captures an image. Initially, I made the program run all the image processing tasks
   every frame, which causes the screen to lag or freeze, particularly when running multiple 
   tasks. To improve performance, I implemented a caching mechanism. After capturing an image,
   the image processing function now caches the processed result for each channel. Instead
   of reprocessing the image every frame, the app displays the cached images. The image
   is only reprocessed when the user adjusts a threshold slider or selects a different face
   filter, which improves performance. This allows smooth interaction with the controls
   without causing any lag or freeze.
   
   Another challenge was maintaining a modular code structure. I used object oriented principles to 
   separate different image processing tasks into separate files, ensuring the code remained 
   clean and manageable.
   
   Conclusion:
   This project meets all the requirements of the assignment. Core tasks such as thresholding, color space 
   conversions, and face detection are successfully implemented. The extensions, false color heat map and
   color inversion, offer creative visual effects that enhance the project. 
 */

let app;

function setup() {
    app = new mainApp();
    app.setup();
    frameRate(30);
}

function draw() {
    app.draw();
}

function keyPressed() {
    if (app.keypress) {
        app.keypress(key);
    }
}
