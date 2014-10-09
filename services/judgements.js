'use strict';
var debug = require( 'debug' )( 'dpac:services.judgements' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var extend = require( 'deep-extend' );
var Promise = require( 'mpromise' );
var Judgement = keystone.list( 'Judgement' );

module.exports.list = function list( opts ){
  debug( '#retrieve' );
  return Judgement.model
    .find( opts )
    .populate( 'representation' )
    .exec();
};

module.exports.create = function createJudgements( opts ){
  debug( '#create' );
  var judgements = [];
  _.each( opts.representations, function( representation ){
    judgements.push( {
      assessor       : opts.assessor,
      assessment     : opts.assessment,
      comparison     : opts.comparison,
      representation : representation
    } );
  } );
  return Judgement.model
    .create( judgements )
    .then( function(){
      //won't be handled correctly in the promise chain, unless if we pass them along here
      return _.toArray( arguments );
    } );
};

/**
 *
 * @param opts
 * @param {string} opts._id Judgement.id
 */
module.exports.update = function update( opts ){
  debug( 'update' );
  return Judgement.model
    .findById( opts._id )
    .exec()
    .then( function( judgement ){
      extend( judgement, opts );
      var promise = new Promise();
      judgement.save( function( err,
                                comparison ){
        if( err ){
          return promise.reject( err );
        }
        promise.fulfill( comparison );
      } );
      return promise;
    } );
};
