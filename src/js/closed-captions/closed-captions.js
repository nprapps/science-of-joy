var CustomElement = require("../customElement");

var $ = require("../lib/qsa");
var events = require("../eventBus");

var tracks = $(`track[src*="vtt"]`);

const CAPTION_SETTINGS = "caption-settings";

var captionChecks = $(".captioning.checks input");

var updateCaptions = function(enabled) {
  captionChecks.forEach(c => c.checked = enabled);
  events.fire(CAPTION_SETTINGS, { disabled: !enabled });
};

captionChecks.forEach(function(input) {
  input.addEventListener("change", e => updateCaptions(e.target.checked));
});

class ClosedCaptions extends CustomElement {

  static boundMethods = [
    "connectTrack",
    "disconnectTrack",
    "onCueChange",
    "onEnded"
  ]

  constructor() {
    super();

    tracks.forEach(this.connectTrack);
    events.on(CAPTION_SETTINGS, e => this.toggleAttribute("disabled", e.disabled));
  }

  connectedCallback() {
    document.body.addEventListener("webstorypage", this.onEnded);
  }

  disconnectedCallback() {
    document.body.removeEventListener("webstorypage", this.onEnded);
  }

  connectTrack(t) {
    t.addEventListener("cuechange", this.onCueChange);
    t.addEventListener("ended", this.onEnded);
    // monkeypatch ended events onto the track
    var closest = t.closest("audio, video");
    if (closest && !closest.onended) {
      closest.onended = function() {
        var e = new CustomEvent("ended");
        t.dispatchEvent(e);
      };
    }
  }

  disconnectTrack(t) {
    t.removeEventListener("cuechange", this.onCueChange);
    t.removeEventListener("ended", this.onEnded);
  }

  onCueChange(e) {
    var track = e.target.track;
    var media = e.target.closest("audio, video");
    var enabled = !this.hasAttribute("disabled");
    if (enabled && track.activeCues.length && media && !media.paused) {
      var [ cue ] = track.activeCues;
      this.elements.caption.style.display = ""
      this.elements.caption.innerHTML = cue.text;
    } else {
      this.elements.caption.style.display = "none";
    }
  }

  onEnded(e) {
    this.elements.caption.style.display = "none";
  }

  static template = require("./_closed-captions.html")
}

ClosedCaptions.define("closed-captions");

module.exports = { ClosedCaptions, CAPTION_SETTINGS };