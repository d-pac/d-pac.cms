"use strict";

const keystone = require('keystone');
const transactions = require('../services/transactions');

function createHandler(model, action) {
  return function (doc) {
    transactions.log({
      action: action,
      model: model,
      subject: doc.id
    });
  };
}

function createCreationHandler(model) {
  const createdHandler = createHandler(model, "created");
  return function (next) {
    const doc = this;
    const isNew = doc.isNew; // we need to cache this, since after the next line it will be false
    next(); // release ASAP
    if (isNew) {
      createdHandler(doc);
    }
  };
}

module.exports.init = function () {
  keystone.list('Assessment').schema.pre('save', createCreationHandler("Assessment"));
  keystone.list('Assessment').schema.post('remove', createHandler("Assessment", "removed"));

  keystone.list('User').schema.pre('save', createCreationHandler("User"));
  keystone.list('User').schema.post('remove', createHandler("User", "removed"));

  keystone.list('Representation').schema.pre('save', createCreationHandler("Representation"));
  keystone.list('Representation').schema.post('remove', createHandler("Representation", "removed"));
};
