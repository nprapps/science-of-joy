/*

Use this to broadcast events regardless of DOM relationships. Used for things
like announcing media playback in one place, so that other media can gracefully halt.

Also hosts a state object that's used for feature detection and global options.

*/
var events = {};

var state = {
  captions: true,
  autoplay: !window.matchMedia("(prefers-reduced-motion)").matches,
  isSafari: !!navigator.userAgent.match(/i(os|pad|phone)/i)
};

var on = function(e, callback) {
  if (!events[e]) {
    events[e] = [];
  }
  events[e].push(callback);
};

var off = function(e, callback) {
  if (!events[e]) return;
  events[e] = events[e].filter(c => c != callback);
};

var fire = function(e, ...args) {
  if (!events[e]) return;
  events[e].forEach(f => f(...args));
};

var set = function(key, value) {
  state[key] = value;
  fire("state", state);
  fire(`state:${key}`, value);
};

module.exports = { on, off, fire, state, set };

// after boot, dispatch events with current state
requestAnimationFrame(function() {
  console.log("Starting app state:", state);
  fire("state", state);
  for (var k in state) {
    fire(`state:${k}`, state[k]);
  }
});

// autoplay management for the one remaining stock video tag
var $ = require("./lib/qsa");
var autoVideo = $("video[autoplay]");
on("state:autoplay", function(enabled) {
  autoVideo.forEach(function(video) {
    video.toggleAttribute("autoplay", enabled);
    if (enabled && video.src) {
      var promise = video.play();
      // ignore play errors
      if (promise) promise.catch(_ => {});
    } else {
      video.pause();
    }
  });
});