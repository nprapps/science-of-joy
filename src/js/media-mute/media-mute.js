var CustomElement = require("../customElement");
var events = require("../eventBus");
var { watchSelector, unwatchSelector } = require("../watchSelector");

class MediaMute extends CustomElement {
  constructor() {
    super();
    this.media = null;
    events.on("media-play", this.onPlayEvent);
    this.elements.muteButton.addEventListener("click", this.onClickedMute);
  }

  static get observedAttributes() {
    return ["for", "src"];
  }

  static get mirroredProps() {
    return ["for", "src"];
  }

  static get boundMethods() {
    return [
      "onWatch",
      "onClickedMute",
      "onPlayEvent"
    ];
  }

  connectedCallback() {

  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {

      case "for":
        if (was) unwatchSelector(`[id="${was}"]`, this.onWatch);
        if (value) watchSelector(`[id="${value}"]`, this.onWatch);
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
      element.muted = true;
      this.elements.muteButton.setAttribute("aria-pressed", "true");
    }
  }

  disconnect() {
    if (!this.media) return;
    this.media = null;
  }

  onWatch(element) {
    if (this.src) return;
    this.connect(element);
  }

  toggleMuted(update) {
    if (!this.media) return;
    if (typeof update == "undefined") {
      update = !this.media.muted;
    }
    this.media.muted = update;
    this.elements.muteButton.setAttribute("aria-pressed", update);
  }

  onClickedMute() {
    this.toggleMuted();
  }

  onPlayEvent(element) {
    if (this.media != element) this.toggleMuted(true);
  }

  static get template() {
    return require("./_media-mute.html");
  }

}

MediaMute.define("media-mute");