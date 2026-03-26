/**
 * Initialize the main webcam asynchronously and add it to the app.
 * x: x-position of the webcam panel
 * y: y-position of the webcam panel
 * w: width of the webcam panel
 * h: height of the webcam panel
 * app: the mainApp instance
 */
async function WebcamSetup(x, y, w, h, app) {
    // Create a new Webcam; call ready(cam) when loaded
    const cam = await new Promise((ready) => {
        new Webcam(x, y, w, h, {
            ifReady: ready
        });
    });
    app.setWebcam(cam);
    app.updatePublic();
}

/**
 * Add a “repeat” webcam panel
 *
 * x: panel x position
 * y: panel y position
 * w: panel width
 * h: panel height
 * channel: channel name
 * public: the shared public state (holds imgProcesses array)
 */
function subWebcamSetup(x, y, w, h, channel, public) {
    let sub = new colorChannel(x, y, w, h, channel, public);
    sub.label = "Webcam Image (Repeat)";
    public.imgProcesses.push(sub);
}

/**
 * Webcam class
 *
 * position itself at the bottom of its panel
 * Provides live or still frames on demand
 *
 * x: top left x of the panel
 * y: top left y of the panel
 * w: total panel width
 * h: total panel height
 */
class Webcam {
    constructor(x, y, w, h, { ifReady }) {
        // draw area at 80% of panel size, centered horizontally and bottom aligned
        this.w = w * 0.8;
        this.h = h * 0.8;
        this.x = x + (w - this.w) / 2;
        this.y = y + (h - this.h);
        this.tSize = 15;
        this.textY = y + this.tSize + this.h * 0.05;
        this.label = "Webcam Image";

        this.cap = null;
        // captured still frame
        this.capFrame = null;
        this.ready = false;
        this.error = null;

        //create video capture
        this.cap = createCapture({ video: true, audio: false });
        this.cap.size(this.w, this.h);
        this.cap.hide();

        // when video element has loaded data, mark as ready
        this.cap.elt.onloadeddata = () => {
            this.ready = true;
            ifReady(this);
        };
    }

    // draw panel label at the top center
    text() {
        textAlign(CENTER);
        fill(0);
        textSize(this.tSize);
        text(this.label, this.x + this.w / 2, this.textY);
    }

    // capture the current live frame and store it as this.capFrame
    captureFrame() {
        if (this.ready && this.cap) {
            this.capFrame = this.cap.get();
        }
    }

    // return live image captured by webcam
    getLiveFrame() {
        if (this.ready) {
            // return the live webcam feed when ready
            return this.cap.get();
        } else {
            // Webcam is not ready yet
            return null;
        }
    }

    getStillFrame() {
        // Return the last captured still image
        return this.capFrame;
    }
}
