'use strict';
var debug = require( 'debug' )( 'dpac:services.comparisons' );
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var nullValidator = require( './helpers/nullValidator' );
var Promise = require( 'mpromise' );
var Comparison = keystone.list( 'Comparison' );

module.exports.create = function createComparison( opts ){
  debug( '#create' );
  return Comparison.model.create( opts );
};

/**
 *
 * @param opts
 * @param {string} [opts.assessor] User.id
 * @returns {Promise}
 */
module.exports.listActive = function listActive( opts ){
  debug( '#listActive' );
  return Comparison.model
    .find( opts )
    .where( 'phase' ).ne( null )
    .populate( 'assessment' )
    .lean()
    .exec();
};

/**
 *
 * @param opts
 * @param {string} opts._id Comparison.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  return Comparison.model
    .findById( opts._id )
    .lean()
    .exec();
};

/**
 *
 * @param opts
 * @param {string} opts._id Comparison.id
 * @param {function} validator
 */
module.exports.update = function update( opts,
                                         validator ){
  debug( 'update' );
  return Comparison.model
    .findById( opts._id )
    .exec()
    .then( nullValidator( validator ) )
    .then( function( comparison ){
      _.extend( comparison, opts );
      var promise = new Promise();
      comparison.save( function( err,
                                 comparison ){
        if( err ){
          return promise.reject( err );
        }
        promise.fulfill( comparison );
      } );
      return promise;
    } );
};
