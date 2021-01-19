// require("./lib/pym");

var $ = require("./lib/qsa");
require("./web-story/web-story");
require("./sketch-svg");

var wait = (d = 1000) => new Promise(ok => setTimeout(ok, d));

var getHashParams = function() {
  var hash = window.location.hash.replace(/^#/, "");
  var params = new URLSearchParams(hash);
  return Object.fromEntries(params);
};

var setHashParams = function(params) {
  var usp = new URLSearchParams();
  for (var key in params) {
    usp.set(key, params[key]);
  }
  window.location.hash = "#" + usp.toString();
};

var history = [];

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
  window.location.hash = `#story=${story}`;
  history.push(story);
  return activated;
}

var hashRoute = async function() {
  var params = getHashParams();
  var story = params.story || "intro";
  var page = params.page;
  var current = await setStory(story);
  if (current && page) {
    if (current.setPage) {
      current.setPage(page);
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
document.body.addEventListener("webstorypage", function(e) {
  var now = getHashParams();
  var { story } = now;
  var { page } = e.detail;
  var updated = { story, page };
  setHashParams(updated);
});

document.body.addEventListener("webstorygoto", function(e) {
  var { story } = e.detail;
  setStory(story);
});