var $ = require("../lib/qsa");

var gridBlocks = $("#about .grid-item");

gridBlocks.forEach(function(item) {
  item.addEventListener("click", () => item.classList.toggle("flipped"));
})