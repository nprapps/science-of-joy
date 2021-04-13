class CustomElement extends HTMLElement {
  constructor() {
    super();
    var def = new.target;

    this.elements = {};
    this.attachShadow({ mode: "open" });

    if (def.template) {
      this.shadowRoot.innerHTML = def.template;
      this.shadowRoot.querySelectorAll(`[as]`).forEach(el => {
        var name = el.getAttribute("as");
        this.elements[name] = el;
      });
    }

    if (def.boundMethods) {
      for (var f of def.boundMethods) {
        this[f] = this[f].bind(this);
      }
    }

    if (def.mirroredProps) {
      def.mirroredProps.forEach(f => {
        Object.defineProperty(this, f, {
          get() {
            return this.getAttribute(f);
          },

          set(v) {
            this.setAttribute(f, v);
          }
        })
      });
    }
  }
  
  broadcast(event, detail = {}) {
    var e = new CustomEvent(event, { bubbles: true, composed: true, detail });
    requestAnimationFrame(() => this.dispatchEvent(e));
  }

  static define(tag) {
    window.customElements.define(tag, this);
  }

}

module.exports = CustomElement;