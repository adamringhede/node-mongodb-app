const flatten = require('flat');

module.exports = function () {
  return function (req, res, next) {
    req.query = flatten(req.query);
    for (key in req.query) {
      if (typeof req.query[key] !== 'string') {
        continue;
      }
      var value = req.query[key].toLowerCase();
      if (value == 'true' || value == 'false') {
        req.query[key] = value == 'true';
      } else if (isNumeric(value)) {
        req.query[key] = parseInt(value, 10);
      }
    }
    next();
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
