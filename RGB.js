/**
 * Add an RGB channel panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel:  channel name
 * appPublic: public state containing imgProcesses
 */
function rgbSetup(x, y, w, h, channel, appPublic) {
    let rgbFrame = new colorChannel(x, y, w, h, channel, appPublic);
    rgbFrame.label = channel + " channel";
    appPublic.imgProcesses.push(rgbFrame);
}

/**
 * Split an image into a single color channel.
 * 
 * zero out all channels, then restores only the specified channel value
 * preserve original alpha channel
 * 
 * img: input image 
 * channel: channel name
 * returns new image showing only the specified channel
 */
function splitRGB(img, channel) {
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

            // set all color to 0
            for (let z = 0; z < 3; z++) {
                output.pixels[i + z] = 0;
            }
            // Red channel
            if (channel === "Red") {
                output.pixels[i + 0] = rgba[0];
            }
            // Green channel
            else if (channel === "Green") {
                output.pixels[i + 1] = rgba[1];
            }
            // Blue channel
            else if (channel === "Blue") {
                output.pixels[i + 2] = rgba[2];
            }

            //preserve alpha value
            output.pixels[i + 3] = rgba[3];
        }
    }

    output.updatePixels();
    return output;
}
