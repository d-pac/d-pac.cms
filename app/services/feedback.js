"use strict";
const debug = require( "debug" )( "dpac:services.notes" );
const keystone = require( "keystone" );
const schema = keystone.list( "Feedback" );
const Service = require( "./helpers/Service" );
const base = new Service( schema );
module.exports = base.mixin();

module.exports.listByDocuments = (opts, documentIds) =>{
  debug( "#listByDocuments", opts, documentIds );
  return base.list( opts )
    .where( "document" ).in( documentIds )
    .execAsync();
};
