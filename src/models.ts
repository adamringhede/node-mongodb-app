import * as mongoose from 'mongoose'
declare var require: any;
const uniqueValidator = require('mongoose-unique-validator');
const moment = require('moment')
const crypto = require('crypto')

const SALT = 'do2doh!aALDDSONAnsv783nf4w9fphi9fagonsu';

const clientSchema = new mongoose.Schema({
  clientId: { type: String, index: true, required: true, unique: true },
  secret: String,
  name: String,
  grants: { type: [String], default: ['password'] },
  redirectUri: String
})

clientSchema.plugin(uniqueValidator)

export const OAuthClient = mongoose.model('OAuthClient', clientSchema)

export interface IToken extends mongoose.Document {
  token: string
  expires: Date
  clientId: string
  user: mongoose.Schema.Types.ObjectId|string
}

const tokenSchema = new mongoose.Schema({
    token: { type: String, index: true, unique: true },
    expires: { type: Date, default: null },
    clientId: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
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

export const OAuthRefreshToken = mongoose.model<IToken>('OAuthRefreshToken', tokenSchema)
export const OAuthAccessToken = mongoose.model<IToken>('OAuthAccessToken', tokenSchema)

export interface IAccount extends mongoose.Document {
  name: string
  username: string
  password_hash: string
  findWithCredentials: any
}

function hashPassword(password) {
  return crypto.createHash('sha1').update(password + SALT).digest('hex');
}

export function findAccountWithCredentials(input, callback) {
  var hash, query;
  hash = hashPassword(input.password);
  query = {
    username: input.username,
    password_hash: hash
  };
  return Account.findOne(query, function(err, model) {
    return typeof callback === "function" ? callback(err, model) : void 0;
  });
}

const accountSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true },
    password_hash: String
})
accountSchema.plugin(uniqueValidator)
accountSchema.pre('validate', function(next) {
  if (this.password) {
    this.password_hash = hashPassword(this.password);
  }
  return next();
});
accountSchema.statics = {
  findWithCredentials: function(input, callback) {
    var hash, query;
    hash = hashPassword(input.password);
    query = {
      username: input.username,
      password_hash: hash
    };
    return this.findOne(query, function(err, model) {
      return typeof callback === "function" ? callback(err, model) : void 0;
    });
  }
};

export const Account = mongoose.model<IAccount>('Account', accountSchema)