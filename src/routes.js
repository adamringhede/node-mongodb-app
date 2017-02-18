

module.exports = app => {

  const $ = app.mw

  app.publicRoutes.post('/v1/accounts/register',
    $.require('email', 'password'),
    req => req.body.username = req.body.email,
    $.create('account', 'Account', {
      _: 'username password email',
      admin: 'username password email role'
    }),
    //$.createAccessToken('account', Models.Client.DEV_PORTAL),
    $.output('account', (model, req) => {
      return {
        _id: model._id,
        username: model.username
      }
    })
  );

}
