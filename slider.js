/**
 * thresholdSlider class
 *
 * Renders a slider (0–255) and a label showing its current value.
 * run events on input (live update) and on change (log to console).
 */
class thresholdSlider {
    constructor(channel, sliders, channels) {
        this.channel = channel;
        this.channels = channels;
        this.slider = createSlider(0, 255, 128, 1);
        this.slider.style("width", "200px");
        this.color = this.channel + " Threshold";

        //label showing "(channel) Threshold: (slider value)"
        this.label = createDiv(this.color + ": " + this.slider.value());

        // bind events
        this.slider.changed(() => this.onSliderChange());
        this.slider.input(() => this.onSliderInput());

        // add this slider to the sliders array
        if (sliders) {
            sliders.push(this);
        }
    }

    // returns current slider value
    getValue() {
        return this.slider.value();
    }

    //write to console the value of the slider
    onSliderChange() {
        console.log(this.channel + " Threshold: " + this.slider.value());
    }

    //update label as slider is being moved, remove cached image of the associated channel 
    onSliderInput() {
        this.label.html(this.channel + " Threshold: " + this.slider.value());
        this.channels.forEach((channel) => {
            if (channel.channel === this.color) {
                channel.img = null;
                return;
            }
        });
    }
}
