// require("./lib/pym");

var $ = require("./lib/qsa");
require("./web-story/web-story");
require("./sketch-svg");

var stories = $(".story-container");

var wait = (d = 1000) => new Promise(ok => setTimeout(ok, d));

var history = [];

var onHash = async function() {
  var hash = window.location.hash.replace(/^#/, "") || "intro";
  var current = $.one(".story-container.active");
  if (current) {
    current.classList.remove("entering");
    current.classList.add("exiting");
    await wait(1000);
    current.classList.remove("active");
  }
  var activated = $.one("#" + hash);
  activated.classList.remove("exiting");
  if (history.length) {
    activated.classList.add("entering");
  }
  activated.classList.add("active");
  history.push(hash);
};

window.addEventListener("hashchange", onHash);

onHash();

document.body.addEventListener("webstorypage", e => console.log(e.target, e.detail));