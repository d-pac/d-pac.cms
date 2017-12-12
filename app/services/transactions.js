"use strict";

const keystone = require('keystone');
const debug = require("debug")("dpac:services.transactions");
const modelName = "Transaction";
let db, Transaction;

module.exports.init = function (mongoURI) {
  db = keystone.mongoose.createConnection(mongoURI);
  db.on('open', function () {
    debug('connection opened');
  });
  db.on('error', function (err) {
    console.error(err);
  });
  Transaction = new keystone.mongoose.Schema({
    model: {
      type: String,
      index: true
    },
    action: {
      type: String,
      index: true
    },
    subject: {
      type: String, //string ID's
      index: true
    },
    createdAt: {
      type: Date,
      index: true
    }
  });
  keystone.mongoose.model(modelName, Transaction);
};

module.exports.log = function (payload) {
  const Model =db.model(modelName);
  const document = new Model();
  document.set(Object.assign({createdAt: Date.now()}, payload));
  document.save();
};
