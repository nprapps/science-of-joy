var CustomElement = require("../customElement");
var { watchSelector, unwatchSelector } = require("../watchSelector");

class AudioVisualizer extends CustomElement {
  constructor() {
    super();
    this.media = null;
    this.context = this.elements.canvas.getContext("2d");
    this.blobs = [];
    this.dots = [];
    this.source = null;
    this.playing = false;
    this.detail = 64;
  }

  static get template() {
    return require("./_audio-visualizer.html");
  }

  static get boundMethods() {
    return [
      "render",
      "getAnalysis",
      "onMediaPlayEvent",
      "patch",
      "tick"
    ]
  }

  static get mirroredProps() {
    return [
      "for",
      "color"
    ]
  }

  static get observedAttributes() {
    return [
      "for",
      "color"
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

  getAnalysis() {
    if (this.analyzer) {
      var bins = new Uint8Array(this.analyzer.fftSize);
      this.analyzer.getByteTimeDomainData(bins);
      // console.log(bins);
    } else {
      // fake it on iOS or old devices
      var bins = new Uint8Array(this.detail);
      var now = Date.now();
      var volume = Math.cos(now * .06) * Math.cos(now * .7) * Math.cos(now * 2);
      for (var i = 0; i < bins.length; i++) {
        var frequencies = [.2, .8, 1.3, 2.3, 5];
        var amplitudes = [.5, .3, .1, .05, .05];
        var offsets = [.3, .1, .7, 17, 0]
        var wave = 0;
        for (var f = 0; f < frequencies.length; f++) {
          wave += Math.sin((now + i + offsets[f]) * frequencies[f]) * amplitudes[f] * volume;
        }
        bins[i] = (wave * 128 + 128);
      }
    }
    this.render(bins);
  }

  onMediaPlayEvent(e) {
    var wasPlaying = this.playing;
    this.playing = this.media && !this.media.paused;
    if (this.playing && !wasPlaying) {
      // iOS doesn't support media streams
      if (this.media.captureStream) {
        this.audioContext = new AudioContext();
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = this.detail;
        this.amp = this.audioContext.createGain();
        this.amp.gain.value = 5;
        this.amp.connect(this.analyzer);
        // this.amp.connect(this.audioContext.destination);
        this.stream = this.media.captureStream();
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.source.connect(this.amp);
      }
      this.tick();
    }
  }

  tick() {
    if (this.playing) {
      this.getAnalysis();
      requestAnimationFrame(this.tick);
    } else {
      this.context.canvas.width = this.context.canvas.width;
    }
  }

  render(bins) {
    var context = this.context;
    var canvas = context.canvas;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = this.color || "black";
    var col = canvas.width / bins.length;
    var mid = col >> 1;
    for (var i = 0; i < bins.length; i++) {
      var b = bins[i];
      var offset = b / 255;
      var x = i * col + mid;
      var y = (canvas.height - 20) * (1 - offset) + 10;
      context.beginPath();
      context.arc(x, y, mid / 2, 0, Math.PI * 2);
      context.fill();
    }
  }

  patch(element) {
    if (element == this.media) return;
    this.unpatch();
    this.media = element;
    var events = "play pause playing ended".split(" ");
    events.forEach(e => element.addEventListener(e, this.onMediaPlayEvent));
    this.playing = false;
  }

  unpatch() {
    if (this.media) {
      var events = "play pause playing ended".split(" ");
      events.forEach(e => this.media.removeEventListener(e, this.onMediaPlayEvent));
    }
  }
}

AudioVisualizer.define("audio-visualizer");