var $ = require("../lib/qsa");

var intros = $(".intro.story-route");

intros.forEach(function(intro) {
  var backdrop = $.one(".backdrop", intro);
  var sources = $("video source", intro);
  var choice = sources[Math.random() * sources.length | 0];
  backdrop.setAttribute("src", choice.dataset.possible);
});
