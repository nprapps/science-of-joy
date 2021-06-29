// routing and story transition code
var $ = require("./lib/qsa");
var hashUtils = require("./hashUtils");
var events = require("./eventBus");
var track = require("./lib/tracking");
var lastPageID = null;

var wait = (d = 1000) => new Promise(ok => setTimeout(ok, d));
var nextTick = () => new Promise(ok => requestAnimationFrame(ok));

var history = new Set();
var storyPaths = $(".story-route:not(.exclude-random)").map(s => s.id);
var intro = $.one("#intro");
var first = true;

var getStoryElement = function(container) {
  if (!container) return null;
  return container.tagName == "WEB-STORY" ? container : $.one("web-story", container);
};

var setStory = async function(story, page = 0) {
  var current = $.one(".story-route.active");
  var activated = $.one("#" + story);
  if (!activated) activated = intro;
  if (current && current != activated) {
    current.classList.remove("entering");
    current.classList.add("exiting");
    await wait(500);
    current.classList.remove("active");
    // completely deactivate the previous story
    var previousStory = getStoryElement(current);
    if (previousStory) previousStory.reset();
  }
  activated.classList.remove("exiting");
  if (history.size) {
    activated.classList.add("entering");
  }
  // activate the new story
  await new Promise(ok => requestAnimationFrame(ok));
  activated.classList.add("active");
  var storyElement = getStoryElement(activated);
  if (storyElement) storyElement.setPage(page);
  hashUtils.setParams({ story, page });
  var pageID = `${story}-${page}`;
  if (pageID != lastPageID) {
    track("story-page", `${story}-${page}`);
    lastPageID = pageID;
  }
  var historyLength = history.size;
  history.add(story);
  if (history.size != historyLength) {
    track("history-size", history.size);
  }
  return activated;
}

var hashRoute = async function() {
  var params = hashUtils.getParams();
  var story = params.story || "intro";
  var page = params.page;
  if (first) {
    var section = $.one(`#${story} section`);
    if (section) section.setAttribute("data-tutorial", "true");
    first = false;
  }
  document.body.dataset.story = story;
  document.body.dataset.page = page;
  var current = await setStory(story, page);
};

// give the event loop a chance to terminate, then route
requestAnimationFrame(hashRoute);
window.addEventListener("hashchange", hashRoute);

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
  var tutorials = $("[data-tutorial]");
  tutorials.forEach(t => t.removeAttribute("data-tutorial"));
  document.body.scrollTop = document.documentElement.scrollTop = 0;
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