var $ = require("../lib/qsa");
var container = $.one("#asmr");
var story = $.one("web-story", container);

var backdrop = $.one("video.backdrop", container);

// update whenever the container visits a new page
container.addEventListener("webstorypage", function(e) {
  var { element } = e.detail;
  var isMuted = backdrop.muted;
  backdrop.classList.remove("playing");
  backdrop.src = element.dataset.video;
  backdrop.setAttribute("poster", element.dataset.video + ".jpg");
});

// shut down the video when we leave the story
document.body.addEventListener("webstorypage", function(e) {
  if (e.target != story) {
    backdrop.src = "";
    return;
  }
});

// prevent harsh video transitions
var fadeVideo = function() {
  backdrop.classList.toggle("playing", !backdrop.autoplay || !backdrop.paused);
};

var events = ["play", "pause", "canplay", "canplaythrough"];
events.forEach(e => backdrop.addEventListener(e, fadeVideo));
fadeVideo();