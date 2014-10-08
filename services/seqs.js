'use strict';
var debug = require( 'debug' )( 'dpac:services.seqs' );
var keystone = require( 'keystone' );
var extend = require('deep-extend');
var Promise = require( 'mpromise' );
var schema = keystone.list('Seq');

module.exports.create = function( opts ){
  debug( '#create' );
  return schema.model.create( opts );
};

module.exports.list = function( opts ){
  debug('#list');
  return schema.model
    .find(opts)
    .lean()
    .exec();
};

/**
 *
 * @param opts
 * @param {string} opts._id Seq.id
 */
module.exports.update = function update( opts ){
  debug( 'update' );
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
