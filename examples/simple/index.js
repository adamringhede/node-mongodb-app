const { App } = require('../../src/') // @adamringhede/mongodb-app
const mongoose = require('mongoose')
require('./models')

const app = new App({mongoUri: 'mongodb://192.168.99.100/node-mongodb-app'})
const $ = app.mw

const views = {
    Article: (model, req) => {
        return {
            title: model.title,
            body: modle.boty,
            author: model.author
        }
    }
}

app.routes.get('/v1/articles',
    $.restrict(),
    $.loadList('articles', 'Article'),
    $.outputPage('articles', views.Article)
)

app.routes.get('/v1/articles/:article',
    $.load({article: 'Article'}),
    $.output('article', views.Article)
)

app.routes.post('/v1/articles',
    $.default({
        author: req => req.user._id
    }),
    $.create('article', {
        user: 'title content tags'
    }),
    // The event will be published to the service configured to handle events. 
    /*$.publishEvent('articleCreated', req => {
        return {
            article: views.Article(req.resources.article, req),
        }
    }),*/
    $.output('article', views.Article)
)