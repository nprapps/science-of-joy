var CustomElement = require("../customElement");
var track = require("../lib/tracking");

var trackDoodle = label => track("zen-doodle", label);

const POINT_LIMIT = 4000;
const POINT_SPACING = 3;
const NEIGHBOR_LIMIT = 40;
const NEIGHBOR_SPACING = 20;
const INK = .4;
const SHADE = .1;
const WEB_MARGIN = 3;

class Vector extends Array {
  vectorize(n) {
    if (n instanceof Array) return n;
    var v = new Array(this.length);
    v.fill(n);
    return v;
  }

  add(v) {
    v = this.vectorize(v);
    return this.map((entry, i) => entry + v[i]);
  }

  subtract(v) {
    v = this.vectorize(v);
    return this.map((entry, i) => entry - v[i]);
  }

  multiply(v) {
    v = this.vectorize(v);
    return this.map((entry, i) => entry * v[i]);
  }

  divide(v) {
    v = this.vectorize(v);
    return this.map((entry, i) => entry / v[i]);
  }

  distance(v) {
    var u = this.subtract(v);
    var [a2, b2] = u.multiply(u);
    return Math.sqrt(a2 + b2);
  }

  normalize() {
    var total = this.reduce((acc, v) => acc + v, 0);
    return this.map(v => v / total);
  }

  dot(v) {
    return this.reduce((acc, entry, i) => acc + entry * v[i], 0);
  }
}

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

    var { canvas } = this.elements;

    this.context = canvas.getContext("2d");

    var undoBuffer = null;

    canvas.addEventListener("mousedown", this.onPenDown);
    canvas.addEventListener("mousemove", this.onPenMove);
    canvas.addEventListener("mouseup", this.onPenUp);

    canvas.addEventListener("touchstart", this.touchify(this.onPenDown));
    canvas.addEventListener("touchmove", this.touchify(this.onPenMove));
    canvas.addEventListener("touchend", this.touchify(this.onPenUp));

    this.elements.undoButton.addEventListener("click", this.popUndo);
    this.elements.resetButton.addEventListener("click", this.init);
    this.elements.saveButton.addEventListener("click", this.download);

    window.addEventListener("resize", () => {
      if (canvas.width != canvas.clientWidth) {
        this.pushUndo();
        this.init();
        this.popUndo();
      }
    });

    this.elements.colorWrapper.addEventListener("click", () => this.elements.color.click());
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
    return Vector.from([e.clientX, e.clientY]).subtract([bounds.left, bounds.top]);
  }

  onPenDown(e) {
    if (e.preventDefault) e.preventDefault();
    this.pushUndo();
    this.lastPoint = this.getLocalCoord(e);
  }

  onPenUp(e) {
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

    var distance = current.distance(this.lastPoint);
    if (distance < POINT_SPACING) return;

    this.context.strokeStyle = this.elements.color.value;
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
      var d = current.distance(p);
      if (d < NEIGHBOR_LIMIT && d > NEIGHBOR_SPACING) {
        var unit = current.subtract(p).divide(d);
        var a = current.subtract(unit.multiply(WEB_MARGIN));
        var b = p.subtract(unit.multiply(-WEB_MARGIN));
        this.context.moveTo(...a);
        this.context.lineTo(...b);
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

  download() {
    var { canvas, download } = this.elements;  
    download.href = canvas.toDataURL();
    download.download = `doodle-${Date.now()}`
    download.click();
    trackDoodle("download");
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