/**
 * Add an RGB threshold channel panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel:  channel name
 * appPublic: public state containing imgProcesses
 */
function rgbThresholdSetup(x, y, w, h, channel, appPublic) {
    let rgbThresFrame = new colorChannel(x, y, w, h, channel, appPublic);
    rgbThresFrame.label = channel + " Image";
    appPublic.imgProcesses.push(rgbThresFrame);
}

/**
 * Apply a binary threshold to one RGB channel of an image.
 *
 * reads the channel value (R, G, or B) at each pixel.
 * compares it to the provided threshold.
 * outputs 255 in that channel if above threshold, otherwise 0.
 * zero out the other two channels
 * preserve original alpha channel
 *
 * img: input image
 * channel: channel name
 * threshold: threshold value
 * returns new image showing only the specified channel
 */
function thresholdRGB(img, channel, threshold) {
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

            let val = 0;
            //red threshold
            if (channel === "Red Threshold") {
                val = rgba[0];
            }
            //green threshold
            else if (channel === "Green Threshold") {
                val = rgba[1];
            }
            // blue threshold
            else if (channel === "Blue Threshold") {
                val = rgba[2];
            }

            let res = 0;
            if (val >= threshold) res = 255;

            for (let z = 0; z < 3; z++) {
                output.pixels[i + z] = 0;
            }
            
            // write the threshold result into the correct channel
            if (channel === "Red Threshold") {
                output.pixels[i + 0] = res;
            } else if (channel === "Green Threshold") {
                output.pixels[i + 1] = res;
            } else if (channel === "Blue Threshold") {
                output.pixels[i + 2] = res;
            }
            //preserve alpha value
            output.pixels[i + 3] = rgba[3];
        }
    }
    output.updatePixels();
    return output;
}
