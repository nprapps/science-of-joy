/*

Utilities for treating the hash like a URL search parameter interface.

*/

var getParams = function() {
  var hash = window.location.hash.replace(/^#/, "");
  var params = new URLSearchParams(hash);
  return Object.fromEntries(params);
};

var setParams = function(params) {
  var usp = new URLSearchParams();
  for (var key in params) {
    usp.set(key, params[key]);
  }
  window.location.hash = "#" + usp.toString();
};

var updateParams = function(update) {
  var params = Object.assign(getParams(), update);
  setParams(params);
}

module.exports = {
  getParams,
  setParams,
  updateParams
}