var $ = (s, d = document) => Array.prototype.slice.call(d.querySelectorAll(s));

$.one = (s, d = document) => d.querySelector(s);

$.within = (s, d = document) => {
  var root = d.querySelector(s);
  var all = q => Array.from(root.querySelectorAll(q));
  all.one = q => root.querySelector(q);
  return all;
}

module.exports = $;