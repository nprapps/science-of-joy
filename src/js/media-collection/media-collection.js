var CustomElement = require("../customElement");

class MediaCollection extends CustomElement {
  constructor() {
    super();
    this.connected = [];
    this.addEventListener("slotchange", this.onSlotChange);
  }

  static get boundMethods() {
    return [
      "onSlotChange",
      "onMediaPlay",
      "onMediaTouch"
    ]
  }

  static get template() {
    return `
<style>
:host {
  display: block;
  max-width: 100%;
}
</style>
<slot as="slot"></slot>
    `;
  }

  connectedCallback() {
    this.onSlotChange();
  }

  disconnectedCallback() {
    this.onSlotChange();
  }

  onSlotChange() {
    this.connected.forEach(item => {
      item.removeEventListener("play", this.onMediaPlay);
      item.removeEventListener("click", this.onMediaTouch);
    });
    this.connected = this.elements.slot.assignedElements();
    this.connected.forEach(item => {
      item.addEventListener("play", this.onMediaPlay);
      item.addEventListener("click", this.onMediaTouch);
    });
  }

  onMediaPlay(e) {
    var target = e.target;
    this.connected.forEach(function(item) {
      if (item != target) {
        item.pause();
      }
    });
  }

  onMediaTouch(e) {
    var target = e.target;
    if (target.paused) {
      target.play();
    } else {
      target.pause();
    }
  }

}

MediaCollection.define("media-collection");