'use strict';
const _ = require('lodash');
const keystone = require('keystone');
const P = require('bluebird');
const representationsService = require('../services/representations');
const comparisonsService = require('../services/comparisons');
const log = _.partial(console.log, require('path').basename(__filename) + ':');

module.exports = function (done) {
  const userIds = {};
  const db = keystone.get("session options").store.db;
  const cursor = db.collection('app_sessions').find();
  P.fromCallback((callback) => {
    cursor.forEach((doc) => {
      const session = JSON.parse(doc.session);
      if(session.userId){
        userIds[session.userId] = true;
      }
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
