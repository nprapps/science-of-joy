var $ = require("./lib/qsa");

// elements
require("./sketch-svg/sketch-svg");
require("./web-story/web-story");
require("./media-controls/media-controls");
require("./media-mute/media-mute");
require("./media-collection/media-collection");
require("./audio-visualizer/audio-visualizer");
require("./shader-box/shader-box");
require("./simple-video/simple-video");

// general story architecture
require("./stories");

// story-specific code
require("./stories/asmr");
require("./stories/nostalgia");
require("./stories/poetry");

// autoplay management
var autoChecks = $(".autoplay input");
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

// handle randomized video tags
$("video.randomized").forEach(function(video) {
  var sources = $("source", video);
  var choice = sources[Math.random() * sources.length | 0];
  video.setAttribute("src", choice.dataset.possible);
});

// handle the share button
var shareButton = $.one("button.share");
if ("share" in navigator) {
  shareButton.addEventListener("click", function() {
    var params = new URLSearchParams(window.location.hash.replace("#", ""));
    var story = params.get("story");
    var url = new URL(window.location.pathname, window.location.href);
    if (story) url.hash = `story=${story}`;
    console.log(url.toString());
    var shared = navigator.share({
      url
    });
  })
} else {
  shareButton.style.display = "none";
}