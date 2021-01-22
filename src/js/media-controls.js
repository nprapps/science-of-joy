var CustomElement = require("./customElement");

class MediaControls extends CustomElement {
  constructor() {
    super();
    this.observer = new MutationObserver(this.onMutation);
  }

  static get observedAttributes() {
    return ["for"];
  }

  static get mirroredProps() {
    return ["for"];
  }

  static get boundMethods() {
    return [
      "onMutation"
    ];
  }

  connectedCallback() {

  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {

      case "for":
        if (!value) {
          // disconnect listeners if they exist
        } else {
          // (re)connect listeners to media element
        }
        break;


    }
  }


}

customElements.define("media-controls", MediaControls);