const ObjectId = require('objectid');
const crypto = require('crypto');
const mongoose = require('mongoose')


exports.getAccessToken = function (bearerToken, callback) {
  mongoose.model('OAuthAccessToken')
  .findOne({ token: bearerToken })
  .populate('holder')
  .exec(function (err, model) {
    if (err || !model) callback(err, model)
    else {
      model.user = model.holder
      callback(null, model);
    }
  });
};

exports.getClient = function (clientId, clientSecret, callback) {
  mongoose.model('OAuthClient').findOne({ client_id: clientId, secret: clientSecret }, callback);
};


exports.grantTypeAllowed = function (clientId, grantType, callback) {

  if (grantType === 'password') {
    return callback(false, true);
  }

  callback(false, true);
};

exports.saveAccessToken = function (token, clientId, expires, userId, callback) {

  var accessToken = new mongoose.model('OAuthAccessToken')({
    token: token,
    client_id: clientId,
    holder: userId,
    expires: expires
  });

  accessToken.save(callback);

};

/*
 * Required to support password grant type
 */
exports.getUser = function (username, password, callback) {
  mongoose.model('Account').findWithCredentials({username:username, password:password}, function(err, user) {
    if(err) return callback(err);
    callback(null, user);
  });
};

/*
 * Required to support refreshToken grant type
 */
exports.saveRefreshToken = function (token, clientId, expires, userId, callback) {

  var refreshToken = new mongoose.model('OAuthRefreshToken')({
    token: token,
    client_id: clientId,
    holder: userId,
    expires: expires
  });

  refreshToken.save(callback);
};

exports.getRefreshToken = function (refreshToken, callback) {
  mongoose.model('OAuthRefreshToken').findOne({ token: refreshToken }, callback);
};


exports.generateToken = function (type, req, callback) {
  crypto.randomBytes(256, function (ex, buffer) {
    if (ex) return callback(new error.InternalError());

    var token = crypto
      .createHash('sha256')
      .update(buffer + ObjectId().toString())
      .digest('hex');

    callback(false, token);
  });
}
