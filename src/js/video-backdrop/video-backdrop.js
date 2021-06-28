var CustomElement = require("../customElement");
var events = require("../eventBus");

var { isSafari } = require("../features");

var observer = new IntersectionObserver(function(list) {
  for (var observation of list) {
    observation.target.attachBuffers(observation.isIntersecting);
  }
});

class VideoBackdrop extends CustomElement {
  static template = require("./_video-backdrop.html");
  static boundMethods = ["onGlobalAutoplay"];

  constructor() {
    super();

    this.buffers = [this.elements.buffer];
    var [ front ] = this.buffers;
    if (!isSafari) {
      // good browsers get buffering help
      var cloned = front.cloneNode();
      this.elements.videoContainer.appendChild(cloned);
      this.buffers.push(cloned);
    } else {
      // bad browsers have to unload video when invisible
      observer.observe(this);
    }

    this.globalAutoplay = true;
    events.on("autoplay-state", this.onGlobalAutoplay);
  }

  static observedAttributes = [
    "src",
    "poster",
    "cuesrc",
    "cueposter",
    "loop",
    "autoplay",
    "muted",
    "anchor"
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
      case "anchor":
        front.style.setProperty("object-position", value);
        back.style.setProperty("object-position", value);
        break;

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
        if (this.globalAutoplay) front.play();
        break;

      case "loop":
        this.buffers.forEach(b => b.loop = present);
        break;

      case "autoplay":
        var auto = present && this.globalAutoplay;
        this.buffers.forEach(b => {
          b.autoplay = auto;
        });
        if (auto && front.src) {
          front.play();
        } else {
          front.pause();
        }
        break;

      case "muted":
        this.buffers.forEach(b => b.muted = present);
        break;
    }
  }

  onGlobalAutoplay(enabled) {
    this.globalAutoplay = enabled;
    this.attributeChangedCallback("autoplay", null, this.autoplay);
  }

  // literally remove video elements from the DOM when the backdrop is hidden
  // trying really hard to get under that Safari soft limit
  attachBuffers(attach) {
    if (attach) {
      this.buffers.forEach(b => this.elements.videoContainer.appendChild(b));
    } else {
      this.buffers.forEach(b => b.remove());
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
