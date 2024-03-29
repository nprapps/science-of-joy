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
    var paths = Array.from(this.querySelectorAll("path"));
    var speed = this.getAttribute("speed") || 1;
    var totalDuration = this.getAttribute("duration");
    speed = 1 / speed;
    var lastDuration = this.getAttribute("delay") || 10;
    var lengthTotal = paths.reduce((total, p) => total + p.getTotalLength(), 0);
    paths.forEach(function(p, i) {
      // p.setAttribute("vector-effect", "non-scaling-stroke");
      // bail for old Safari
      if (!p.animate) return;
      // cancel running animations
      var current = p.getAnimations();
      current.forEach(c => c.finish());
      var length = p.getTotalLength();
      p.style.strokeDasharray = [length, length].join(" ");
      var duration = totalDuration ? length / lengthTotal * totalDuration : length * (speed * 3);
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
