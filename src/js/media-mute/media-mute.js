var CustomElement = require("../customElement");
var sharedState = require("../sharedState");
var { watchSelector, unwatchSelector } = require("../watchSelector");
var track = require("../lib/tracking");
var trackMute = label => track("media-mute", label);

class MediaMute extends CustomElement {

  static boundMethods = [
    "onWatch",
    "onClickedMute",
    "onVolumeChange",
    "onPlayEvent"
  ]
  
  constructor() {
    super();
    this.media = null;
    sharedState.on("media-play", this.onPlayEvent);
    this.elements.muteButton.addEventListener("click", this.onClickedMute);
  }

  static observedAttributes = ["for", "src"]
  static mirroredProps = ["for", "src"]

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
    element.addEventListener("volumechange", this.onVolumeChange);
    this.media = element;
    if (element) {
      element.muted = true;
      this.elements.muteButton.setAttribute("aria-pressed", "true");
    }
  }

  disconnect() {
    if (!this.media) return;
    this.media.removeEventListener("volumechange", this.onVolumeChange);
    this.media = null;
  }

  onWatch(element) {
    if (this.src) return;
    this.connect(element);
  }

  onVolumeChange() {
    if (!this.media) return;
    this.toggleMuted(this.media.muted); 
  }

  toggleMuted(update) {
    if (!this.media) return;
    if (typeof update == "undefined") {
      update = !this.media.muted;
    }
    trackMute(update ? "muted" : "unmuted");
    this.media.muted = update;
    this.elements.muteButton.setAttribute("aria-pressed", update);
  }

  onClickedMute() {
    this.toggleMuted();
  }

  onPlayEvent(element) {
    if (this.hasAttribute("persistent")) return;
    if (this.media != element) this.toggleMuted(true);
  }

  static get template() {
    return require("./_media-mute.html");
  }

}

MediaMute.define("media-mute");