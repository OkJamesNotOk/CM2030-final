/**
 * UI class
 *
 * manages all on screen controls
 * include a draggable panel with buttons and sliders
 * a seperate draggable panel with instructions
 * 2 buttons for capturing image and live feed toggle, and reconnect camera functionality
 *
 * expect app to be an insctance of mainApp
 */
class UI {
    constructor(app) {
        this.app = app;
        this.W = this.app.sectionW + this.app.gap;
        this.H = this.app.sectionH + this.app.gap;

        //create the draggable control panel container
        this.controlPanel = createDiv();
        this.controlPanel
            .style("top", "10px")
            .style("left", "10px")
            .style("background-color", "#444")
            .style("border", "1px solid #000000")
            .style("border-radius", "8px")
            .style("padding", "10px 40px")
            .style("width", this.W + "px")
            .style("cursor", "move")
            .style("text-align", "center")
            .position(this.W * 3, this.H * 0)
            .style("position", "fixed");

        // header for dragging the panel
        this.controlHeader = createDiv("Draggable UI Panel");
        this.controlHeader
            .parent(this.controlPanel)
            .style("font-weight", "bold")
            .style("cursor", "move")
            .style("margin-bottom", "6px")
            .style("text-align", "center");

        // draggable instructions panel container
        this.instructionPanel = createDiv();
        this.instructionPanel
            .style("top", "10px")
            .style("left", "10px")
            .style("background-color", "#444")
            .style("border", "1px solid #000000")
            .style("border-radius", "8px")
            .style("padding", "10px 40px")
            .style("cursor", "move")
            .style("width", this.W + "px")
            .position(this.W * 4 + 50, this.H * 0)
            .style("position", "fixed");

        // header for dragging the panel
        this.instructionHeader = createDiv("Draggable Intructions Panel");
        this.instructionHeader
            .parent(this.instructionPanel)
            .style("font-weight", "bold")
            .style("cursor", "move")
            .style("margin-bottom", "6px")
            .style("text-align", "center");

        this.captureBtn = null;
        this.reconnectBtn = null;
        this.sliders = [];
        this.sliderLabels = [];
        // group of sliders used to create sliders
        this.sliderGrps = this.app.public.sliderGrps;
    }
    /**
     * Set up all UI components:
     *  - buttons
     *  - sliders
     *  - instructions
     *  - make UI draggable
     */
    UISetup() {
        this.btnsSetup();
        this.slidersSetup();
        this.instructionSetup();
        this.draggableUI();
    }
    /**
     * Makes controlPanel and instructionPanel draggable.
     * add mousemove and mouseup to window.
     */
    draggableUI() {
        const ctrlPanel = this.controlPanel.elt;
        const header = this.controlHeader.elt;
        const instruction = this.instructionPanel.elt;
        const iheader = this.instructionHeader.elt;

        let oX = 0;
        let oY = 0;
        let dragging = null;
        function startDrag(e) {
            // determine which panel we are dragging
            if (e.target === ctrlPanel || e.target === header) {
                dragging = ctrlPanel;
            } else if (e.target === instruction || e.target === iheader) {
                dragging = instruction;
            } else {
                return;
            }
            e.preventDefault();
            oX = e.pageX - dragging.offsetLeft;
            oY = e.pageY - dragging.offsetTop;
        }

        ctrlPanel.onmousedown = startDrag;
        header.onmousedown = startDrag;
        instruction.onmousedown = startDrag;
        iheader.onmousedown = startDrag;

        window.onmousemove = (e) => {
            if (!dragging) return;

            // new position for the dragged panel
            dragging.style.left = e.pageX - oX + "px";
            dragging.style.top = e.pageY - oY + "px";
        };

        window.onmouseup = () => {
            // reset dragging object
            dragging = null;
        };
    }

    /**
     * create the Capture and Reconnect Camera buttons.
     * Capture toggles live/still mode
     * Reconnect recreate the webcam object
     */
    btnsSetup() {
        // button container
        const btnRow = createDiv();
        btnRow.parent(this.controlPanel);
        btnRow
            .style("margin-bottom", "12px")
            .style("display", "flex")
            .style("justify-content", "space-evenly")
            .style("align-items", "center")
            .style("margin-bottom", "8px");

        //capture button
        this.captureBtn = createButton("Capture");
        this.captureBtn
            .parent(btnRow)
            .size(70, 70)
            .style("background-color", "rgb(30, 224, 56)")
            .style("border-radius", "20%")
            .mousePressed(() => this.toggleLive());

        //reconnect button
        this.reconnectBtn = createButton("Reconnect Camera");
        this.reconnectBtn
            .parent(btnRow)
            .size(70, 70)
            .style("background-color", "rgb(30, 224, 56)")
            .style("border-radius", "20%")
            .mousePressed(() => this.reconnectCam());

        // add the buttons to the container for styling purposes
        this.captureBtn.parent(btnRow);
        this.reconnectBtn.parent(btnRow);
    }

    /**
     * create threshold sliders for each group defined in sliderGrps
     * sliderGrps = [ ["Red","Green","Blue"], ["HSV"], ["YCbCr"] ]
     * each slider is an instance of thresholdSlider(label, this.sliders).
     * after each group, insert a dividing line.
     */
    slidersSetup() {
        for (let c = 0; c < this.sliderGrps.length; c++) {
            for (let b = 0; b < this.sliderGrps[c].length; b++) {
                let label = this.sliderGrps[c][b];
                // create slider
                let slider = new thresholdSlider(label, this.sliders, this.app.public.imgProcesses);
                // create container for label and slider, label above their respective slider
                const row = createDiv().parent(this.controlPanel).style("white-space", "nowrap").style("margin", "0");
                slider.label.parent(row);
                slider.label.style("margin", "0");
                slider.slider.parent(row);
                slider.slider.style("margin-bottom", "0");
            }
            //seperate each group of sliders
            createDiv()
                .parent(this.controlPanel)
                .style("white-space", "nowrap")
                .style("padding", "1px")
                .style("margin", "15px 0")
                .style("background-color", "#000000");
        }
    }
    
    /**
     * add instructions content to instructions panel.
     * key mappings for the Face Detection filters.
     */
    instructionSetup() {
        createDiv("How to use this app:")
            .parent(this.instructionPanel)
            .style("font-weight", "bold")
            .style("margin-bottom", "8px");

        const lines = [
            "Press Capture to freeze/unfreeze the live webcam.",
            "Use each slider to adjust its channel's threshold in real time.",
            "In the Face Detection panel, press keys to adjust face filter:",
            "  1 – Normal",
            "  2 – Greyscale",
            "  3 – Blur",
            "  4 – HSV colorspace",
            "  5 – YCbCr colorspace",
            "  6 – Pixelate"
        ];

        for (let l of lines) {
            createDiv(l)
                .parent(this.instructionPanel)
                .style("margin", "0")
                .style("font-size", "14px")
                .style("line-height", "1.4");
        }
    }

    /**
     * Toggle between live feed video and still frame for processing
     * toggles this.app.public.live flag
     * capture a still frame from the webcam panel when live flag is toggled to false
     * updates button label and color when toggled
     */
    toggleLive() {
        //toggle live flag
        this.app.public.live = !this.app.public.live;
        //update public information
        this.app.updatePublic();
        if (!this.app.public.live) {
            // Capture the current webcam image if the live feed is off
            this.app.public.webcam?.captureFrame();
            this.captureBtn.html("Live Feed");
            this.captureBtn.style("background-color", "rgb(219, 24, 24)");
        } else {
            this.captureBtn.html("Capture");
            this.captureBtn.style("background-color", "rgb(30, 224, 56)");
        }
    }
    
    /**
     * Reinitialize the webcam feed
     * If not live, switch back to live
     * remove existing webcam element
     * call WebcamSetup() to recreate main webcam
     * update public state on success
     */
    async reconnectCam() {
        //toggle back to live
        if (!this.app.public.live) {
            this.toggleLive();
        }

        //begin reconnection
        console.log("Reconnecting webcam...");
        // remove current webcam element
        if (this.app.public.webcam?.cap) {
            this.app.public.webcam.cap.remove();
        }
        this.app.public.webcam = null;

        // recreate main webcam
        await WebcamSetup(this.app.sectionW * 0, this.app.sectionH * 0, this.app.sectionW, this.app.sectionH, this.app);

        //success log and update public 
        if (this.app.public.webcam) {
            this.app.public.webcam.capFrame = null;
            console.log("Webcam reconnected.");
            this.app.updatePublic();
        }
    }
}
