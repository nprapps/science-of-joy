var CustomElement = require("../customElement");

var isSafari = !!navigator.userAgent.match(/i(os|pad|phone)/i);

class VideoBackdrop extends CustomElement {
  static template = require("./_video-backdrop.html");
  static boundMethods = [];

  constructor() {
    super();

    this.buffers = [this.elements.buffer];
    var [ front ] = this.buffers;
    if (!isSafari) {
      var cloned = front.cloneNode();
      this.elements.videoContainer.appendChild(cloned);
      this.buffers.push(cloned);
    }
  }

  static observedAttributes = [
    "src",
    "poster",
    "cuesrc",
    "cueposter",
    "loop",
    "autoplay",
    "muted"
  ];
  static mirroredProps = [
    "src",
    "poster",
    "cuesrc",
    "cueposter",
    "loop",
    "autoplay",
    "muted"
  ];

  attributeChangedCallback(attr, was, value) {
    var [front, back] = this.buffers;
    var present = value != null;
    switch (attr) {
      case "cuesrc":
        if (isSafari) return;
        back.src = value;
        back.pause();
        break;

      case "cueposter":
        if (isSafari) return;
        back.poster = value;
        break;

      case "poster":
        front.poster = value;
        break;

      case "src":
        if (!value) {
          front.classList.remove("front");
          front.stop();
          return;
        }
        // check to see if this video was cued up
        if (!isSafari && value == back.getAttribute("src")) {
          // console.log(`Swapping buffers for ${value}`);
          // swap buffers
          front.classList.remove("front");
          this.buffers = [back, front];
          front = back;
        } else {
          // console.log(`Uncued src: ${value}`);
          front.src = value;
        }
        front.classList.add("front");
        front.play();
        break;

      case "loop":
        this.buffers.forEach(b => b.loop = present);
        break;

      case "autoplay":
        this.buffers.forEach(b => b.autoplay = present);
        break;

      case "muted":
        this.buffers.forEach(b => b.muted = present);
        break;
    }
  }

  get currentTime() {
    return this.buffers[0].currentTime;
  }

  set currentTime(t) {
    return (this.buffers[0].currentTime = t);
  }
}

VideoBackdrop.define("video-backdrop");
