/**
 * mainApp class
 * Initialize UI controls and webcam capture
 * Layout the grid for image processing panels
 * Main draw loop
 * 
 * create public object, acts as global variables
 */

class mainApp {
    constructor() {
        this.gap = 5;
        this.sectionW = 250;
        this.sectionH = this.sectionW * 0.75;
        this.tRow = 6;
        this.tCol = 3;
        this.w = this.sectionW * this.tCol;
        this.h = this.sectionH * this.tRow;

        this.public = this.createPublic();
        this.UI = new UI(this);
    }

    /**
     * Create a public object shared between all panels and UI
     * Returns an object containing:
     * - webcam: null until setWebcam() is called
     * - imgProcesses: array containing all image processing panels
     * - layout constants: sectionW, sectionH, gap, w, h
     */
    createPublic() {
        const sliderColors = ["Red", "Green", "Blue"];
        const RGBThreshold = ["Red Threshold", "Green Threshold", "Blue Threshold"];
        const slidersHSV = ["HSV"];
        const slidersYCbCr = ["YCbCr"];
        const sliderGrps = [sliderColors, slidersHSV, slidersYCbCr];
        return {
            webcam: null,
            UI: this.UI,
            sliders: this.UI?.sliders,
            imgProcesses: [],
            live: true,
            sliderColors: sliderColors,
            RGBThreshold: RGBThreshold,
            slidersHSV: slidersHSV,
            slidersYCbCr: slidersYCbCr,
            sliderGrps: sliderGrps,
            sectionW: this.sectionW,
            sectionH: this.sectionH,
            w: this.w,
            h: this.h,
            gap: this.gap
        };
    }

    // update sliders in public object
    updatePublic() {
        this.public.UI = this.UI;
        if (this.UI && this.UI.sliders) {
            this.public.sliders = this.UI.sliders;
        } else {
            this.public.sliders = null;
        }
    }

    /**
     * called once to initialise canvas, UI, grid, and face detection
     * build and postition panels into the grid
     */
    setup() {
        createCanvas(this.w + this.gap * this.tCol, this.h + this.gap * this.tRow);
        pixelDensity(1);
        let secW = this.sectionW + this.gap;
        let secH = this.sectionH + this.gap;

        //create and setup UI elements
        this.UI.UISetup();
        //setup webcam and the image precessing panels
        this.gridSetup(secW, secH);
        this.updatePublic();
        setupDetection();
    }

    /** maps number key presses to the Face Detection panel filter modes.
     * 1 = normal
     * 2 = greyscale
     * 3 = blur
     * 4 = HSV
     * 5 = YCbCr
     * 6 = pixelate
     */
    keypress(key) {
        for (let p of this.public.imgProcesses) {
            if (p.channel === "Face Detection") {
                try {
                    if (key === "1") {
                        p.mode = "none";
                    } else if (key === "2") {
                        p.mode = "greyscale";
                    } else if (key === "3") {
                        p.mode = "blur";
                    } else if (key === "4") {
                        p.mode = "HSV";
                    } else if (key === "5") {
                        p.mode = "YCbCr";
                    } else if (key === "6") {
                        p.mode = "pixel";
                    }
                    p.img = null;
                } catch (e) {
                    console.log(e);
                }
                break;
            }
        }
    }

    // main draw loop
    draw() {
        background(125);
        noStroke();
        fill(0, 0, 0, 100);

        // draw vertical and horizontal grid separators
        for (let i = 1; i <= this.tCol; i++) {
            let x = i * this.sectionW + (i - 1) * this.gap;
            rect(x, 0, this.gap, this.h + this.gap * this.tRow);
        }

        for (let j = 1; j <= this.tRow; j++) {
            let y = j * this.sectionH + (j - 1) * this.gap;
            rect(0, y, this.w + this.gap * this.tCol, this.gap);
        }

        // draw main webcam panel, use live images in live mode, use still image when paused
        let live = this.public.webcam?.getLiveFrame();
        let still = this.public.webcam?.getStillFrame();
        let img = null;
        if (this.public.live) {
            img = live;
        } else {
            img = still;
        }
        if (img) {
            // draw the image from webcam
            image(img, this.public.webcam.x, this.public.webcam.y, this.public.webcam.w, this.public.webcam.h);
            // draw label for main webcam
            this.public.webcam.text();
        }

        /**
         * draw other image processing panels
         * call display function to draw images
         * call text function to draw labels
         * switch color mode when drawing Heat image
         */
        for (const process of this.public.imgProcesses) {
            if (process.channel === "Heat Map") {
                colorMode(HSB, 360, 100, 100);
            }
            process.display();
            process.text();
            colorMode(RGB, 255);
        }
    }
    /**
     * Place each processing panel into its cell in the grid.
     * - Row 0: main webcam, greyscale + 20% brightness
     * - Row 1: R; G; B channels
     * - Row 2: R; G; B thresholds
     * - Row 3: HSV; YCbCr conversions
     * - Row 4: Face Detection; HSV thresholds; YCbCr thresholds
     * - Row 5: Invert Color
     *
     * secW/secH are the cell+gap dimensions;
     * this.sectionW/sectionH are the inner cell sizes.
     */
    gridSetup(secW, secH) {
        // main webcam creation
        WebcamSetup(secW * 0, secH * 0, this.sectionW, this.sectionH, this);
        //setup the  repeat webcam
        subWebcamSetup(secW * 0, secH * 3, this.sectionW, this.sectionH, "Webcam", this.public);
        //greyscale conversion panel
        greyscaleSetup(secW * 1, secH * 0, this.sectionW, this.sectionH, "Grey", this.public);
        //setup the three RGB channels
        for (let i = 0; i < this.public.sliderColors.length; i++) {
            rgbSetup(secW * i, secH * 1, this.sectionW, this.sectionH, this.public.sliderColors[i], this.public);
        }
        // setup the three RGB threshold channels
        for (let i = 0; i < this.public.RGBThreshold.length; i++) {
            rgbThresholdSetup(
                secW * i,
                secH * 2,
                this.sectionW,
                this.sectionH,
                this.public.RGBThreshold[i],
                this.public
            );
        }
        // setup HSV conversion
        HSVSetup(secW * 1, secH * 3, this.sectionW, this.sectionH, "HSV", this.public);
        // setup YCbCr conversion
        YCbCrSetup(secW * 2, secH * 3, this.sectionW, this.sectionH, "YCbCr", this.public);
        // setup ycbcr threshold channel
        ycbcrThresholdSetup(secW * 2, secH * 4, this.sectionW, this.sectionH, "YCbCr Threshold", this.public);
        // setup hsv threshold channel
        HSVThresholdSetup(secW * 1, secH * 4, this.sectionW, this.sectionH, "HSV Threshold", this.public);
        // setup face detection panel
        faceDetectionSetup(secW * 0, secH * 4, this.sectionW, this.sectionH, "Face Detection", this.public);
        // setup color inversion channel
        invertColorSetup(secW * 0, secH * 5, this.sectionW, this.sectionH, "Invert Color", this.public);
        heatSetup(secW * 1, secH * 5, this.sectionW, this.sectionH, "Heat Map", this.public);
    }

    // set webcam to public object
    setWebcam(cam) {
        this.public.webcam = cam;
    }
}
