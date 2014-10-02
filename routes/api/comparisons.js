'use strict';

var debug = require( 'debug' )( 'dpac:api.comparisons' );
var _ = require( 'underscore' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var errors = require( 'errors' );
var thrown = require( './utils' ).thrown;
var Comparison = keystone.list( 'Comparison' );

exports.retrieve = function( req,
                             res,
                             next ){

  debug( '#retrieve' );
  Comparison.model
    .findById( req.param( '_id' ) )
    .exec( function( err,
                     comparison ){
      if( !thrown( err, comparison, next ) ){
        return res.apiResponse( comparison );
      }
    } );
};

var update = module.exports.update = function( req,
                                               res,
                                               next ){
  debug( '#update' );

  Comparison.model
    .findById( req.param( '_id' ) )
    .exec( function( err,
                     comparison ){
      if(!thrown(err, comparison, next) ){
        comparison.getUpdateHandler( req, res ).process( req.body, {
          fields      : _.keys( _.pick( req.body, Comparison.api.editable ) ),
          flashErrors : false
        }, function( err,
                     processor ){
          if(!thrown(err, processor.item, next)){
            return res.apiResponse( comparison );
          }
        } );
      }
    } );
};
