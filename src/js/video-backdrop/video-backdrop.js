var CustomElement = require("../customElement");

class VideoBackdrop extends CustomElement {

  static template = require("./_video-backdrop.html")
  static boundMethods = []

  constructor() {
    super();

    this.buffers = [
      this.elements.bufferA,
      this.elements.bufferB
    ];
  }

  static observedAttributes = ["src", "poster", "cuesrc", "cueposter", "loop", "autoplay", "muted"]
  static mirroredProps = ["src", "poster", "cuesrc", "cueposter", "loop", "autoplay", "muted"];

  attributeChangedCallback(attr, was, value) {
    var [ front, back ] = this.buffers;
    var present = value != null;
    switch (attr) {
      case "cuesrc":
        back.src = value;
        break;

      case "cueposter":
        back.poster = value;
        break;

      case "poster":
        front.poster = value;
        break;

      case "src":
        if (!value) {
          front.classList.remove("front");
          return;
        }
        // check to see if this video was cued up
        if (value == back.getAttribute("src")) {
          console.log(`Swapping buffers for ${value}`)
          // swap buffers
          front.classList.remove("front");
          back.classList.add("front");
          this.buffers = [ back, front ];
        } else {
          console.log(`Uncued src: ${value}`)
          front.src = value;
          front.classList.add("front");
        }
        break;

      case "loop":
        front.loop = present;
        back.loop = present;
        break;

      case "autoplay":
        front.autoplay = present;
        back.autoplay = present;
        break;

      case "muted":
        front.muted = present;
        back.muted = present;
    }
  }

  get currentTime() {
    return this.buffers[0].currentTime;
  }

  set currentTime(t) {
    return this.buffers[0].currentTime = t;
  }

}

VideoBackdrop.define("video-backdrop");