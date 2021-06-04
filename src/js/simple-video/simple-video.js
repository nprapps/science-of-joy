var CustomElement = require("../customElement");
require("../media-controls/media-controls");

var isSafari = !!navigator.userAgent.match(/i(os|pad|phone)/i);

var observer = new IntersectionObserver(function(list) {
  for (var observation of list) {
    observation.target.rationVideo(observation.isIntersecting);
  }
});

class SimpleVideo extends CustomElement {

  static template = require("./_simple-video.html")
  static boundMethods = ["proxyEvent", "onMediaEvent"]
  constructor() {
    super();

    // proxy video events/methods/properties
    var { video } = this.elements;
    ["timeupdate", "play", "pause", "load", "canplay"].forEach(type => video.addEventListener(type, this.proxyEvent));
    ["timeupdate", "play", "pause", "load", "canplay"].forEach(type => video.addEventListener(type, this.onMediaEvent));
    ["currentTime", "paused"].forEach(p => this.proxyProperty(p));
    ["play", "pause"].forEach(p => this.proxyMethod(p));

    this.elements.control.connect(this.elements.video);
    if (isSafari) observer.observe(this);
  }

  static observedAttributes = ["src", "autoplay", "loop", "poster"]
  static mirroredProps = ["src"]

  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "src":
        this.elements.video.src = value;
      break;

      case "poster":
        this.elements.video.setAttribute("poster", value);
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

  rationVideo(attach) {
    if (attach) {
      this.elements.videoContainer.appendChild(this.elements.video);
    } else {
      this.elements.video.remove();
    }
  }

}

SimpleVideo.define("simple-video");
