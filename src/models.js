const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const moment = require('moment')
const crypto = require('crypto')
const ObjectId = require('objectid')

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
