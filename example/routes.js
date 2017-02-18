
const views = {
  Article: (model, req) => {
      return {
          title: model.title,
          body: modle.boty,
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
      $.default({
          author: req => req.user._id
      }),
      $.create('article', {
          user: 'title body author'
      }),
      $.output('article', views.Article)
  )

}