const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const moment = require('moment')
const crypto = require('crypto')
const ObjectId = require('objectid')

const schema = new mongoose.Schema({
  client_id: { type: String, index: true, required: true, unique: true },
  clientId: String,
  secret: String,
  name: String,
  grants: { type: [String], default: ['password'] },
  redirect_uri: String
})

schema.plugin(uniqueValidator)

exports.OAuthClient = mongoose.model('OAuthClient', schema)

const tokenSchema = new mongoose.Schema({
    token: { type: String, index: true, unique: true },
    expires: { type: Date, default: null },
    client_id: String,
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

const tokenSchema2 = new mongoose.Schema({
    token: { type: String, index: true, unique: true },
    expires: { type: Date, default: null },
    client_id: String,
    holder: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
})

tokenSchema2.pre('save', function(next) {
    if (this.expires == null) {
        if (this.lifetime) {
            this.expires = moment().add(this.lifetime.value, this.lifetime.unit)
        } else {
            this.expires = moment().add(1, 'month')
        }
    }
    next()
})

exports.OAuthAccessToken = mongoose.model('OAuthAccessToken', tokenSchema2)
