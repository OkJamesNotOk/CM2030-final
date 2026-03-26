/**
 * Add an HSV conversion panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: channel name
 * appPublic: public state containing imgProcesses
 */
function HSVSetup(x, y, w, h, channel, appPublic) {
    let hsvFrame = new colorChannel(x, y, w, h, channel, appPublic);
    hsvFrame.label = channel + " Image";
    appPublic.imgProcesses.push(hsvFrame);
}

/**
 * Convert an image from RGB to HSV (scaled into 0–255).
 *
 * Calls RGBToHSV per pixel.
 * Scales H to [0,255], S and V to [0,255].
 * Packs results into R=H, G=S, B=V, preserving alpha.
 *
 * img: input image
 * returns HSV visualization
 */
function convertToHSV(img) {
    let output = createImage(img.width, img.height);
    img.loadPixels();
    output.loadPixels();

    // loop through each pixel
    const rgba = [0, 0, 0, 0];
    const hsvOutput = { h: 0, s: 0, v: 0 };
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;
            // extract rgba values
            getRgba(img, i, rgba);

            // convert image to hsv image
            RGBToHSV(rgba[0], rgba[1], rgba[2], hsvOutput);

            let h = Math.round((hsvOutput.h / 360) * 255);
            let s = Math.round(hsvOutput.s * 255);
            let v = Math.round(hsvOutput.v * 255);

            output.pixels[i + 0] = h;
            output.pixels[i + 1] = s;
            output.pixels[i + 2] = v;
            //preserve alpha value
            output.pixels[i + 3] = rgba[3];
        }
    }
    output.updatePixels();
    return output;
}

/**
 * Convert individual R,G,B values to HSV.
 * r: red channel
 * g: green channel
 * b: blue channel
 * out: object receiving results
 */
function RGBToHSV(r, g, b, out) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let d = max - min;
    let s;
    if (max == 0) {
        s = 0;
    } else {
        s = d / max;
    }
    let v = max;

    let r_ = 0;
    let g_ = 0;
    let b_ = 0;
    if (d > 0) {
        r_ = (max - r) / d;
        g_ = (max - g) / d;
        b_ = (max - b) / d;
    }

    let h = 0;

    if (d > 0) {
        if (max == r && g == min) {
            h = 5 + b_;
        } else if (max == r && g != min) {
            h = 1 - g_;
        } else if (max == g && b == min) {
            h = r_ + 1;
        } else if (max == g && b != min) {
            h = 3 - b_;
        } else if (max == r) {
            h = 3 + g_;
        } else if (max == b) {
            h = 5 - r_;
        }

        h *= 60;
        if (h < 0) {
            h += 360;
        }
        if (h >= 360) {
            h -= 260;
        }
    } else {
        h = 0;
    }

    out.h = h;
    out.s = s;
    out.v = v;
}

/**
 * Add a HSV threshold panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: channel name
 * appPublic: public state containing imgProcesses
 */
function HSVThresholdSetup(x, y, w, h, channel, appPublic) {
    let frame = new colorChannel(x, y, w, h, channel, appPublic);
    frame.label = channel + " Image";
    appPublic.imgProcesses.push(frame);
}

/**
 * Apply a binary threshold on the V channel of HSV.
 *
 * Converts the image to HSV via convertToHSV().
 * Compares V (in B channel) to threshold; copies H,S,V when above, zero otherwise.
 * 
 * img: input image
 * threshold: threshold value
 * returns new image of thershold HSV
 */
function thresholdHSV(img, threshold) {
    const HSVImg = convertToHSV(img);
    HSVImg.loadPixels();

    let output = createImage(img.width, img.height);
    output.loadPixels();

    // loop through each pixel
    const HSVa = [0, 0, 0, 0];
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;

            // extract rgba values
            getRgba(HSVImg, i, HSVa);
            
            let val = 0;
            if (HSVa[2] >= threshold) {
                for (let z = 0; z < HSVa.length - 1; z++) {
                    output.pixels[i + z] = HSVa[z];
                }
            } else {
                for (let z = 0; z < HSVa.length - 1; z++) {
                    output.pixels[i + z] = 0;
                }
            }
            //preserve alpha value
            output.pixels[i + 3] = HSVa[3];
        }
    }
    output.updatePixels();
    return output;
}
