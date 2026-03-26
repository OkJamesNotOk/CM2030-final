/**
 * colorChannel class
 *
 * Represents one panel in the grid
 * and applies a processing algorithm based on its channel name.
 */
class colorChannel {
    /**
     * x: panel top left x
     * y: panel top left y
     * w: panel width
     * h: panel height
     * channel: name of the processing channel
     * mainapp: mainApp instance or its public state
     */
    constructor(x, y, w, h, channel, mainapp) {
        // Draw area 80% of panel size, centered horizontally and bottom aligned
        this.w = w * 0.8;
        this.h = h * 0.8;
        this.x = x + (w - this.w) / 2;
        this.y = y + (h - this.h);
        this.tSize = 15;
        this.textY = y + this.tSize + this.h * 0.05;
        this.channel = channel;
        this.label = "";
        if (mainapp && mainapp.public) {
            this.app = mainapp.public;
        } else {
            this.app = mainapp;
        }
        // cached output image for this panel, to avoid reprocessing when paused
        this.img = null;
    }

    /**
     * Draws the processed image into this panel.
     * Chooses live or still frames
     * routes through channelProcess for each channel.
     */
    display() {
        if (!this.app || !this.app.webcam) {
            return;
        }
        // during live mode, clear any cached still images to reprocess
        if (this.app.live && this.img != null) {
            this.img = null;
        }
        // use captured frame if paused, otherwise use live feed if the channel is webcam (to show the repeated webcam image)
        let img = null;
        let mode = "none";
        if (!this.app.live) {
            img = this.app.webcam?.getStillFrame();
        } else if (this.channel === "Webcam") {
            //live feed for repeat webcam channel
            const live = this.app.webcam?.getLiveFrame();
            if (live) {
                img = live;
            }
        }
        // detect faces in real time in this panel
        else if (this.channel === "Face Detection") {
            const live = this.app.webcam?.getLiveFrame();
            if (live) {
                img = live;
            }
            // resize img for detector
            img.resize(160, 120);
            // detect and draw the image with face detection
            const face = detectFace(img, this.w, this.h, this.mode);
            image(face, this.x, this.y, this.w, this.h);
            return;
        }

        if (!img) {
            return;
        }

        if (this.channel === "Face Detection") {
            mode = this.mode;
        }
        if (this.img) {
            image(this.img, this.x, this.y, this.w, this.h);
        } else if (img.width > 0 && img.height > 0) {
            // minimum resolution
            img.resize(160, 120);
            // process image based on the channel
            const processed = channelProcess(img, this.channel, this.app, mode, this);
            //draw the processed image
            image(processed, this.x, this.y, this.w, this.h);
        }
    }

    // draw the text label of the panel above the image
    text() {
        textAlign(CENTER);
        fill(0);
        textSize(this.tSize);
        text(this.label, this.x + this.w / 2, this.textY);
    }
}
/**
 * detemine which processing task is ran based on channel name
 *
 * img: input image
 * channel: channel name
 * app: public state conatining UI sliders array
 * mode: face detection filter
 *
 * each threshold channel look up a matching slider by slider.color name
 * cache processed result in obj.img for reuse.
 */
function channelProcess(img, channel, app, mode, obj) {
    img.loadPixels();

    // RGB splitting
    if (["Red", "Green", "Blue"].includes(channel)) {
        obj.img = splitRGB(img, channel);
        return obj.img;
    }
    // greyscale + 20% brightness
    else if (channel === "Grey") {
        obj.img = convertToGreyscale(img);
        return obj.img;
    }
    // RGB channel threshold
    else if (["Red Threshold", "Green Threshold", "Blue Threshold"].includes(channel)) {
        let slider = app.UI.sliders.find((Slider) => Slider.color === channel);
        let thresholdVal = 0;
        if (slider) thresholdVal = slider.getValue();
        obj.img = thresholdRGB(img, channel, thresholdVal);
        return obj.img;
    }
    // no processing
    else if (channel === "Webcam") {
        obj.img = img;
        return obj.img;
    }
    // HSV color space conversions
    else if (channel === "HSV") {
        obj.img = convertToHSV(img);
        return obj.img;
    }
    // YCbCr color space conversions
    else if (channel === "YCbCr") {
        obj.img = convertToYCbCr(img);
        return obj.img;
    }
    // YCbCr threshold
    else if (channel === "YCbCr Threshold") {
        let thresholdVal = 0;
        if (app.slidersYCbCr) {
            let slider = app.UI.sliders.find((Slider) => Slider.color === channel);
            if (slider) {
                thresholdVal = slider.getValue();
            }
        }
        obj.img = thresholdYCbCr(img, thresholdVal);
        return obj.img;
    }
    // HSV threshold
    else if (channel === "HSV Threshold") {
        let thresholdVal = 0;
        if (app.slidersHSV) {
            let slider = app.UI.sliders.find((Slider) => Slider.color === channel);
            if (slider) {
                thresholdVal = slider.getValue();
            }
        }
        obj.img = thresholdHSV(img, thresholdVal);
        return obj.img;
    }
    // face detection on still image
    else if (channel === "Face Detection") {
        obj.img = detectFace(img, app.sectionW * 0.8, app.sectionH * 0.8, mode);
        return obj.img;
    }
    // Color inversion
    else if (channel === "Invert Color") {
        obj.img = invertColor(img);
        return obj.img;
    }
    // heat map effect
    else if (channel === "Heat Map") {
        obj.img = heatFrame(img);
        return obj.img;
    }
    return img;
}

/**
 * Helper to extract RGBA from image.pixels into an array.
 *
 * img
 * i: pixel index in the pixels array
 * rgba: output array of length 4
 * returns the same rgba array filled with [r,g,b,a]
 */
function getRgba(img, i, rgba) {
    for (let c = 0; c < 4; c++) {
        rgba[c] = img.pixels[i + c];
    }
    return rgba;
}
