var $ = require("../lib/qsa");
var container = $.one("#asmr");
var story = $.one("web-story", container);

var backdrop = $.one("video.backdrop", container);

container.addEventListener("webstorypage", function(e) {
  
  var { element } = e.detail;
  var isMuted = backdrop.muted;
  backdrop.classList.remove("playing");
  backdrop.src = element.dataset.video;
});

document.body.addEventListener("webstorypage", function(e) {
  if (e.target != story) {
    backdrop.src = "";
    return;
  }
});

var fadeVideo = function() {
  backdrop.classList.toggle("playing", !backdrop.autoplay || !backdrop.paused);
}

fadeVideo();

var events = ["play", "pause", "canplay", "canplaythrough"];
events.forEach(e => backdrop.addEventListener(e, fadeVideo));