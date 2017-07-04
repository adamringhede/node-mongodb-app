import * as ObjectId from 'objectid'
import * as crypto from 'crypto'
import * as mongoose from 'mongoose'
import { OAuthRefreshToken, OAuthAccessToken, findAccountWithCredentials } from '../models'


export const getAccessToken = function (bearerToken, callback) {
  OAuthAccessToken
  .findOne({ token: bearerToken })
  .populate('user')
  .exec(function (err, model) {
    if (err || !model) callback(err, model)
    else {
      callback(null, model);
    }
  });
};

export const getClient = function (clientId, clientSecret, callback) {
  const query: any = { clientId: clientId }
  if (clientSecret != null) {
    query.secret = clientSecret
  }
  mongoose.model('OAuthClient').findOne(query, callback);
};


export const grantTypeAllowed = function (clientId, grantType, callback) {

  if (grantType === 'password') {
    return callback(false, true);
  }

  callback(false, true);
};

export const saveAccessToken = function (token, clientId, expires, userId, callback) {
  var accessToken = new OAuthAccessToken({
    token: token,
    clientId: clientId,
    user: userId,
    expires: expires
  });

  accessToken.save(callback);

};

/*
 * Required to support password grant type
 */
export const getUser = function (username, password, callback) {
 findAccountWithCredentials({username:username, password:password}, function(err, user) {
    if(err) return callback(err);
    callback(null, user);
  });
};

/*
 * Required to support refreshToken grant type
 */
export const saveRefreshToken = function (token, clientId, expires, userId, callback) {
  var refreshToken = new OAuthRefreshToken({
    token: token,
    clientId: clientId,
    user: userId,
    expires: expires
  });

  refreshToken.save(callback);
};

export const getRefreshToken = function (refreshToken, callback) {
  OAuthRefreshToken.findOne({ token: refreshToken }, callback);
};


export const generateToken = function (type, req, callback) {
  crypto.randomBytes(256, function (ex, buffer) {
    if (ex) return callback(new Error("could not generate token"));

    var token = crypto
      .createHash('sha256')
      .update(buffer + ObjectId().toString())
      .digest('hex');

    callback(false, token);
  });
}
