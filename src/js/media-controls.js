var CustomElement = require("./customElement");

class MediaControls extends CustomElement {
  constructor() {
    super();
    this.observer = new MutationObserver(this.onMutation);
    this.media = null;
  }

  static get observedAttributes() {
    return ["for"];
  }

  static get mirroredProps() {
    return ["for"];
  }

  static get boundMethods() {
    return [
      "onMutation",
      "onMediaUpdate"
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
    if (!id) return;
    var located = document.getElementById(id);
    this.connect(located);
  }

  onMediaUpdate(e) {
    console.log(e);
  }

}

customElements.define("media-controls", MediaControls);