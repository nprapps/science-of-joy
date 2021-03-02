var $ = require("../lib/qsa");

var $story = $.within("#intro");
var backdrop = $story.one(".backdrop");
var sources = $story("video source");
var choice = sources[Math.random() * sources.length | 0];
backdrop.setAttribute("src", choice.dataset.possible);
