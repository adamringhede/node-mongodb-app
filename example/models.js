const mongoose = require('mongoose');
const { Redundancy } = require('../')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true },
    password: String
})
userSchema.plugin(uniqueValidator)

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


