var CustomElement = require("../customElement");
var sharedState = require("../sharedState");

var guid = 0;

class StateCheck extends CustomElement {
  static template = require("./_state-check.html")

  static boundMethods = ["onChange", "onState"];

  constructor() {
    super();
    var id = guid++;
    this.elements.input.id = `state-check-input-${id}`;
    this.elements.label.setAttribute("for", `state-check-input-${id}`);
    this.elements.input.checked = this.hasAttribute("checked");

    this.elements.input.addEventListener("change", this.onChange);

    sharedState.on("state", this.onState);
  }

  get checked() {
    return this.elements.input.checked;
  }

  set checked(v) {
    return this.elements.input.checked = v;
  }

  onChange() {
    var prop = this.getAttribute("property");
    sharedState.set(prop, this.checked);
  }

  onState() {
    var prop = this.getAttribute("property");
    this.elements.input.checked = sharedState.state[prop];
  }
}

StateCheck.define("state-check");