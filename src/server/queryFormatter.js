const flatten = require('flat');

module.exports = function () {
  return function (req, res, next) {
    req.query = flatten(req.query);
    // If one were to query on an id directly, then it would not be found
    // since internally we use _id as the id.
    /*
    This does not apply
    if ('id' in req.query) {
      req.query._id = req.query.id;
      delete req.query.id;
    }*/
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
