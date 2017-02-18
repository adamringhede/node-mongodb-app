const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const moment = require('moment')
const crypto = require('crypto')
const ObjectId = require('objectid')

const SALT = 'do2doh!aALDDSONAnsv783nf4w9fphi9fagonsu';

const schema = new mongoose.Schema({
  clientId: { type: String, index: true, required: true, unique: true },
  secret: String,
  name: String,
  grants: { type: [String], default: ['password'] },
  redirectUri: String
})

schema.plugin(uniqueValidator)

exports.OAuthClient = mongoose.model('OAuthClient', schema)

const tokenSchema = new mongoose.Schema({
    token: { type: String, index: true, unique: true },
    expires: { type: Date, default: null },
    clientId: String,
    holder: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
})

tokenSchema.pre('save', function(next) {
    if (this.expires == null) {
        if (this.lifetime) {
            this.expires = moment().add(this.lifetime.value, this.lifetime.unit)
        } else {
            this.expires = moment().add(1, 'month')
        }
    }
    next()
})

exports.OAuthRefreshToken = mongoose.model('OAuthRefreshToken', tokenSchema)
exports.OAuthAccessToken = mongoose.model('OAuthAccessToken', tokenSchema)

const accountSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true },
    password_hash: String
})
accountSchema.plugin(uniqueValidator)
accountSchema.pre('validate', function(next) {
  if (this.password) {
    this.password_hash = mongoose.model('Account').hashPassword(this.password);
  }
  return next();
});
accountSchema.statics = {
  hashPassword: function(password) {
    return crypto.createHash('sha1').update(password + SALT).digest('hex');
  },
  findWithCredentials: function(input, callback) {
    var hash, query;
    hash = this.hashPassword(input.password);
    query = {
      username: input.username,
      password_hash: hash
    };
    return this.findOne(query, function(err, model) {
      return typeof callback === "function" ? callback(err, model) : void 0;
    });
  }
};

mongoose.model('Account', accountSchema)