var $ = require("./lib/qsa");
var track = require("./lib/tracking");

// enable the drop-down menu
$(".drop-down").forEach(function(menu) {
  var button = $.one(".drop-toggle", menu);
  var ul = $.one("ul", menu);
  var items = $("ul a, ul button, ul input", menu);
  items.forEach(function(item) {
    item.setAttribute("tabindex", -1);
    item.addEventListener("click", () => button.click());
  });

  var menuAction = function(expanded, manual) {
    ul.setAttribute("aria-hidden", !expanded);
    items.forEach(item => item.setAttribute("tabindex", expanded ? 0 : -1));
    if (expanded) {
      items[0].focus();
      button.setAttribute("aria-expanded", "true");
      track("opened-menu");
    } else {
      button.removeAttribute("aria-expanded");
      if (!manual) button.focus();
    }
  }

  button.addEventListener("click", function(e) {
    e.stopPropagation();
    var expanded = menu.classList.toggle("expanded");
    menuAction(expanded);
  });

  menu.classList.add("enabled", true);
  menuAction(false);
});