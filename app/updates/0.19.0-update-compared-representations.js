'use strict';
const _ = require('lodash');
const P = require('bluebird');
const representationsService = require('../services/representations');
const comparisonsService = require('../services/comparisons');
const log = _.partial(console.log, require('path').basename(__filename) + ':');

module.exports = function (done) {
  comparisonsService.listLean({})
    .then((comparisons) => {
      const representations = {};
      comparisons.forEach((comparison) => {
        const a = _.get(comparison, ["representations", "a"], "none").toString();
        const b = _.get(comparison, ["representations", "b"], "none").toString();
        representations[a] = true;
        representations[b] = true;
      });
      return Object.keys(representations);
    })
    .then(function (repIds) {
      return P.resolve(representationsService.collection.model
        .update({_id: {$in: repIds}}, {isInComparison: true})
      );
    })
    .asCallback(done);
};
