const mongoose = require('mongoose');
const { Redundancy } = require('../../src/')

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String
})

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


