'use strict';

var debug = require( 'debug' )( 'dpac:services.timelogs' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var toSafeJSON = require( './utils' ).toSafeJSON;
var schema = keystone.list( 'Timelog' );

var listById = module.exports.listById = function listById( ids ){
  return schema.model
    .find()
    .where( '_id' ).in( ids )
    .sort('comparison begin')
    .exec()
    .then( function( docs ){
      return toSafeJSON( docs );
    } );
};

module.exports.list = function list( opts ){
  debug( 'list' );
  if( _.isArray( opts ) ){
    return listById( opts );
  }

  return schema.model
    .find( opts )
    .sort('comparison begin')
    .exec()
    .then( function( docs ){
      return toSafeJSON( docs );
    } );
};

module.exports.create = function( opts ){
  debug( '#create' );
  return schema.model.create( opts );
};
