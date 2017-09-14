"use strict";
const debug = require( "debug" )( "dpac:services.notes" );
const keystone = require( "keystone" );
const collection = keystone.list( "Note" );
const Service = require( "./helpers/Service" );
const base = new Service( collection, debug );
module.exports = base.mixin();

module.exports.listByDocuments = function listByDocuments(opts, documentIds){
  debug( "#listByDocuments", opts, documentIds );
  return base.list( opts )
    .where( "document" ).in( documentIds )
    .exec();
};
