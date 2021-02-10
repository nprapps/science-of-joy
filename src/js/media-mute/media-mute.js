var CustomElement = require("../customElement");
var events = require("../eventBus");

class MediaMute extends CustomElement {
  constructor() {
    super();
    this.observer = new MutationObserver(this.onMutation);
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
      "onMutation",
      "onClickedMute",
      "onPlayEvent"
    ];
  }

  connectedCallback() {

  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {

      case "for":
        this.onMutation();
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
    element.muted = true;
    this.elements.muteButton.setAttribute("aria-pressed", "true");
  }

  disconnect() {
    if (!this.media) return;
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

  toggleMuted(update = !this.media.muted) {
    if (!this.media) return;
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

customElements.define("media-mute", MediaMute);