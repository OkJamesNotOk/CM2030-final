/**
 * Add a new “Heat Map” panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: name of the channel
 * appPublic: public state with imgProcesses array
 */
function heatSetup(x, y, w, h, channel, appPublic) {
    let heat = new colorChannel(x, y, w, h, channel, appPublic);
    heat.label = "Extensnion: " + channel + " (false color)";
    appPublic.imgProcesses.push(heat);
}

/**
 * Converts an image into a heat map.
 *
 * Computes luminance
 * Maps [0–255] luminance to hue range [240->0].
 * Writes out RGB pixels.
 *
 * img: input image
 * returns new false color image
 */
function heatFrame(img) {
    const output = createImage(img.width, img.height);
    img.loadPixels();
    output.loadPixels();

    const rgba = [0, 0, 0, 0];
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;
            getRgba(img, i, rgba);

            let lum = rgba[0] * 0.2126 + rgba[1] * 0.7152 + rgba[2] * 0.0722;
            // map lum to hue: 240 down to 0
            const hue = map(lum, 0, 255, 240, 0);
            const col = color(hue, 100, 100);
            output.pixels[i] = red(col);
            output.pixels[i + 1] = green(col);
            output.pixels[i + 2] = blue(col);
            output.pixels[i + 3] = 255;
        }
    }
    output.updatePixels();
    return output;
}
