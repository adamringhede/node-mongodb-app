const mongoose = require('mongoose');
const { Redundancy } = require('../')
const uniqueValidator = require('mongoose-unique-validator')

const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true },
    password_hash: String
})
userSchema.plugin(uniqueValidator)
userSchema.pre('validate', function(next) {
  if (this.password) {
    this.password_hash = mongoose.model('Account').hashPassword(this.password);
  }
  return next();
});
const SALT = 'do2doh!aALDDSONAnsv783nf4w9fphi9fagonsu';
userSchema.statics = {
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
mongoose.model('Account', userSchema)


const articleSchema = new mongoose.Schema({
    title: String,
    body: String
})

articleSchema.plugin(Redundancy, {
    model: 'Article',
    references: {
        author: {
            model: 'Account'
        }
    }
})

mongoose.model('Article', articleSchema)


