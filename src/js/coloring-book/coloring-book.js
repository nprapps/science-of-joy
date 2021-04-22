var CustomElement = require("../customElement");

var TAU = Math.PI * 2;

class ColoringBook extends CustomElement {
  constructor() {
    super();

    var { outlines } = this.elements;

    this.drawing = false;
    this.maskPath = null;

    outlines.addEventListener("touchstart", this.wrapTouch(this.onPointerStart));
    outlines.addEventListener("mousedown", this.onPointerStart);

    outlines.addEventListener("touchmove", this.wrapTouch(this.onPointerMove));
    outlines.addEventListener("mousemove", this.onPointerMove);

    outlines.addEventListener("touchend", this.wrapTouch(this.onPointerEnd));
    outlines.addEventListener("mouseup", this.onPointerEnd);

    // temporarily set some paths
    // in the future, do this from SVG

    this.paths = [
      { type: "circle", fill: "wheat", x: .6, y: .3, r: .2 },
      { type: "rect", fill: "salmon", x: .1, y: .1, width: .2, height: .2 },
      { type: "rect", fill: "teal", x: .1, y: .6, width: .3, height: .3 }
    ];

    var star = [];
    for (var i = 0; i < 10; i++) {
      var a = TAU / 10 * i;
      var d = (i % 2) * .1 + .1;
      var x = .7 + Math.cos(a) * d;
      var y = .7 + Math.sin(a) * d;
      star.push([x, y]);
    }
    this.paths.push({ type: "path", fill: "slateblue", points: star });

  }

  static get boundMethods() {
    return [
      "onPointerStart",
      "onPointerMove",
      "onPointerEnd",
      "strokePath"
    ]
  }

  wrapTouch(fn) {
    return function(e) {
      return fn(e.touches[0]);
    }
  }

  init() {
    var { outlines, page } = this.elements;
    outlines.width = outlines.clientWidth;
    outlines.height = outlines.clientHeight;
    page.width = page.clientWidth;
    page.height = page.clientHeight;

    this.paths.forEach(this.strokePath);

    var context = page.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, page.width, page.height);
  }

  scalePoint(canvas, x, y) {
    var { width, height } = canvas;
    return [
      x * width,
      y * height
    ];
  }

  onPointerStart(e) {
    var bounds = this.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    // find a matching path
    var context = this.elements.page.getContext("2d");
    var matched = null;
    context.save();
    for (var p of this.paths) {
      context.beginPath();
      this[p.type](context, p);
      if (context.isPointInPath(x, y)) {
        this.maskPath = p;
        context.clip();
        return;
      }
    }
  }

  onPointerMove(e) {
    if (!this.maskPath) return;
    var bounds = this.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    var context = this.elements.page.getContext("2d");
    context.fillStyle = this.maskPath.fill;
    context.beginPath();
    context.arc(x, y, 20, 0, TAU);
    context.fill();
  }

  onPointerEnd() {
    var context = this.elements.page.getContext("2d");
    context.restore();
    this.maskPath = null;
  }

  strokePath(path) {
    var canvas = this.elements.outlines;
    var context = canvas.getContext("2d");
    context.beginPath();
    switch (path.type) {
      case "circle":
        this.circle(context, path);
      break;

      case "rect":
        this.rect(context, path);
      break;

      case "path":
        this.path(context, path);
      break;
    }
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.stroke();
  }

  circle(context, path) {
    var { canvas } = context;
    var [x, y] = this.scalePoint(canvas, path.x, path.y);
    context.arc(
      x, y,
      path.r * canvas.width,
      0,
      TAU
    );
  }

  rect(context, path) {
    var { canvas } = context;
    var [x, y] = this.scalePoint(canvas, path.x, path.y);
    var [w, h] = this.scalePoint(canvas, path.width, path.height);
    context.moveTo(x, y);
    context.lineTo(x + w, y);
    context.lineTo(x + w, y + h);
    context.lineTo(x, y + h);
    context.closePath();
  }

  path(context, path) {
    var { canvas } = context;
    path.points.forEach(([x, y], tail) => {
      var [px, py] = this.scalePoint(canvas, x, y);
      if (!tail) {
        context.moveTo(px, py);
      } else {
        context.lineTo(px, py)
      }
    });
    context.closePath();
  }

  static get template() {
    return require("./_coloring-book.html");
  }

}

ColoringBook.define("coloring-book");