var CustomElement = require("../customElement.js");
var $ = require("../lib/qsa");

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
      var cursor = $.one("[data-focus]", chosen) || chosen;
      if (!cursor.hasAttribute("tabindex")) {
        cursor.setAttribute("tabindex", -1);
      }
      cursor.focus();
      this.activatePage(chosen);
      this.setAttribute("slug", chosen.dataset.slug);
      this.selectedSection = chosen;
      this.selectedIndex = index;
      var isTakeover = "takeover" in chosen.dataset;
      this.elements.controls.style.display = isTakeover ? "none" : "";
      // trigger lazy-load for this page and the next page
      this.loadLazy(chosen);
      var nextUp = sections[index + 1];
      if (nextUp) {
        this.loadLazy(nextUp);
      }
    }
    this.setNav();
    this.broadcast("webstorypage", { page: this.selectedIndex });
  }

  activatePage(page) {
    // run custom element activations
    var activations = $("[data-activate]", page);
    activations.forEach(function(element) {
      var method = element.dataset.activate;
      if (element[method]) element[method]();
    });
  }

  loadLazy(container) {
    var media = $("[data-src]", container);
    media.forEach(function(medium) {
      var src = medium.dataset.src;
      medium.setAttribute("src", src);
      medium.removeAttribute("data-src");
    });
  }
}

customElements.define("web-story", WebStory);