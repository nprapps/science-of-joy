require("../blackout-poetry/blackout-poetry");

var $ = require("../lib/qsa");
var dom = require("../lib/dom");

var paragraphs = $(`[data-slug="blackout-demo"] .content p`);

var splits = [" "];

var counter = 0;
paragraphs.forEach(function(p) {
  var bolds = $("b", p);
  for (var b of bolds) {
    var converted = [];
    for (var c of b.childNodes) {
      if (c.nodeType == Node.TEXT_NODE) {
        var words = c.textContent.split(" ");
        for (var w of words) {
          var span = dom("span.strike", w + " ");
          span.style.animationDelay = 2000 + (counter++ * 200) + "ms";
          converted.push(span);
        }
      } else {
        converted.push(c);
      }
    }
    b.innerHTML = "";
    converted.forEach(c => b.appendChild(c));
  }
});