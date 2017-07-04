const mongoose = require('mongoose')
const Fixtures = require('pow-mongoose-fixtures')

export let connected = false

export let connection = null
mongoose.Promise = global.Promise

export const init = (uri) => {
    if (connected) return 
    mongoose.Promise = global.Promise
    mongoose.connect(uri)
    connection = mongoose.connection
    connected = true
}  


export const loadFixtures = function (fixtures, callback) {
  var f = {};
  Fixtures.load(fixtures, mongoose.connection, function (err) {
    if (err) throw err;
    var count = 0;
    var non_empty_count = 0;
    if (Object.keys(fixtures).length === 0 && typeof callback === 'function') callback(f);
    Object.keys(fixtures).forEach(function (modelName) {
      f[modelName] = {};
      if (Object.keys(fixtures[modelName]).length > 0) {
        non_empty_count += 1;
      }
      Object.keys(fixtures[modelName]).forEach(function (i) {
        if (fixtures[modelName][i]['_id']) {
          count += 1;
          mongoose.model(modelName).findOne({_id: fixtures[modelName][i]['_id']}, function (err, model) {
            model.__forceUpdate = true;
            model.save(function () {
              if (err) throw err;
              f[modelName][i] = model;
              count -= 1;
              if (count == 0) {
                if (typeof callback === 'function') callback(f);
              }
            })
          });
        }
      });
    });
    if (non_empty_count == 0 && typeof callback === 'function') callback(f);
  });
};

