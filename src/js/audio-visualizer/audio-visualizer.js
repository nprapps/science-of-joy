var CustomElement = require("../customElement");
var { watchSelector, unwatchSelector } = require("../watchSelector");

class AudioVisualizer extends CustomElement {
  constructor() {
    super();
    this.media = null;
    this.context = this.elements.canvas.getContext("2d");
    this.blobs = [];
    this.dots = [];
    this.audioContext = new AudioContext();
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 256;
    this.source = null;
    this.tick();
  }

  static get template() {
    return require("./_audio-visualizer.html");
  }

  static get boundMethods() {
    return [
      "render",
      "onAudio",
      "patch",
      "tick"
    ]
  }

  static get observedAttributes() {
    return [
      "for"
    ]
  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "for":
        if (was) unwatchSelector(`[id="${was}"]`, this.patch);
        if (value) watchSelector(`[id="${value}"]`, this.patch);
        break;
    }
  }

  onAudio() {
    var bins = new Uint8Array(this.analyzer.fftSize);
    // var bins = new Uint8Array(this.analyzer.frequencyBinCount);
    this.analyzer.getByteTimeDomainData(bins);
    // this.analyzer.getByteFrequencyData(bins);
    this.render(bins);
  }

  tick() {
    this.onAudio();
    requestAnimationFrame(this.tick);
  }

  render(bins) {
    var context = this.context;
    var canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var col = canvas.width / bins.length;
    var mid = col >> 1;
    for (var i = 0; i < bins.length; i++) {
      var b = bins[i];
      var offset = b / 255;
      var x = i * col + mid;
      var y = (canvas.height - 20) * (1 - offset) + 10;
      context.beginPath();
      context.arc(x, y, 2, 0, Math.PI * 2);
      context.fill();
    }
  }

  patch(element) {
    if (element == this.media) return;
    this.unpatch();
    this.media = element;
    this.source = this.audioContext.createMediaElementSource(element);
    var gain = this.audioContext.createGain();
    this.source.connect(gain);
    gain.connect(this.analyzer);
    gain.connect(this.audioContext.destination);
    gain.gain.value = 1;
    // element.addEventListener("timeupdate", this.onAudio);
  }

  unpatch() {
    if (!this.media) return;
    this.source.disconnect();
  }
}

AudioVisualizer.define("audio-visualizer");