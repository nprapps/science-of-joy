var CustomElement = require("../customElement.js");
var $ = require("../lib/qsa");
require("../video-backdrop/video-backdrop");

class WebStory extends CustomElement {

  static boundMethods = [
    "onClickPager",
    "setNav",
    "onKey"
  ]
  static template = require("./_web-story.html")

  constructor() {
    super();

    this.elements.previous.addEventListener("click", this.onClickPager);
    this.elements.next.addEventListener("click", this.onClickPager);
    this.elements.backdrop.addEventListener("click", () => this.shiftPage(1));

    this.addEventListener("keyup", this.onKey);

    var observer = new MutationObserver(this.setNav);
    observer.observe(this, { childList: true });

    this.reset();
  }

  reset() {
    this.selectedSection = null;
    // init at -1 so that the first page triggers an event
    this.selectedIndex = -1;
    this.setPage(-1);
  }

  connectedCallback() {
    this.setNav();
  }

  disconnectedCallback() {
  }

  attributeChangedCallback(attr, was, value) {
    console.log(attr, value);
  }

  onClickPager(e) {
    var target = e.currentTarget;
    var shift = target.dataset.shift * 1;
    this.shiftPage(shift);
  }

  onKey(e) {
    switch (e.key) {
      case "PageDown":
      case "ArrowDown":
      case "ArrowRight":
      case "space":
        this.shiftPage(1);
        break;

      case "PageUp":
      case "ArrowUp":
      case "ArrowLeft":
        this.shiftPage(-1);
        break;
    }
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
    index = index * 1;
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
      // only formally change page if it's a new page
      if (chosen != this.selectedSection) {
        if (chosen.dataset.goto) {
          return this.broadcast("webstorygoto", { story: chosen.dataset.goto });
        }
        var cursor = $.one("[data-focus]", chosen) || chosen;
        if (!cursor.hasAttribute("tabindex")) {
          cursor.setAttribute("tabindex", -1);
        }
        cursor.focus();
        requestAnimationFrame(() => this.activatePage(chosen));
        this.setAttribute("slug", chosen.dataset.slug);
        this.selectedSection = chosen;
        this.selectedIndex = index;
        // trigger lazy-load for this page and the next page
        this.elements.previous.classList.toggle("inert", index == 0);
        this.elements.next.classList.toggle("inert", index == sections.length - 1);
        requestAnimationFrame(() => this.loadLazy(chosen));
        var nextUp = sections[index + 1];
        if (nextUp) {
          this.loadLazy(nextUp);
          if ("video" in nextUp.dataset) {
            this.elements.backdrop.cuesrc = nextUp.dataset.video;
            this.elements.backdrop.cueposter = nextUp.dataset.videoPoster;
          }
        }
        this.setNav();
        this.broadcast("webstorypage", { page: this.selectedIndex, element: chosen });
      }

      // handle special section attributes
      var isTakeover = "takeover" in chosen.dataset;
      this.elements.controls.style.display = isTakeover ? "none" : "";
      var isTutorial = "tutorial" in chosen.dataset;
      this.elements.next.classList.toggle("tutorialized", isTutorial);
    }
  }

  activatePage(page) {
    // run custom element activations
    var activations = $("[data-activate]", page);
    activations.forEach(function(element) {
      var method = element.dataset.activate;
      if (element[method]) element[method]();
    });
    // also activate a video backdrop if it exists
    this.elements.backdrop.toggleAttribute("hidden", "video" in page.dataset);
    this.elements.backdrop.src = page.dataset.video || "";
    this.elements.backdrop.toggleAttribute("loop", "loop" in page.dataset);
    this.elements.backdrop.toggleAttribute("autoplay", "autoplay" in page.dataset);
  }

  loadLazy(container) {
    var media = $("[data-src],[data-poster],[data-style]", container);
    media.forEach(function(medium) {
      "src poster style".split(" ").forEach(function(prop) {
        if (prop in medium.dataset) {
          var value = medium.dataset[prop];
          medium.setAttribute(prop, value);
          medium.removeAttribute("data-" + prop);
        }
      });
    });
  }
}

WebStory.define("web-story");