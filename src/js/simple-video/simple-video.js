var CustomElement = require("../customElement");
require("../media-controls/media-controls");

class SimpleVideo extends CustomElement {
  constructor() {
    super();

    // proxy video events/methods/properties
    var { video } = this.elements;
    ["timeupdate", "play", "pause", "load", "canplay"].forEach(type => video.addEventListener(type, this.proxyEvent));
    ["timeupdate", "play", "pause", "load", "canplay"].forEach(type => video.addEventListener(type, this.onMediaEvent));
    ["currentTime", "paused"].forEach(p => this.proxyProperty(p));
    ["play", "pause"].forEach(p => this.proxyMethod(p));

    this.elements.control.connect(this.elements.video);
  }

  static get boundMethods() {
    return ["proxyEvent", "onMediaEvent"]
  }

  static get observedAttributes() {
    return ["src", "autoplay", "loop"];
  }

  static get mirroredProps() {
    return ["src"]
  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "src":
        this.elements.video.src = value;
      break;

      case "autoplay":
      case "loop":
        this.elements.video[attr] = value != null;
      break;

    }
  }

  onMediaEvent() {
    var paused = this.paused;
    this.elements.screen.style.opacity = paused ? 0.7 : 0;
  }

  proxyEvent(e) {
    var clone = new CustomEvent(e.type);
    this.dispatchEvent(clone);
  }

  proxyProperty(name) {
    var { video } = this.elements;
    Object.defineProperty(this, name, {
      get: () => video[name],
      set: value => video[name] = value
    });
  }

  proxyMethod(name) {
    var { video } = this.elements;
    this[name] = (...args) => {
      // console.log(this, name, ...args);
      video[name](...args);
    }
  }

  static get template() {
    return require("./_simple-video.html");
  }
}

SimpleVideo.define("simple-video");
