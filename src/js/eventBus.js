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