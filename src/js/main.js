var $ = require("./lib/qsa");

// elements
require("./sketch-svg/sketch-svg");
require("./web-story/web-story");
require("./media-controls/media-controls");
require("./media-mute/media-mute");
require("./media-collection/media-collection");
require("./audio-visualizer/audio-visualizer");

// general story architecture
require("./stories");

// story-specific code
require("./asmr");

// autoplay management
var autoChecks = $("input.autoplay");
var autoVideo = $("video[autoplay]");

var updateAutoplay = function(enable) {
  autoChecks.forEach(c => c.checked = enable);
  autoVideo.forEach(function(video) {
    if (enable) {
      video.setAttribute("autoplay", "");
      if (video.src) video.play().catch(err => {});
    } else {
      video.removeAttribute("autoplay");
      video.pause();
    }
  });
}

autoChecks.forEach(c => c.addEventListener("change", () => updateAutoplay(c.checked)));