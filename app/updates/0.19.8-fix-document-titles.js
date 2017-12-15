'use strict';
const _ = require('lodash');
const documentsService = require('../services/documents');
const log = _.partial(console.log, require('path').basename(__filename) + ':');

module.exports = function (done) {
  const errored  =[];
  documentsService.list({})
    .mapSeries((doc) => {
      doc.title = '';
      doc.representation=false;
      return doc.save()
        .catch((err)=>{
          errored.push(doc.id);
        });
    })
    .then((docs) => {
      log(`Processed ${docs.length} documents, with ${errored.length} errors`);
      return null;
    })
    .asCallback(done);
};
