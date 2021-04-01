var CustomElement = require("../customElement");

const PADDING = 16;

class BlackoutPoetry extends CustomElement {
  constructor() {
    super();
    var { canvas, reset, save } = this.elements;
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
  }

  static get boundMethods() {
    return [
      "typeset",
      "onPointerContact",
      "onPointerMove",
      "download"
    ];
  }

  typeset() {
    var words = sample.trim().split(/[\n\r]+/).join(" \n ").split(/ /).filter(w => w);
    var { canvas } = this.elements;
    var context = this.context;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    context.font = "bold 24px courier";
    context.fillStyle = "black";
    var en = context.measureText("N");
    var enHeight = en.actualBoundingBoxAscent;
    var tab = en.width * 4;
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
        y += enHeight * 1.7;
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
        this.painting = true;
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
    this.context.fillStyle = "#000C";
    this.context.beginPath();
    this.context.arc(x, y, 10, 0, Math.PI * 2);
    for (var i = 0; i < 12; i++) {
      var dx = Math.random() * 20 - 10;
      var dy = Math.random() * 20 - 10;
      var r = Math.random() * 3 + 1;
      this.context.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    }
    this.context.fill();
  }

  download() {
    var { canvas, download } = this.elements;  
    download.href = canvas.toDataURL();
    download.download = `poetry-${Date.now()}`
    download.click();
  }

  connectedCallback() {
    this.typeset();
  }

  static get template() {
    return require("./_blackout-poetry.html");
  }
}

var sample = `
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”

Mr. Bennet replied that he had not.

“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”

Mr. Bennet made no answer.

“Do you not want to know who has taken it?” cried his wife impatiently.

“You want to tell me, and I have no objection to hearing it.”

This was invitation enough.

“Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.” 
`

BlackoutPoetry.define("blackout-poetry");