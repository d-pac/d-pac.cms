'use strict';

var debug = require( 'debug' )( 'dpac:api.comparisons' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var createAggregateComparison = require( '../../services/createAggregateComparison' );

var Comparison = keystone.list( 'Comparison' );

exports.retrieve = function( req,
                             res,
                             next ){

};

exports.actions = { };

exports.actions.retrieveCurrent = function( req,
                                            res,
                                            next ){
  debug( '#retrieveCurrent' );
  Comparison.model.findOne( {
    assessor : req.user.id,
    active   : true
  } ).exec( function( err,
                      comparison ){
    if( err ){
      return next( err );
    }
    if( !comparison ){
      return res.apiResponse( 204 );
    }

    return res.apiResponse( comparison );
  } );
};

exports.actions.retrieveNext = function( req,
                                         res,
                                         next ){
  debug( '#retrieveNext' );

  createAggregateComparison( {
    assessment      : req.param( 'assessment' ),
    assessor        : req.user.id,
    representations : [
      '53ff3496e22fd600007cc8a0',
      '53ff34d9e22fd600007cc8a1'
    ]
  } );
  /*
   1. select a new representation pair, if applicable
   2. create a comparison
   3. create 2 judgments
   */

  next();
};
