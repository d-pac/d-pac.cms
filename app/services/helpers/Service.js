"use strict";
var debug = require("debug")("dpac:services.helpers.Service");


const P = require('bluebird');
var _ = require("lodash");
var deepExtend = require("deep-extend");

function Service(collection) {
  this.collection = collection;
}

_.assignIn(Service.prototype, {
  mixin: function (receiver) {
    var methods = _.omit(_.keys(Service.prototype), "mixin");
    var service = this;
    receiver = receiver || {};
    _.forEach(methods, function (methodName) {
      receiver[methodName] = function () {
        var args = _.toArray(arguments);
        var result = service[methodName].apply(service, args);
        if (result && _.isFunction(result.exec)) {
          result = result.exec();
        }
        return result;
      };
    });
    receiver.collection = this.collection;
    return receiver;
  },

  count: function count(opts) {
    debug('#count', opts);
    return this.collection.model.count(opts);
  },
  list: function list(opts) {
    debug("#list", opts);
    return this.collection.model
      .find(opts);
  },

  listById: function listById(ids,
                              opts) {
    debug("#listById");
    if (_.isString(ids)) {
      ids = [ids];
    }

    ids = ids.filter((item)=> {
      return !!item;
    });

    return this.collection.model.find(opts)
      .where("_id").in(ids);
  },

  retrieve: function (opts) {
    debug("#retrieve");
    return this.collection.model
      .findById(opts._id, opts.fields, _.omit(opts, ['fields', '_id']));
  },

  create: function (opts) {
    debug("#create", opts);
    return this.collection.model.create(opts);
  },

  update: function (promise,
                    opts) {
    debug("#update");
    if (arguments.length < 2) {
      opts = promise;
      promise = {};
    }
    promise.exec = ()=>{
      return P.fromCallback((callback)=> {
        return this.collection.model.update({_id: opts._id}, {$set: opts}, callback);
      })
        .then(()=> {
          return this.retrieve(opts).exec();
        });
    };
    return promise;
  },

  remove: function (opts) {
    debug("#remove");
    var promise = this.retrieve(opts).exec();
    promise.exec = function () {
      return this.then((doc)=> {
        if (doc) {
          return doc.remove().then(()=>doc);
        }
      });
    }.bind(promise);

    return promise;
  },

  getName: function (item) {
    return this.collection.getDocumentName(item);
  },

  getEditableFields: function () {
    return _.get(this.collection, ['api', 'editable'], _.keys(this.collection.fields));
  },

  getCreatableFields: function () {
    return _.get(this.collection, ['api', 'creatable'], _.keys(this.collection.fields));
  },

  getFilterableFields: function () {
    return _.get(this.collection, ['api', 'filterable'], _.keys(this.collection.fields));
  }
});

module.exports = Service;
