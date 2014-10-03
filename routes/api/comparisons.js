'use strict';

var debug = require( 'debug' )( 'dpac:api.comparisons' );
var _ = require( 'underscore' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var errors = require( 'errors' );
var utils = require( './utils' );
var service = require( '../../services/comparisons' );
var Comparison = keystone.list( 'Comparison' );

exports.retrieve = function( req,
                             res,
                             next ){

  debug( '#retrieve' );
  service.retrieve( {
    _id : req.param( '_id' )
  } ).onResolve( function( err,
                           result ){
    if( err ){
      return next( err );
    }
    if( !result ){
      return next( new errors.Http404Error() );
    }

    res.apiResponse( result );
  } );
};

var update = module.exports.update = function( req,
                                               res,
                                               next ){
  debug( '#update' );
  var opts = req.body;
  service.update( opts,
    utils.verifyChangesAllowed( opts, Comparison.api.editable )
  ).onResolve( function( err,
                         result ){
      if( err ){
        return next( err );
      }
      if( !result ){
        return next( new errors.Http500Error() );
      }
      res.apiResponse( result );
    } );
};
