const mongoose = require('mongoose');
const { Redundancy } = require('../')

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


