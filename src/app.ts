import { routeMethods, start } from './server'
import * as restify from 'restify'
import * as mw from './middleware'
import * as db from './db'
import * as defaultRoutes from './routes'

import './models'

export interface IAppConfig {
  mongoUri: string
  port: number
} 

export type RequestHandler = (req: restify.Request, res?: restify.Response, next?: restify.Next) => any;
export type RouteHandler = (route: string|RegExp, ...args: Array<RequestHandler>) => any

export class RouteMaker {
  post: RouteHandler
  get: RouteHandler
  put: RouteHandler
  delete: RouteHandler
  opts: RouteHandler

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

export class App {
  server: restify.Server
  routes: RouteMaker
  publicRoutes: RouteMaker
  mw = mw

  constructor({mongoUri, port}: IAppConfig) {
    db.init(mongoUri)
    this.server = start({
      port
    })
    this.routes = new RouteMaker(this.server)
    this.publicRoutes = new RouteMaker(this.server, false)
    defaultRoutes.default(this)
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