// Global face detector
let faceDetector;
let detectedFaces = [];

/**
 * Add a Face Detection panel to the grid.
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: channel name
 * appPublic: public state containing imgProcesses
 */
function faceDetectionSetup(x, y, w, h, channel, appPublic) {
    let face = new colorChannel(x, y, w, h, channel, appPublic);
    face.label = channel + " Image";
    // default filter
    face.mode = "none";
    appPublic.imgProcesses.push(face);
}

// called once after setting up the grid to initialize the face detector
function setupDetection() {
    faceDetector = new objectdetect.detector(160, 120, 1.2, objectdetect.frontalface);
}

/**
 * Detect faces in the given image and apply the selected filter mode.
 *
 * img: input frame
 * w: panel width
 * h: panel height
 * mode: "greyscale", "blur", "HSV", "YCbCr", "pixel", apply no filter otherwise
 * returns an image with faces outlined and filtered
 */
function detectFace(img, w, h, mode) {
    //create output image
    let output = createGraphics(w, h);
    // return if facedetector or img is undefined
    if (!faceDetector || !img) {
        output.image(img, 0, 0, w, h);
        return output;
    }

    //detect faces
    detectedFaces = faceDetector.detect(img.canvas);

    // draw original img
    output.image(img, 0, 0, w, h);

    // red rectangle
    output.noFill();
    output.stroke(255, 0, 0);
    output.strokeWeight(2);

    const sx = w / img.width;
    const sy = h / img.height;

    for (let f of detectedFaces) {
        // only take faces with high score
        if (f[4] > 4) {
            const x = Math.round(f[0]);
            const y = Math.round(f[1]);
            const w = Math.round(f[2]);
            const h = Math.round(f[3]);
            output.rect(x * sx, y * sy, w * sx, h * sy);
        }
    }

    // extract face for filtering
    for (let f of detectedFaces) {
        if (f[4] > 4) {
            const x0 = Math.round(f[0]);
            const y0 = Math.round(f[1]);
            const w0 = Math.round(f[2]);
            const h0 = Math.round(f[3]);

            // crop faceImg from img
            let faceImg = img.get(x0, y0, w0, h0);

            // apply filters
            if (mode === "greyscale") {
                // greyscale filter
                faceImg = convertToGreyscale(faceImg);
            } else if (mode === "blur") {
                // blur filter
                faceImg = blurFace(faceImg);
            } else if (mode === "HSV") {
                // colourspace HSV filter
                faceImg = convertToHSV(faceImg);
            } else if (mode === "YCbCr") {
                // colourspace YCbCr filter
                faceImg = convertToYCbCr(faceImg);
            } else if (mode === "pixel") {
                // pixelate filter
                faceImg = pixelateFace(faceImg);
            }
            // output image
            output.image(faceImg, x0 * sx, y0 * sy, w0 * sx, h0 * sy);
        }
    }
    // return output image
    return output;
}

/**
 * Pixelate an image by averaging each block of size 5x5.
 *
 * img: input face image
 * return new image with pixelation effect
 */
function pixelateFace(img) {
    const size = 5;
    const w = img.width;
    const h = img.height;
    const output = createImage(w, h);

    img.loadPixels();
    output.loadPixels();

    // loop through every block of 5x5 pixels
    const rgba = [0, 0, 0, 0];
    for (let bx = 0; bx < w; bx += size) {
        for (let by = 0; by < h; by += size) {
            const bw = min(size, w - bx);
            const bh = min(size, h - by);

            let R = 0;
            let G = 0;
            let B = 0;
            let z = 0;
            for (let x = bx; x < bx + bw; x++) {
                for (let y = by; y < by + bh; y++) {
                    let i = (y * w + x) * 4;

                    // extract rgba values
                    getRgba(img, i, rgba);
                    R += rgba[0];
                    G += rgba[1];
                    B += rgba[2];
                    z++;
                }
            }

            // Compute average color
            const r = R / z;
            const g = G / z;
            const b = B / z;
            
            // loop through each pixel in the block, fill with average rgb values
            for (let x = bx; x < bx + bw; x++) {
                for (let y = by; y < by + bh; y++) {
                    let i = (y * w + x) * 4;
                    output.pixels[i + 0] = r;
                    output.pixels[i + 1] = g;
                    output.pixels[i + 2] = b;
                    output.pixels[i + 3] = rgba[3];
                }
            }
        }
    }
    output.updatePixels();
    return output;
}

/**
 * Apply blur effect to image.
 *
 * img: input face image
 * return new image with blur effect
 */
function blurFace(img) {
    const blur = 15;
    const radius = floor(blur / 2);
    const w = img.width;
    const h = img.height;
    const output = createImage(w, h);

    img.loadPixels();
    output.loadPixels();

    const rgba = [0, 0, 0, 0];
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let R = 0;
            let G = 0;
            let B = 0;
            let z = 0;

            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        let i = (ny * w + nx) * 4;

                        // extract rgba values
                        getRgba(img, i, rgba);
                        R += rgba[0];
                        G += rgba[1];
                        B += rgba[2];
                        z++;
                    }
                }
            }

            let i = (y * w + x) * 4;
            output.pixels[i + 0] = R / z;
            output.pixels[i + 1] = G / z;
            output.pixels[i + 2] = B / z;
            
            // preserve alpha
            output.pixels[i + 3] = rgba[3];
        }
    }

    output.updatePixels();
    return output;
}
