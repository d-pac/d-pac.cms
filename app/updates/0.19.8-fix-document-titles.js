'use strict';
const _ = require('lodash');
const documentsService = require('../services/documents');
const log = _.partial(console.log, require('path').basename(__filename) + ':');

module.exports = function (done) {
  documentsService.list({})
    .mapSeries((doc) => {
      doc.title = '';
      doc.representation=false;
      return doc.save();
    })
    .then((docs) => {
      log(`Updated ${docs.length} documents`);
      return null;
    })
    .asCallback(done);
};
