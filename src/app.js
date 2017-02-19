const { routeMethods, start } = require('./server')
const mw = require('./middleware')
const db = require('./db')
const defaultRoutes = require('./routes')

require('./models')

class RouteMaker {
  constructor(server, authorize = true) {
    for (let method of routeMethods) {
      this[method] = (route, ...args) => {
        const wrapperArgs = args.map(wrapMiddleware)
        if (!authorize) {
          server[method].apply(server, [route].concat(wrapperArgs))
        } else {
          server[method].apply(server, [route].concat([server.oauth.authorise()]).concat(wrapperArgs))
        }  
      } 
    }
  }
}

class App {
  constructor({mongoUri, port}) {
    db.init(mongoUri)
    this.server = start({
      port
    })
    this.routes = new RouteMaker(this.server)
    this.publicRoutes = new RouteMaker(this.server, false)
    this.mw = mw
    defaultRoutes(this)
  }
}

module.exports = App

function wrapMiddleware(fun) {
  if (typeof fun === 'function') {
    const funString = fun.toString().trim()
    let match = funString.match(/^\w*\s*\(\s*([^)]*?)\s*\)/) || funString.match(/^(\w+)\s*=>/)
    if (match != null && match[1] != null) {
      const params = match[1].split(",")
      const safe = funString.match(/(arguments)/) == null
      if (safe && params.length < 3) {
        // No next argument, so wrap it
        return (req, res, next) => {
          const result = fun(req, res, next);
          // If it returns a promise, then wait until resolved;
          // otherwise, continue.
          if (result instanceof Promise) {
            result.then(next).catch(next)
          } else {
            next()
          }
        }
      }
    }
  }
  return fun
}