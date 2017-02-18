const { App } = require('../') // @adamringhede/mongodb-app
const mongoose = require('mongoose')
require('./models')

const port = process.env.PORT != null ? parseInt(process.env.PORT) : 8000
const mongoUri = process.env.MONGO_URI != null 
  ? process.env.MONGO_URI
  : 'mongodb://192.168.99.100/node-mongodb-app'
const app = new App({ port, mongoUri })
require('./routes')(app)
