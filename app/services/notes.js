"use strict";
var debug = require( "debug" )( "dpac:services.notes" );
var keystone = require( "keystone" );
var schema = keystone.list( "Note" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );
module.exports = base.mixin();

module.exports.listByDocuments = function listByDocuments(opts, documentIds){
  debug( "#listByDocuments", opts, documentIds );
  var self = this;
  return base.list( opts )
    .where( "document" ).in( documentIds )
    .execAsync();
};
