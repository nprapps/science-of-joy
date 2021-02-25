/*

Use this to broadcast events regardless of DOM relationships. Used for things
like announcing media playback in one place, so that other media can gracefully halt.

*/
var events = {};

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
}

module.exports = { on, off, fire };