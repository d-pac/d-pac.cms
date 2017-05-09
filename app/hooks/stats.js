'use strict';

const _ = require('lodash');
const statsService = require('../services/stats');
const Stat = statsService.collection;

module.exports.init = function () {
  Stat.events.on('change:actions', (doc,
                                          diff,
                                          done) => {
    if (_.get(doc, ['actions', 'calculate'], false)) {
      doc.set('actions.calculate', false);
      statsService.calculateStats(doc).asCallback(done);
    } else {
      done();
    }
  });

};
