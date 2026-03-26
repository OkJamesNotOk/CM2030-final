/**
 * Add a Greyscale panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel:  channel name
 * appPublic: public state containing imgProcesses
 */
function greyscaleSetup(x, y, w, h, channel, appPublic) {
    let greyscaleFrame = new colorChannel(x, y, w, h, channel, appPublic);
    greyscaleFrame.label = "Greyscale and brightness +20%";
    appPublic.imgProcesses.push(greyscaleFrame);
}
/**
 * Convert an image to greyscale and increase brightness by 20%
 * 
 * Multiplies luminace by 1.2 to increase brightness
 * Constrains to [0,255] to avoid overflow.
 * 
 * img: input image
 * returns a new greyscale with brightness adjusted image
 */
function convertToGreyscale(img) {
    let output = createImage(img.width, img.height);
    img.loadPixels();
    output.loadPixels();

    const rgba = [0, 0, 0, 0];
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;
            getRgba(img, i, rgba);

            // Luminance calculation
            let grey = rgba[0] * 0.2126 + rgba[1] * 0.7152 + rgba[2] * 0.0722;
            // increase brightness by 20%
            grey *= 1.2;
            // add constrain so pixel intensity stay in the 0-255 range
            grey = constrain(grey, 0, 255);
            for (let z = 0; z < 3; z++) {
                output.pixels[i + z] = grey;
            }
            output.pixels[i + 3] = rgba[3];
        }
    }
    output.updatePixels();
    return output;
}
