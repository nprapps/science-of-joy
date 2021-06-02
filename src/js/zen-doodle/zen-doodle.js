var CustomElement = require("../customElement");

const POINT_LIMIT = 4000;
const POINT_SPACING = 3;
const NEIGHBOR_LIMIT = 40;
const NEIGHBOR_SPACING = 20;
const INK = .4;
const SHADE = .1;

class ZenDoodle extends CustomElement {

  static template = require("./_zen-doodle.html")
  static boundMethods = [
    "onPenDown",
    "onPenUp",
    "onPenMove",
    "popUndo",
    "init",
    "download"
  ]

  constructor() {
    super();
    this.lastPoint = null;
    this.points = [];

    this.context = this.elements.canvas.getContext("2d");

    var undoBuffer = null;

    this.elements.canvas.addEventListener("mousedown", this.onPenDown);
    this.elements.canvas.addEventListener("mousemove", this.onPenMove);
    this.elements.canvas.addEventListener("mouseup", this.onPenUp);

    this.elements.canvas.addEventListener("touchstart", this.touchify(this.onPenDown));
    this.elements.canvas.addEventListener("touchmove", this.touchify(this.onPenMove));
    this.elements.canvas.addEventListener("touchend", this.touchify(this.onPenUp));

    this.elements.undoButton.addEventListener("click", this.popUndo);
    this.elements.resetButton.addEventListener("click", this.init);
    this.elements.saveButton.addEventListener("click", this.download);

    window.addEventListener("resize", this.init);
  }

  init() {
    this.pushUndo();
    var { canvas } = this.elements;
    this.points = [];
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, canvas.width, canvas.height);
  }

  getLocalCoord(e) {
    var bounds = this.elements.canvas.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    return [x, y];
  }

  onPenDown(e) {
    this.lastPoint = this.getLocalCoord(e);
  }

  onPenUp(e) {
    this.pushUndo();
    var end = this.getLocalCoord(e);
    
    this.lastPoint = null;

    var startAt = this.points.length - POINT_LIMIT;
    if (startAt > 0) {
      this.points = this.points.slice(startAt);
    }
  }

  onPenMove(e) {
    if (!this.lastPoint) return;
    
    var current = this.getLocalCoord(e);

    var distance = this.getDistance(this.lastPoint, current);
    if (distance < POINT_SPACING) return;

    this.context.strokeStyle = "black";
    this.context.lineCap = "round";
    this.context.globalAlpha = INK;
    this.context.beginPath();
    this.context.moveTo(...this.lastPoint);
    this.context.lineTo(...current);
    this.context.stroke();

    // fill in gaps
    this.context.beginPath();
    for (var p of this.points) {
      this.context.globalAlpha = SHADE * Math.random();
      var d = this.getDistance(p, current);
      if (d < NEIGHBOR_LIMIT && d > NEIGHBOR_SPACING) {
        this.context.moveTo(...current);
        this.context.lineTo(...p);
      }
    }
    this.context.stroke();

    this.points.push(current);

    this.lastPoint = current;
  }

  touchify(fn) {
    return function(e) {
      var touch = e.changedTouches[0] || e.touches[0];
      fn(touch);
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  getDistance(a, b) {
    var rise = b[1] - a[1];
    var run = b[0] - a[0];
    var distance = Math.sqrt((rise ** 2) + (run ** 2));
    return distance;
  }

  download() {

  }

  popUndo() {
    this.context.putImageData(this.undoBuffer, 0, 0);
  }

  pushUndo() {
    var { width, height } = this.elements.canvas;
    if (width && height) {
      this.undoBuffer = this.context.getImageData(0, 0, width, height);
    }
  }

}

ZenDoodle.define("zen-doodle");