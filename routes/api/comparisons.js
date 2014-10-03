'use strict';

var debug = require( 'debug' )( 'dpac:api.comparisons' );
var _ = require( 'underscore' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var errors = require( 'errors' );
var thrown = require( './utils' ).thrown;
var service = require( '../../services/comparisons' );

exports.retrieve = function( req,
                             res,
                             next ){

  debug( '#retrieve' );
  service.retrieve( {
    comparison : req.param( 'comparison' )
  } ).onResolve( function( err,
                           result ){
    if( err ){
      return next( err );
    }
    if(! result){
      return next( new errors.Http404Error());
    }

    res.apiResponse( result );
  } );
};

var update = module.exports.update = function( req,
                                               res,
                                               next ){
  debug( '#update' );
};
