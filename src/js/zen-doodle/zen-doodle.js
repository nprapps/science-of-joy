var CustomElement = require("../customElement");

class ZenDoodle extends CustomElement {

  static template = require("./_zen-doodle.html")
  static boundMethods = [
    "onPenDown",
    "onPenUp",
    "onPenMove",
    "onBrushChange",
    "onWheel",
    "onUndo",
    "init",
    "download"
  ]

  constructor() {
    super();
    this.startPoint = null;
    this.endPoint = null;
    this.drawingPointer = null;

    this.previewContext = this.elements.preview.getContext("2d");
    this.artContext = this.elements.art.getContext("2d");

    var undoBuffer = null;

    this.elements.preview.addEventListener("mousedown", this.onPenDown);
    this.elements.preview.addEventListener("mouseup", this.onPenUp);
    this.elements.preview.addEventListener("mousemove", this.onPenMove);
    this.elements.preview.addEventListener("wheel", this.onWheel);

    this.elements.brushes.addEventListener("change", this.onBrushChange);
    this.elements.undoButton.addEventListener("click", this.onUndo);
    this.elements.restartButton.addEventListener("click", this.init);

    this.thickness = 1;
    this.mode = "line";
    this.curve = 30;
  }

  init() {
    this.setUndo();
    for (var canvas of [this.elements.preview, this.elements.art]) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    this.artContext.fillStyle = "white";
    this.artContext.fillRect(0, 0, this.elements.art.width, this.elements.art.height);
  }

  getLocalCoord(e) {
    var bounds = this.elements.preview.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    return [x, y];
  }

  onPenDown(e) {
    this.startPoint = this.getLocalCoord(e);
  }

  onPenUp(e) {
    this.elements.preview.width = this.elements.preview.width;
    this.setUndo();
    var end = this.getLocalCoord(e);
    this[this.mode](this.artContext, this.startPoint, end, this.curve)
    this.startPoint = null;
  }

  onPenMove(e) {
    if (this.startPoint) {
      var end = this.getLocalCoord(e);
      this.elements.preview.width = this.elements.preview.width;

      // draw with the chosen method
      this[this.mode](this.previewContext, this.startPoint, end, this.curve);
    }
  }

  onWheel(e) {
    this.curve += e.deltaY * .1;
    if (this.startPoint) {
      this.onPenMove(e);
    }
  }

  download() {

  }

  line(context, start, end) {
    context.lineWidth = this.thickness;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(...start);
    context.lineTo(...end);
    context.stroke();
  }

  arc(context, start, end, curve = 10) {
    context.lineWidth = this.thickness;
    context.lineCap = "round";
    var [x1, y1] = start;
    var [x2, y2] = end;
    var up = y1 > y2;
    var left = x1 > x2;
    var length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    var dx = (x2 - x1) / length;
    var dy = (y2 - y1) / length;
    var midX = x1 + dx * length / 2;
    var midY = y1 + dy * length / 2;
    var normalX, normalY;
    if (up) {
      normalY = midY + dx * curve;
      normalX = midX - dy * curve;
    } else {
      if (left) {
        normalY = midY + dx * curve;
        normalX = midX - dy * curve;
      } else {
        normalY = midY + dx * curve;
        normalX = midX - dy * curve;
      }
    }
    var path = new Path2D(`M${x1},${y1} Q${normalX},${normalY} ${x2},${y2}`);
    // context.fillStyle = "blue";
    // context.fillRect(x1 + dy * curve, y1 + dx * curve, 2, 2);
    // context.fillRect(x2 + dy * curve, y2 + dx * curve, 2, 2);
    // context.fillStyle = "green";
    // context.fillRect(midX - 1, midY - 1, 2, 2);
    // context.fillStyle = "red";
    // context.fillRect(normalX - 1, normalY - 1, 2, 2);
    context.beginPath();
    context.stroke(path);
  }

  zigzag(context, start, end, width) {

  }

  onBrushChange(e) {
    var { name, value } = e.target;
    this[name] = value;
    for (var context of [this.previewContext, this.artContext]) {
      context.lineWidth = this.thickness;
    }
  }

  onUndo() {
    this.artContext.putImageData(this.undoBuffer, 0, 0);
  }

  setUndo() {
    var { width, height } = this.elements.art;
    this.undoBuffer = this.artContext.getImageData(0, 0, width, height);
  }

}

ZenDoodle.define("zen-doodle");