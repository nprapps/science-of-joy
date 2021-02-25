// routing and story transition code
var $ = require("./lib/qsa");
var hashUtils = require("./hashUtils");
var events = require("./eventBus");

var wait = (d = 1000) => new Promise(ok => setTimeout(ok, d));

var history = new Set();
var storyPaths = $(".story-route:not(#intro)").map(s => s.id);
var intro = $("#intro");

var setStory = async function(story) {
  var current = $.one(".story-route.active");
  if (current) {
    current.classList.remove("entering");
    current.classList.add("exiting");
    await wait(500);
    current.classList.remove("active");
  }
  var activated = $.one("#" + story);
  if (!activated) activated = $("#intro");
  activated.classList.remove("exiting");
  if (history.size) {
    activated.classList.add("entering");
  }
  activated.classList.add("active");
  var storyElement = activated.tagName == "WEB-STORY" ? activated : $.one("web-story", activated);
  if (storyElement != intro) storyElement.setPage(0);
  hashUtils.setParams({ story });
  history.add(story);
  return activated;
}

var hashRoute = async function() {
  var params = hashUtils.getParams();
  var story = params.story || "intro";
  var page = params.page;
  var current = await setStory(story);
  if (current && page) {
    var webstory = current.tagName == "WEB-STORY" ? current : $.one("web-story", current);
    if (webstory.setPage) {
      webstory.setPage(page);
    }
  }
};

hashRoute();

// handle internal story link clicks
document.body.addEventListener("click", function(e) {
  var target = e.target;
  if (e.target.dataset.href) {
    var { href } = e.target.dataset;
    setStory(href);
  }
});

// various web story events
// update URL for sharing on page change
document.body.addEventListener("webstorypage", function(e) {
  var now = hashUtils.getParams();
  var { story } = now;
  var { page } = e.detail;
  var updated = { story, page };
  hashUtils.setParams(updated);
  // tell currently playing media files to pause
  events.fire("media-play", null);
});

// handle goto events
document.body.addEventListener("webstorygoto", function(e) {
  var { story } = e.detail;
  setStory(story);
});

document.body.addEventListener("webstoryclose", function() {
  setStory("intro");
});

var pickRandom = function() {
  var available = storyPaths.filter(s => !history.has(s));
  // maybe you've seen everything?
  if (!available.length) {
    console.log("All stories visited, resetting history");
    var current = hashUtils.getParams().story;
    history = new Set([current]);
    available = storyPaths.filter(s => s != current);
  }
  var selected = available[(Math.random() * available.length) | 0];
  history.add(selected);
  setStory(selected);
}

var randomButtons = $(".random-choice");
randomButtons.forEach(b => b.addEventListener("click", pickRandom));