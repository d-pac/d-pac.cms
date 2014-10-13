'use strict';

var debug = require( 'debug' )( 'dpac:services.timelogs' );
var _ = require( 'underscore' );
var extend = require('deep-extend');
var Promise = require( 'mpromise' );

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

/**
 *
 * @param opts
 * @param {string} opts._id Seq.id
 */
module.exports.update = function update( opts ){
  debug( 'update', opts );
  return schema.model
    .findById( opts._id )
    .exec()
    .then( function( doc ){
      extend( doc, opts );
      var promise = new Promise();
      doc.save( function( err,
                                 doc ){
        if( err ){
          return promise.reject( err );
        }
        promise.fulfill( doc );
      } );
      return promise;
    } );
};
