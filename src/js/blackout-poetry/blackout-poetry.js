var CustomElement = require("../customElement");
var excerpts = require("./excerpts.txt").split("===").map(t => t.trim());
var index = (Math.random() * excerpts.length) | 0;
var track = require("../lib/tracking");
var trackPoetry = label => track("blackout-poetry", label);

const DPR = window.devicePixelRatio || 1;
const FONT_SCALE = 20;
const LINE_HEIGHT = 2;
const PADDING = 16;

var loadTexture = url => new Promise(function(ok, fail) {
  var image = new Image();
  image.src = url;
  image.onload = () => ok(image);
  image.onerror = fail;
});

class BlackoutPoetry extends CustomElement {

  static boundMethods = [
    "undo",
    "turnPage",
    "typeset",
    "onPointerContact",
    "onPointerMove",
    "download"
  ]
  static template = require("./_blackout-poetry.html")
  
  constructor() {
    super();
    var { canvas, undo, reset, save, newPage } = this.elements;
    this.context = canvas.getContext("2d");
    this.painting = false;
    canvas.addEventListener("touchstart", this.onPointerContact);
    canvas.addEventListener("mousedown", this.onPointerContact);
    canvas.addEventListener("touchend", this.onPointerContact);
    canvas.addEventListener("mouseup", this.onPointerContact);
    canvas.addEventListener("touchmove", this.onPointerMove);
    canvas.addEventListener("mousemove", this.onPointerMove);

    reset.addEventListener("click", this.typeset);
    save.addEventListener("click", this.download);
    newPage.addEventListener("click", this.turnPage);
    undo.addEventListener("click", this.undo);

    this.undoBuffer = null;
  }

  turnPage() {
    index++;
    this.typeset();
  }

  typeset() {
    var content = excerpts[index % excerpts.length];
    var words = content.split(/[\n\r]+/).join(" \n ").split(/ /).filter(w => w);
    var { canvas } = this.elements;
    var context = this.context;

    // clear canvas
    canvas.width = canvas.clientWidth * DPR;
    canvas.height = canvas.clientHeight * DPR;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // create text metrics
    var fontSize = (canvas.width / FONT_SCALE) | 0;
    context.font = `bold ${fontSize}px courier`;
    context.fillStyle = "black";
    var en = context.measureText("N");
    var enHeight = en.actualBoundingBoxAscent;
    var tab = en.width * 4;

    // lay out the text, word by word
    var x = PADDING + tab;
    var y = enHeight + PADDING;
    var rightEdge = canvas.width - PADDING;
    var bottomEdge = canvas.height - PADDING;
    for (var w of words) {
      var word = w.trim();
      var measurement = context.measureText(word);
      var overflowed = x + measurement.width > rightEdge && w != " ";
      var isReturn = w.match(/[\n\r]+/);
      if (overflowed || isReturn) {
        y += enHeight * LINE_HEIGHT;
        x = PADDING;
        if (isReturn) {
          x += tab;
          continue;
        }
      }
      if (y > bottomEdge) break;
      context.fillText(word, x, y);
      x += measurement.width + en.width;
    }
  }

  onPointerContact(e) {
    e.preventDefault();
    switch (e.type) {
      case "touchstart":
      case "mousedown":
        var canvas = this.context.canvas;
        this.painting = true;
        this.undoBuffer = this.context.getImageData(0, 0, canvas.width, canvas.height);
      break;

      case "touchend":
      case "mouseup":
        this.painting = false;
      break;
    }
  }

  onPointerMove(e) {
    if (!this.painting) return;
    var pointer = e.touches ? e.touches[0] : e;
    var { clientX, clientY } = pointer;
    var bounds = this.elements.canvas.getBoundingClientRect();
    var x = clientX - bounds.left;
    var y = clientY - bounds.top;
    x *= DPR;
    y *= DPR;
    this.context.fillStyle = "#0006";
    this.context.beginPath();
    var r = FONT_SCALE * .5 * DPR;
    var d = r * 2;
    this.context.arc(x, y, r, 0, Math.PI * 2);
    for (var i = 0; i < 12; i++) {
      var dx = Math.random() * d - r;
      var dy = Math.random() * d - r;
      var dr = Math.random() * 3 + 1 * DPR;
      this.context.arc(x + dx, y + dy, dr, 0, Math.PI * 2);
    }
    this.context.fill();
  }

  download() {
    var { canvas, download } = this.elements;  
    download.href = canvas.toDataURL();
    download.download = `poetry-${Date.now()}`
    download.click();
    trackPoetry("download");
  }

  undo() {
    if (this.undoBuffer) this.context.putImageData(this.undoBuffer, 0, 0);
  }

  connectedCallback() {
    this.typeset();
  }

}

BlackoutPoetry.define("blackout-poetry");