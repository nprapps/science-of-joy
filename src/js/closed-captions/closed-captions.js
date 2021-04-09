var CustomElement = require("../customElement");

var $ = require("../lib/qsa");
var events = require("../eventBus");

var tracks = $(`track[src*="vtt"]`);

class ClosedCaptions extends CustomElement {
  constructor() {
    super();

    tracks.forEach(this.connectTrack);
  }

  static get boundMethods() {
    return [
      "connectTrack",
      "disconnectTrack",
      "onCueChange",
      "onEnded"
    ]
  }

  connectTrack(t) {
    t.addEventListener("cuechange", this.onCueChange);
    t.addEventListener("ended", this.onEnded);
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
    if (track.activeCues.length) {
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

  static get template() {
    return require("./_closed-captions.html")
  }
}

ClosedCaptions.define("closed-captions");