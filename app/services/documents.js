"use strict";
var debug = require( "debug" )( "dpac:services.documents" );

var keystone = require( "keystone" );
var schema = keystone.list( "Document" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );

module.exports.listById = function listById( ids ){
  return base.listByid( ids ).execAsync();
};

module.exports.list = function list( opts ){
  debug( "list" );
  return base.list( opts )
    .lean()
    .execAsync();
};

/**
 *
 * @param opts
 * @param opts._id Document.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieveDocument( opts ){
  debug( "#retrieve", opts );

  return base.retrieve( opts )
    .execAsync();
};

module.exports.getName = function getName( document ){
  debug( "#getName" );
  return base.getName( document );
};
