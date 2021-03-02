var $ = require("../lib/qsa");

var $soundscapes = $.within("#nostalgia .soundscapes");
var tracks = $soundscapes("audio");
var nextButton = $soundscapes.one(".next");
var label = $soundscapes.one(".clip-label");
var controls = $soundscapes.one("media-controls");
var viz = $soundscapes.one("audio-visualizer");
var shaderBox = $soundscapes.one("shader-box");

var fragment = require("../shader-box/bokeh.glsl");
shaderBox.setShader(fragment);

var index = Math.random() * tracks.length | 0;

var setSoundscape = function(e) {
  if (!tracks[index].paused) {
    tracks[index].pause();
  }
  index = (index + 1) % tracks.length;
  var audio = tracks[index];
  label.innerHTML = audio.dataset.label;
  controls.for = audio.id;
  viz.for = audio.id;
  audio.currentTime = 0;
  if (e && e.type == "click") {
    audio.play();
  }
}

nextButton.addEventListener("click", setSoundscape);
setSoundscape();