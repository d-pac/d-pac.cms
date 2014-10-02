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
module.exports.retrieveActive = function retrievActiveComparison( opts ){
  debug( '#retrieveActive' );
  return Comparison.model
    .find( opts )
    .where( 'phase' ).ne( null )
    .populate( 'assessment' )
    .lean()
    .exec()
    .then(function(comparisons){
      if(!comparisons || comparisons.length < 0){
        throw new Error('No comparisons!');
      }
      return comparisons;
    });
};
