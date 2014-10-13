'use strict';
var debug = require( 'debug' )( 'dpac:services.judgements' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var extend = require( 'deep-extend' );
var Promise = require( 'mpromise' );
var schema = keystone.list( 'Judgement' );

var listById = module.exports.listById = function listById(ids){
  return schema.model
    .find()
    .where( '_id' ).in( ids )
    .lean()
    .exec();
};

module.exports.list = function list( opts ){
  debug('list');
  if( _.isArray(opts)){
    return listById(opts);
  }

  return schema.model
    .find(opts)
    .lean()
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
  return schema.model
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
  return schema.model
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
