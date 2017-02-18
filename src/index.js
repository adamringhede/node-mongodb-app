const server = require('./server')
const mw = require('./middleware')
const db = require('./db')

class RouteMaker {
    constructor(router) {
        for (let method of server.routeMethods) {
            this[method] = (...args) => {
                router.apply(args)
            }
        }
    }
}

class App {
    constructor({mongoUri, port}) {
        db.init(mongoUri)
        this.routes = server.start({
            port
        })
        this.mw = mw
    }
}

exports.App = App

exports.Redundancy = require('./redundancy')
