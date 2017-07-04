import { App } from './app'

export default (app: App) => {

  const $ = app.mw

  app.publicRoutes.post('/v1/accounts/register',
    $.requires('email password'),
    req => req.body.username = req.body.email,
    $.create('account', 'Account', {
      _: 'username password email',
      admin: 'username password email role'
    }),
    $.output('account', (model: any, _: any) => {
      return {
        _id: model._id,
        username: model.username
      }
    })
  );

}
