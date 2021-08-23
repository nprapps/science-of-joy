var $ = require("./lib/qsa");
var track = require("./lib/tracking");
var sharedState = require("./sharedState");
var { isSafari } = sharedState.state;

// elements
require("./audio-visualizer/audio-visualizer");
require("./closed-captions/closed-captions");
require("./media-collection/media-collection");
require("./media-controls/media-controls");
require("./media-mute/media-mute");
require("./mix-channel/mix-channel");
require("./shader-box/shader-box");
require("./simple-video/simple-video");
require("./sketch-svg/sketch-svg");
require("./state-check/state-check");
require("./web-story/web-story");

// force all shader boxes from JS, instead of using fetch
var bokeh = require("../assets/bokeh.glsl");
$("shader-box").forEach(el => el.setShader(bokeh));

// load the menu
require("./navMenu");


// handle the share button
var shareButton = $.one("button.share");
if ("share" in navigator) {
  shareButton.addEventListener("click", function() {
    var params = new URLSearchParams(window.location.hash.replace("#", ""));
    var story = params.get("story");
    var path = window.location.pathname.replace(/\/$/, "");
    var url = new URL(`./${story}.html`, window.location.href);
    track("shared", story);
    console.log(`Sharing: ${url.toString()}`);
    var shared = navigator.share({
      url
    });
  })
} else {
  shareButton.style.display = "none";
}

// general story architecture
require("./stories");

// story-specific code
require("./stories/about");
require("./stories/art");
require("./stories/asmr");
require("./stories/nostalgia");
require("./stories/poetry");

// fix viewport height units in Safari
if (isSafari) {
  var setVH = function() {
    var vh = window.innerHeight / 100;
    document.body.style.setProperty("--vh", `${vh}px`);
  };
  window.addEventListener("resize", setVH);
  setVH();
}

// handle NPR One
var here = new URL(window.location.href);
var renderPlatform = here.searchParams.get("renderPlatform");
if (renderPlatform && renderPlatform.match(/nprone/)) {
  document.body.classList.add("nprone");
}