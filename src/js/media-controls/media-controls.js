var CustomElement = require("../customElement");
var events = require("../eventBus");

class MediaControls extends CustomElement {
  constructor() {
    super();
    this.observer = new MutationObserver(this.onMutation);
    this.media = null;
    this.elements.playButton.addEventListener("click", this.onClickedPlay);
    events.on("media-play", this.onPlayEvent);
  }

  static get observedAttributes() {
    return ["for", "label", "src"];
  }

  static get mirroredProps() {
    return ["for", "src"];
  }

  static get boundMethods() {
    return [
      "onMutation",
      "onMediaUpdate",
      "onClickedPlay",
      "onPlayEvent"
    ];
  }

  static get subscriptions() {
    return [
      "play",
      "pause",
      "timeupdate",
      "canplaythrough"
    ]
  }

  connectedCallback() {

  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {

      case "for":
        this.onMutation();
        break;

      case "label":
        this.elements.labels.innerHTML = value;
        break;

      case "src":
        var media = document.createElement("audio");
        media.src = value;
        this.connect(media);
        break;

    }
  }

  connect(element) {
    if (element == this.media) return;
    if (this.media) {
      this.disconnect();
    }
    // subscribe to events
    this.media = element;
    if (element) {
      for (var e of MediaControls.subscriptions) {
        element.addEventListener(e, this.onMediaUpdate);
      }
    }
  }

  disconnect() {
    if (!this.media) return;
    // unsubscribe from events
    for (var e of MediaControls.subscriptions) {
      this.media.removeEventListener(e, this.onMediaUpdate);
    }
    this.media = null;
  }

  // checks to see if there's still an element matching the for attribute
  onMutation() {
    var id = this.for;
    var src = this.src;
    if (!id || src) return;
    var located = document.getElementById(id);
    this.connect(located);
  }

  onMediaUpdate(e) {
    var { duration, currentTime, paused } = this.media;
    var ratio = currentTime / duration;
    var { labels, progress, playIcon, pauseIcon } = this.elements;
    try {
      var pLength = Math.ceil(progress.getTotalLength());
      var pDash = Math.ceil(ratio * pLength);
      progress.style.strokeDasharray = [pLength, pLength].join(" ");
      progress.style.strokeDashoffset = pDash;
      if (paused) {
        playIcon.style.display = "";
        pauseIcon.style.display = "none";
      } else {
        playIcon.style.display = "none";
        pauseIcon.style.display = "";
      }
    } catch (err) {
      // SVG code will fail if the button isn't immediately visible, it's fine.
    }
  }

  onClickedPlay() {
    if (!this.media) return;
    if (this.media.paused) {
      this.media.currentTime = 0;
      this.media.play();
      events.fire("media-play", this.media);
    } else {
      this.media.currentTime = 0;
      this.media.pause();
    }
  }

  onPlayEvent(element) {
    if (this.media != element) this.media.pause();
  }

  static get template() {
    return require("./_media-controls.html");
  }

}

customElements.define("media-controls", MediaControls);