/**
 * Add a YCbCr conversion panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: channel name
 * appPublic: public state containing imgProcesses
 */
function YCbCrSetup(x, y, w, h, channel, appPublic) {
    let YCbCrFrame = new colorChannel(x, y, w, h, channel, appPublic);
    YCbCrFrame.label = channel + " Image";
    appPublic.imgProcesses.push(YCbCrFrame);
}

/**
 * Convert an image from RGB to YCbCr color space
 *
 * Reads each pixel RGB.
 * Applies BT.601 to calculate Y, Cb, Cr.
 * Cb/Cr +128 and clamps each channel to [0–255].
 * preserves original alpha.
 *
 * img: input image
 * returns HSV visualization
 */
function convertToYCbCr(img) {
    let output = createImage(img.width, img.height);
    img.loadPixels();
    output.loadPixels();

    // loop through each pixel
    const rgba = [0, 0, 0, 0];
    const ycbcrOutput = { y: 0, cb: 0, cr: 0 };
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;
            // extract rgba values
            getRgba(img, i, rgba);

            // convert image to YCbCr image
            RGBToYCbCr(rgba[0], rgba[1], rgba[2], ycbcrOutput);

            let Y = Math.max(0, Math.min(255, Math.round(ycbcrOutput.y)));
            let cb = Math.max(0, Math.min(255, Math.round(ycbcrOutput.cb + 128)));
            let cr = Math.max(0, Math.min(255, Math.round(ycbcrOutput.cr + 128)));

            output.pixels[i + 0] = Y;
            output.pixels[i + 1] = cb;
            output.pixels[i + 2] = cr;
            //preserve alpha value
            output.pixels[i + 3] = rgba[3];
        }
    }
    output.updatePixels();
    return output;
}

/**
 * Convert RGB channels to Y, Cb, and Cr.
 *
 * r: red channel
 * g: green channel
 * b: blue channel
 * out: object receiving results
 */
function RGBToYCbCr(r, g, b, out) {
    //ITU.BT-601 YCbCr
    let y = 0.299 * r + 0.587 * g + 0.114 * b;
    let cb = -0.169 * r - 0.331 * g + 0.5 * b;
    let cr = 0.5 * r - 0.419 * g - 0.081 * b;

    out.y = y;
    out.cb = cb;
    out.cr = cr;
}

/**
 * Add a YCbCr threshold panel to the grid.
 * 
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: channel name
 * appPublic: public state containing imgProcesses
 */
function ycbcrThresholdSetup(x, y, w, h, channel, appPublic) {
    let frame = new colorChannel(x, y, w, h, channel, appPublic);
    frame.label = channel + " Image";
    appPublic.imgProcesses.push(frame);
}

 /**
 *  Apply a binary threshold on the Y(luminence) channel of a YCbCr image.
 *
 * Converts the image to YCbCr with convertToYCbCr()
 * Compares Y (in R channel) to threshold; copies Y, Cb, Cr when above, zero otherwise.
 * preserves alpha.
 * 
 * img: input image
 * threshold: threshold value
 * returns new image of thershold HSV
 */
function thresholdYCbCr(img, threshold) {
    const YCbCrImg = convertToYCbCr(img);
    YCbCrImg.loadPixels();

    let output = createImage(img.width, img.height);
    output.loadPixels();

    // loop through each pixel
    const YCbCra = [0, 0, 0, 0];
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;

            // extract rgba values
            getRgba(YCbCrImg, i, YCbCra);

            let val = 0;
            if (YCbCra[0] >= threshold) {
                for (let z = 0; z < YCbCra.length - 1; z++) {
                    output.pixels[i + z] = YCbCra[z];
                }
            } else {
                for (let z = 0; z < YCbCra.length - 1; z++) {
                    output.pixels[i + z] = 0;
                }
            }
            //preserve alpha value
            output.pixels[i + 3] = YCbCra[3];
        }
    }
    output.updatePixels();
    return output;
}
