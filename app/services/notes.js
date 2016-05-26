"use strict";
var debug = require( "debug" )( "dpac:services.notes" );
var keystone = require( "keystone" );
var collection = keystone.list( "Note" );
var Service = require( "./helpers/Service" );
var base = new Service( collection );
module.exports = base.mixin();

module.exports.listByDocuments = function listByDocuments(opts, documentIds){
  debug( "#listByDocuments", opts, documentIds );
  return base.list( opts )
    .where( "document" ).in( documentIds )
    .exec();
};
