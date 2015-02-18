"use strict";
var debug = require( "debug" )( "dpac:services.representations" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var schema = keystone.list( "Representation" );
var toSafeJSON = require( "./utils" ).toSafeJSON;

var list = module.exports.list = function list( opts ){
  debug( "#list" );
  var query = schema.model
    .find( opts );

  if( _.isArray( opts ) ){
    query = query.where( "_id" ).in( opts );
  }

  return query
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

module.exports.listById = function listById( ids ){
  return module.exports.list( ids );
};

module.exports.retrievePair = function retrieveRepresentationPair( opts ){
  debug( "#retrievePair"  );

  opts = _.defaults( opts, {
    algorithm : "comparative-selection"
  } );

  return schema.model
    .find( {
      assessment : opts.assessment
    } )
    .exec()
    .then( function( representations ){
      return require( opts.algorithm ).select( representations );
    } );
};

module.exports.retrieveFull = function retrieveFull( opts ){
  return schema.model
    .findById( opts._id )
    .exec();
};
