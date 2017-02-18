const { routeMethods, start } = require('./server')
const mw = require('./middleware')
const db = require('./db')
const defaultRoutes = require('./routes')

require('./models')

class RouteMaker {
  constructor(server, authorize = true) {
    for (let method of routeMethods) {
      this[method] = (route, ...args) => {
        if (!authorize) {
          server[method].apply(server, [route].concat(args))
        } else {
          server[method].apply(server, [route].concat([server.oauth.authorise()]).concat(args))
        }  
      } 
    }
  }
}

class App {
  constructor({mongoUri, port}) {
    db.init(mongoUri)
    const server = start({
      port
    })
    this.routes = new RouteMaker(server)
    this.publicRoutes = new RouteMaker(server, false)
    this.mw = mw
    defaultRoutes(this)
  }
}

module.exports = App
