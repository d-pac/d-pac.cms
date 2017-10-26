'use strict';
const _ = require('lodash');
const keystone = require('keystone');
const P = require('bluebird');
const representationsService = require('../services/representations');
const comparisonsService = require('../services/comparisons');
const log = _.partial(console.log, require('path').basename(__filename) + ':');

module.exports = function (done) {
  // comparisonsService.listLean({})
  //   .then((comparisons) => {
  //     const representations = {};
  //     comparisons.forEach((comparison) => {
  //       const a = _.get(comparison, ["representations", "a"], "none").toString();
  //       const b = _.get(comparison, ["representations", "b"], "none").toString();
  //       representations[a] = true;
  //       representations[b] = true;
  //     });
  //     return Object.keys(representations);
  //   })
  //   .then(function (repIds) {
  //     log(`Updating ${repIds.length} representations...`);
  //     return P.resolve(representationsService.collection.model
  //       .update({_id: {$in: repIds}}, {isInComparison: true}, {multi:true})
  //     );
  //   })
  //   .then(function () {
  //     log('Done.');
  //     return null;
  //   })
  //   .asCallback(done);
  const userIds = {};
  const db = keystone.get("session options").store.db;
  const cursor = db.collection('app_sessions').find();
  P.fromCallback((callback) => {
    cursor.forEach((doc) => {
      userIds[JSON.parse(doc.session).userId] = true;
      console.log('foo', JSON.parse(doc.session).userId);
    }, callback);
  })
    .then(() => comparisonsService.listLean())
    .then((comparisons) => {
      comparisons.forEach((comparison) => userIds[comparison.assessor] = true);
      return null;
    })
    .then(() => {
      const now = Date.now();
      return P.resolve(
        keystone.list("User")
          .model
          .update({_id:{$in: Object.keys(userIds)}}, {lastLogin: now}, {multi: true})
      );
    })
    .then(()=>{
      log(`Updated ${Object.keys(userIds).length} users' "lastLogin" field.`);
      return null;
    })
    .asCallback(done);
};
