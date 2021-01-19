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

module.exports = {
  getParams,
  setParams
}