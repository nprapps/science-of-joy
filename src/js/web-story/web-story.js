var CustomElement = require("../customElement.js");

class WebStory extends CustomElement {
  constructor() {
    super();

    this.elements.previous.addEventListener("click", this.onClickPager);
    this.elements.next.addEventListener("click", this.onClickPager);
    this.elements.backdrop.addEventListener("click", () => this.shiftPage(1));
    this.elements.close.addEventListener("click", this.onClose);

    var observer = new MutationObserver(this.setNav);
    observer.observe(this, { childList: true });

    this.reset();
  }

  static get boundMethods() {
    return [
      "onClickPager",
      "onClose",
      "setNav"
    ];
  }

  static get template() {
    return require("./_web-story.html")
  }

  reset() {
    this.selectedSection = null;
    this.selectedIndex = 0;
    this.setPage(0);
  }

  connectedCallback() {
    this.setNav();
  }

  disconnectedCallback() {
  }

  attributeChangedCallback(attr, was, value) {
    console.log(attr, value);
  }

  broadcast(event, detail = {}) {
    var e = new CustomEvent(event, { bubbles: true, composed: true, detail });
    this.dispatchEvent(e);
  }

  onClickPager(e) {
    var target = e.currentTarget;
    var shift = target.dataset.shift * 1;
    this.shiftPage(shift);
  }

  onClose() {
    this.broadcast("webstoryclose");
  }

  shiftPage(shift = 1) {
    var sections = this.elements.slot.assignedElements();
    var index = (this.selectedIndex * 1 + shift) % sections.length;
    if (index < 0) index = sections.length + index;
    this.setPage(index);
  }

  setNav() {
    var sections = this.elements.slot.assignedElements();
    var { filmstrip } = this.elements;
    filmstrip.innerHTML = "";
    sections.forEach(function(s) {
      var block = document.createElement("div");
      block.className = "block";
      block.classList.toggle("active", !s.hasAttribute("hidden"));
      filmstrip.appendChild(block);
    });
  }

  setPage(index) {
    var sections = Array.from(this.elements.slot.assignedElements());
    var chosen = sections[index];
    for (var s of sections) {
      if (s == chosen) {
        s.removeAttribute("hidden");
      } else {
        s.setAttribute("hidden", "");
      }
    }
    if (chosen) {
      if (chosen.dataset.goto) {
        return this.broadcast("webstorygoto", { story: chosen.dataset.goto });
      }
      this.setAttribute("slug", chosen.dataset.slug);
      this.selectedSection = chosen;
      this.selectedIndex = index;
      this.elements.controls.style.display = "takeover" in chosen.dataset ? "none" : "";
    }
    this.setNav();
    this.broadcast("webstorypage", { page: this.selectedIndex })
  }
}

customElements.define("web-story", WebStory);