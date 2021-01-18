class SketchSVG extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<slot></slot>`;
    this.slotElement = this.shadowRoot.querySelector("slot");
    this.slotElement.addEventListener("slotchange", this.onSlotChange.bind(this));
  }

  connectedCallback() {
    this.sketch();
  }

  onSlotChange() {
    this.sketch();
  }

  sketch() {
    var paths = this.querySelectorAll("path");
    var lastDuration = 0;
    paths.forEach(function(p, i) {
      // bail for old Safari
      p.setAttribute("vector-effect", "non-scaling-stroke");
      p.style.strokeWidth = 3;
      if (!p.animate) return;
      // cancel running animations
      var current = p.getAnimations();
      current.forEach(c => c.finish());
      var length = p.getTotalLength();
      p.style.strokeDasharray = [length, length].join(" ");
      var duration = length * 3;
      var delay = lastDuration;
      lastDuration += duration;
      var animation = p.animate([
        { strokeDashoffset: length },
        { strokeDashoffset: 0 }
      ], {
        duration,
        delay,
        easing: "ease",
        fill: "both"
      });
    });
  }
}

customElements.define("sketch-svg", SketchSVG);