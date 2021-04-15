require("../blackout-poetry/blackout-poetry");

var $ = require("../lib/qsa");

var strikes = $(`[data-slug="blackout-demo"] b`);

var counter = 0;
strikes.forEach(function(strikeout) {
  var nodes = strikeout.childNodes;
  var split = Array.from(nodes).flatMap(function(n) {
    if (n.nodeType == Node.TEXT_NODE) {
      return n.textContent.split(" ").map(w => ({ type: "word", content: w }));
    } else {
      return {
        type: "span",
        content: n.outerHTML
      }
    }
  });
  var units = [];
  //merge outliers
  for (var i = 0; i < split.length; i++) {
    var [ current, next, next2 ] = split.slice(i);
    // collect spans
    if (next && next.type == "span") {
      units.push([current.content + next.content + (next2 ? next2.content : "")].join(" "));
      i += 2;
      continue;
    }
    // merge stray punctuation
    if (current.content.match(/^[.,?]$/) && next) {
      units.push(current.content + " " + next.content);
      i++;
      continue;
    }
    units.push(current.content);
  }
  var spans = units.map(u => ` <span
    class="strike"
    style="animation-delay: ${2000 + (counter++) * 200}ms"
  >${u}</span> `).join("");
  strikeout.innerHTML = spans;
})