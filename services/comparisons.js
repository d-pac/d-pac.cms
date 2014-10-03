'use strict';
var debug = require( 'debug' )( 'dpac:services.comparisons' );
var keystone = require( 'keystone' );
var Comparison = keystone.list( 'Comparison' );

module.exports.create = function createComparison( opts ){
  debug('#create');
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
 * @param {string} opts.comparison Comparison.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve(opts){
  return Comparison.model
    .findById(opts.comparison)
    .lean()
    .exec();
}
