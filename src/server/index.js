const oauthServer = require('oauth2-server-restify');
const suppressCodes = require('./supressCodes');
const queryFormatter = require('./queryFormatter');
const formatters = require('./formatters');
const oauthHooks = require('./oauth');
const restify = require('restify');
const jsend = require('./jsend');
const mongoose = require('mongoose')

const routeMethods = ['post', 'get', 'put', 'delete', 'opts', 'use', 'pre']
exports.routeMethods = routeMethods

exports.start = function ({port = 8000}) {
    var server = restify.createServer({
        name: 'app',
        formatters: formatters
    });

    server.use(function crossOrigin(req,res,next){
        res.header("Content-Type", "application/json");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", "true")
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With, Cache-Control, Location, X-Request");
        return next();
    });

    // Selects version v1 unless a version is specified
    server.pre(function (req, res, next) {
        if (!/^\/v\d+/.test(req.getPath()) && !/^\/oauth/i.test(req.getPath())) {
            req.url = '/v1' + req.url;
        }
        next();
    });

    // Plugins
    server.use(restify.queryParser({mapParams: false}));
    server.pre(restify.pre.sanitizePath());
    server.use(restify.jsonp());
    server.use(restify.authorizationParser());
    server.use(restify.bodyParser({mapParams: false}));
    server.use(queryFormatter());
    server.use(suppressCodes());
    server.use(jsend())
    server.use(function (req, res, next) { // Reverse map params
        if (!req.body) {
            req.body = {};
        }
        for (param in req.params) {
            if (!req.body[param]) req.body[param] = req.params[param];
        }
        for (key in req.body) {
            if (!req.params[key]) req.params[key] = req.body[key];
        }
        next();
    });

    server.opts(/\.*/, function (req, res, next) {
        res.send(200);
        next();
    });

    validateModels()
    
    server.oauth = oauthServer({
        model: oauthHooks,
        grants: ['password'],
        debug: true
    });

    server.post('/oauth/token', server.oauth.grant());

    server.use(server.oauth.authorise());

    server.listen(port);
    console.log("API listening on port " + port);

    server.get('/v1', function (req, res, next) {
        res.send('It works');
        next();
    });

    return server
}

function validateModels() {
    if (mongoose.model('Account') == null) {
        throw new Error(`
            A model named 'Account' is required with properties 'username' and 'password'.
        `)
    }
}

function applyRoutes(routes, server) {
    if (routes != null) {
        for (let method of routeMethods) {
            if (routes[method] != null && Array.isArray(routes[method])) {
                for (let args of routes[method]) {
                    server[method].apply(null, args)
                }
            }
        }
    }
}
