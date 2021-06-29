var $ = require("./lib/qsa");
var track = require("./lib/tracking");
var events = require("./eventBus");
var { isSafari } = require("./features");

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
require("./web-story/web-story");

var bokeh = require("../assets/bokeh.glsl");
$("shader-box").forEach(el => el.setShader(bokeh));

// enable the drop-down menu
$(".drop-down").forEach(function(menu) {
  var button = $.one(".drop-toggle", menu);
  var ul = $.one("ul", menu);
  var items = $("ul a, ul button, ul input", menu);
  items.forEach(function(item) {
    item.setAttribute("tabindex", -1);
    item.addEventListener("click", () => button.click());
  });

  var menuAction = function(expanded, manual) {
    ul.setAttribute("aria-hidden", !expanded);
    items.forEach(item => item.setAttribute("tabindex", expanded ? 0 : -1));
    if (expanded) {
      items[0].focus();
      button.setAttribute("aria-expanded", "true");
      track("opened-menu");
    } else {
      button.removeAttribute("aria-expanded");
      if (!manual) button.focus();
    }
  }

  button.addEventListener("click", function(e) {
    e.stopPropagation();
    var expanded = menu.classList.toggle("expanded");
    menuAction(expanded);
  });

  menu.classList.add("enabled", true);
  menuAction(false);
});

// autoplay management
var autoChecks = $(".autoplay input");
var autoVideo = $("video[autoplay]");

var updateAutoplay = function(enable) {
  track("autoplay", enable ? "enabled" : "disabled");
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
  events.fire("autoplay-state", enable);
}

autoChecks.forEach(c => c.addEventListener("change", () => updateAutoplay(c.checked)));

// handle randomized video tags
$("video.randomized").forEach(function(video) {
  var sources = $("source", video);
  var choice = sources[Math.random() * sources.length | 0];
  video.setAttribute("data-src", choice.dataset.possible);
  video.setAttribute("data-poster", choice.dataset.possible + ".jpg");
  if (video.classList.contains("immediate")) {
    video.setAttribute("src", choice.dataset.possible);
  }
});
// also handle randomized section that can use the video-backdrop player
$("[data-randomized]").forEach(function(section) {
  var sources = $("source", section);
  if (!sources.length) return;
  var choice = sources[Math.random() * sources.length | 0];
  section.setAttribute("data-video", choice.dataset.possible);
  section.setAttribute("data-video-poster", choice.dataset.possible + ".jpg");
  section.setAttribute("data-autoplay", "");
  section.setAttribute("data-loop", "");
  if (section.classList.contains("immediate")) {
    section.setAttribute("src", choice.dataset.possible);
  }
});

// handle the share button
var shareButton = $.one("button.share");
if ("share" in navigator) {
  shareButton.addEventListener("click", function() {
    var params = new URLSearchParams(window.location.hash.replace("#", ""));
    var story = params.get("story");
    var url = new URL(window.location.pathname, window.location.href);
    if (story) url.hash = `story=${story}`;
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