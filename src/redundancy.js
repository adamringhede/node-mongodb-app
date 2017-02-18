// Generated by CoffeeScript 1.12.3
(function() {
  var OPath, async, mongoose, setSubscribers;

  mongoose = require('mongoose');

  OPath = require('object-path');

  async = require('async');

  setSubscribers = function(modelName, references, path) {
    var basePath, config, field, results;
    if (path == null) {
      path = null;
    }
    basePath = path != null ? path + "." : "";
    results = [];
    for (field in references) {
      config = references[field];
      if (mongoose.redundancyConfig[config.model] == null) {
        mongoose.redundancyConfig[config.model] = [];
      }
      if (config.fields == null) {
        config.fields = [];
      }
      mongoose.redundancyConfig[config.model].push({
        path: "" + basePath + field,
        model: modelName,
        fields: config.fields
      });
      results.push(setSubscribers(modelName, config.references, "" + basePath + field));
    }
    return results;
  };

  module.exports = function(schema, options) {
    var config, field, loadData, obj, obj1, ref1;
    ref1 = options.references;
    for (field in ref1) {
      config = ref1[field];
      schema.add((
        obj = {},
        obj["" + field] = Object,
        obj
      ));
      schema.add((
        obj1 = {},
        obj1[field + "_id"] = mongoose.Schema.Types.ObjectId,
        obj1
      ));
    }
    if (mongoose.redundancyConfig == null) {
      mongoose.redundancyConfig = {};
    }
    setSubscribers(options.model, options.references);
    schema.methods.update = function(path, value, force) {
      if (force == null) {
        force = false;
      }
      if (this.get(path) !== value || force) {
        if (this.updatedFields == null) {
          this.updatedFields = {};
        }
        this.updatedFields[path] = value;
        if (options.references.hasOwnProperty(path)) {
          if (this.updatedReferences == null) {
            this.updatedReferences = {};
          }
          this.updatedReferences[path] = value;
          this.set(path + "_id", value);
          this.set(path + ".id", value);
        } else {
          this[path] = value;
        }
        return true;
      }
    };
    loadData = function(self, baseModel, path, references, done) {
      if (references == null) {
        return done();
      }
      return async.forEachOf(references, (function(_this) {
        return function(config, field, callback) {
          var basePath, ref, ref2, ref_name, select;
          if (!config.fields) {
            config.fields = [];
          }
          select = config.fields.slice();
          ref2 = config.references;
          for (ref_name in ref2) {
            ref = ref2[ref_name];
            select.push(ref_name);
          }
          basePath = path != null ? path + "." : "";
          if (baseModel[field] == null) {
            baseModel[field] = null;
            return callback();
          }
          return mongoose.model(config.model).where({
            _id: baseModel[field].id
          }).select(select.join(' ')).findOne(function(err, model) {
            var allowNullReferences, i, len, redundant_field, ref3;
            if (model != null) {
              ref3 = config != null ? config.fields : void 0;
              for (i = 0, len = ref3.length; i < len; i++) {
                redundant_field = ref3[i];
                self.set("" + basePath + field + "." + redundant_field, model.get(redundant_field));
              }
              self.set("" + basePath + field + ".id", model._id);
              return loadData(self, model, "" + basePath + field, config.references, callback);
            } else {
              allowNullReferences = true;
              if (!allowNullReferences) {
                baseModel[field] = null;
              }
              return callback();
            }
          });
        };
      })(this), done);
    };
    schema.pre('validate', function(next) {
      var ref2, ref3;
      if (this.__forceUpdate) {
        if (this.updatedReferences == null) {
          this.updatedReferences = {};
        }
        ref2 = options.references;
        for (field in ref2) {
          config = ref2[field];
          if (((ref3 = this[field]) != null ? ref3.id : void 0) != null) {
            this.updatedReferences[field] = this[field].id;
          }
        }
      }
      return next();
    });
    schema.pre('validate', function(next) {
      var name, ref2, ref3, ref4, reference, references;
      if (this.isNew) {
        ref2 = options.references;
        for (field in ref2) {
          config = ref2[field];
          if (config.fields == null) {
            config.fields = [];
          }
          if (this[field] != null) {
            if (((ref3 = this.updatedReferences) != null ? ref3[field] : void 0) == null) {
              this.update(field, this[field], true);
            }
          }
        }
      }
      if (this.updatedReferences == null) {
        return next();
      }
      references = {};
      ref4 = options.references;
      for (name in ref4) {
        reference = ref4[name];
        if (this.updatedReferences[name] != null) {
          references[name] = reference;
          this[field + "_id"] = this.updatedReferences[name];
        }
      }
      return loadData(this, this, null, references, next);
    });
    return schema.pre('save', function(next) {
      if (this.isNew) {
        return next();
      }
      return async.each(mongoose.redundancyConfig[options.model], (function(_this) {
        return function(subscriber, callback) {
          var $set, i, len, obj2, ref2, ref3, update;
          $set = {};
          update = false;
          ref2 = subscriber.fields;
          for (i = 0, len = ref2.length; i < len; i++) {
            field = ref2[i];
            if (((ref3 = _this.updatedFields) != null ? ref3[field] : void 0) != null) {
              update = true;
              $set[subscriber.path + "." + field] = _this[field];
            }
          }
          if (update) {
            return mongoose.model(subscriber.model).update((
              obj2 = {},
              obj2[subscriber.path + ".id"] = _this._id,
              obj2
            ), {
              $set: $set
            }, {
              multi: true,
              writeConcern: false
            }, function() {
              return callback();
            });
          } else {
            return callback();
          }
        };
      })(this), next);
    });
  };

}).call(this);

