// require("./lib/pym");
require("./sketch-svg");
require("./web-story/web-story");
require("./media-controls/media-controls");

var $ = require("./lib/qsa");
var hashUtils = require("./hashUtils");

var wait = (d = 1000) => new Promise(ok => setTimeout(ok, d));

var history = new Set();
var storyPaths = $(".story-route:not(#intro)").map(s => s.id);

var setStory = async function(story) {
  var current = $.one(".story-route.active");
  if (current) {
    current.classList.remove("entering");
    current.classList.add("exiting");
    await wait(1000);
    current.classList.remove("active");
  }
  var activated = $.one("#" + story);
  activated.classList.remove("exiting");
  if (history.length) {
    activated.classList.add("entering");
  }
  activated.classList.add("active");
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
    history = new Set();
    available = storyPaths;
  }
  var selected = available[(Math.random() * available.length) | 0];
  history.add(selected);
  setStory(selected);
}

// chooser code
var choosers = $(".chooser");
choosers.forEach(function(menu) {
  // add random button listener
  var randomButton = $.one(".random-choice", menu);
  randomButton.addEventListener("click", pickRandom);
  return;
  // shuffle items
  var items = $("li", menu);
  var shuffle = items.map(item => [Math.random(), item]);
  shuffle.sort((a, b) => a[0] - b[0]);
  var ul = $.one("ul", menu);
  shuffle.forEach(([_, item]) => ul.appendChild(item));
  // expander
  var expandButton = $.one(".expander", menu);
  expandButton.addEventListener("click", function() {
    menu.classList.remove("collapsed");
  })
});