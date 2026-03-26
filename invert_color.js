/**
 * Add an Invert Color panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: channel name
 * appPublic: public state containing imgProcesses
 */
function invertColorSetup(x, y, w, h, channel, appPublic) {
    let invertColorFrame = new colorChannel(x, y, w, h, channel, appPublic);
    invertColorFrame.label = "Extension: " + channel;
    appPublic.imgProcesses.push(invertColorFrame);
}

/**
 * Invert the RGB channels of an image
 *
 * Reads each pixel R, G, B values.
 * Computes 255 - value for each channel.
 * preserves the original alpha channel.
 */
function invertColor(img) {
    let output = createImage(img.width, img.height);
    img.loadPixels();
    output.loadPixels();

    // loop through each pixel
    const rgba = [0, 0, 0, 0];
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;
            // extract rgba values
            getRgba(img, i, rgba);
            //invert rgb values
            for (let z = 0; z < 3; z++) {
                output.pixels[i + z] = 255 - rgba[z];
            }
            //preserve alpha value
            output.pixels[i + 3] = rgba[3];
        }
    }
    output.updatePixels();
    return output;
}
