const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const moment = require('moment')
const crypto = require('crypto')
const ObjectId = require('objectid')

schema = new mongoose.Schema({
  client_id: { type: String, index: true, required: true, unique: true },
  secret: String,
  name: String,
  grants: { type: [String], default: ['password'] },
  redirect_uri: String
})

schema.plugin(uniqueValidator)

mongoose.model('OAuthClient', schema)

tokenSchema = new mongoose.Schema({
    token: { type: String, index: true, unique: true },
    expires: { type: Date, default: undefined },
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

mongoose.model('OAuthRefreshToken', tokenSchema)
mongoose.model('OAuthAccessToken', tokenSchema)