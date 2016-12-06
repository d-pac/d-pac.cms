'use strict';
const _ = require('lodash');
const documentsService = require('../services/documents');
const constants = require('../models/helpers/constants');
const log = _.partial( console.log, require( 'path' ).basename( __filename ) + ':' );

module.exports = function( done ){
  documentsService.list({})
    .reduce(function( memo, document ){
      if(document.file.path !== constants.directories.documents){
        document.file.path=constants.directories.documents;
        memo.push(document);
      }
      return memo;
    }, [])
    .mapSeries((document)=>document.save())
    .then(function( documents ){
      log('Updated', documents.length, 'documents');
      return null;
    })
    .asCallback(done);
};
