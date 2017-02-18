

module.exports = app => {

  const $ = app.mw

  app.publicRoutes.post('/v1/accounts/register',
    $.require('email', 'password'),
    function(req, res, next) {
      req.body.username = req.body.email;
      next();
    },
    $.create('account', 'Account', {
      _: 'username password email',
      admin: 'username password email role'
    }),
    //$.createAccessToken('account', Models.Client.DEV_PORTAL),
    $.output('account', (model, res) => {
      username: model.username
    })
  );

}
