var $ = require("../lib/qsa");
var $story = $.within("#asmr");
var shaderBox = $story.one("shader-box");
var fragment = require("../shader-box/voronoi.glsl");
shaderBox.setShader(fragment);