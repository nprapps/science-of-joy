var CustomElement = require("../customElement");
require("../media-controls/media-controls");

class SimpleVideo extends CustomElement {
  constructor() {
    super();

    // proxy video events/methods/properties
    var { video } = this.elements;
    ["timeupdate", "play", "pause", "load", "canplay"].forEach(type => video.addEventListener(type, this.proxyEvent));
    ["currentTime", "paused"].forEach(p => this.proxyProperty(p));
    ["play", "pause"].forEach(p => this.proxyMethod(p));

    this.elements.control.connect(this.elements.video);
  }

  static get boundMethods() {
    return ["proxyEvent"]
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
    return `
<style>
.inner-container {
  position: relative;
}

media-controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
  pointer-events: none;
}

video {
  max-width: 100%;
  max-height: 100%;
}
</style>
<div class="inner-container">
  <video as="video"></video>
  <media-controls as="control"></media-controls>
</div>
    `
  }
}

SimpleVideo.define("simple-video");
