
const views = {
  Article: (model, req) => {
      return {
          _id: model._id,
          title: model.title,
          body: model.body,
          author: model.author
      }
  }
}

module.exports = app => {
  const $ = app.mw

  app.routes.get('/v1/articles',
      $.loadList('articles', 'Article'),
      $.outputPage('articles', views.Article)
  )

  app.routes.get('/v1/articles/:article',
      $.load({article: 'Article'}),
      $.output('article', views.Article)
  )

  app.routes.post('/v1/articles', 
      (req, res, next) => {
        req.body.author = req.user._id
        next()
      },
      $.create('article', 'Article', {
          _: 'title body author'
      }),
      $.output('article', views.Article)
  )

}