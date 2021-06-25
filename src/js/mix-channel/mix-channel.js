var CustomElement = require("../customElement.js");
var track = require("../lib/tracking");
var trackMix = label => track("mix-channel", label);

var context = "webkitAudioContext" in window ? new webkitAudioContext() : new AudioContext();

class MixChannel extends CustomElement {
  static template = require("./_mix-channel.html");
  static boundMethods = ["onPlay", "onSlide"];
  constructor() {
    super();
    var { audio, play, slider } = this.elements;
    var source = (this.source = context.createMediaElementSource(audio));
    this.amp = context.createGain();
    this.amp.connect(context.destination);
    this.source.connect(this.amp);
    //audio.src = './assets/synced/audio/soundscape_tech.mp3.mp3'
    play.addEventListener("click", this.onPlay);
    slider.addEventListener("input", this.onSlide);
    slider.addEventListener("touchstart", this.onSlide);
    slider.addEventListener("mousedown", this.onSlide);
    slider.addEventListener("keydown", e => e.stopImmediatePropagation());
    slider.addEventListener("keyup", e => e.stopImmediatePropagation());
    slider.addEventListener("keypress", e => e.stopImmediatePropagation());
    document.body.addEventListener("webstorypage", (d) => {
      audio.pause();
      play.setAttribute("aria-pressed", "false");
      slider.style.opacity = 1;
      this.amp.gain.value = 0;
      context.suspend();
      slider.value = 0;
    });
  }

  static observedAttributes = ["src"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "src":
        this.elements.audio.src = value;
        break;
    }
  }

  onSlide() {
    var { audio, slider, play } = this.elements;
    if (audio.paused) audio.play();
    context.resume();
    this.amp.gain.value = slider.valueAsNumber;
    trackMix(this.src);
    if (slider.value > 0) {
      play.setAttribute("aria-pressed", "true");
    } else {
      play.setAttribute("aria-pressed", "false");
    }
  }

  onPlay() {
    var { audio, play, slider } = this.elements;
    context.resume();
    if (audio.paused) {
      audio.play();
      play.setAttribute("aria-pressed", "true");
      if (this.elements.slider.valueAsNumber == 0) {
        this.elements.slider.value = .5;
        this.amp.gain.value = .5;
      }
    } else {
      audio.pause();
      play.setAttribute("aria-pressed", "false");
    }
  }
}

MixChannel.define("mix-channel");
