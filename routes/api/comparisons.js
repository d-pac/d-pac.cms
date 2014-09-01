'use strict';

var debug = require( 'debug' )( 'dpac:api.comparisons' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var createAggregateComparison = require( '../../services/createAggregateComparison' );
var retrieveRepresentationPair = require( '../../services/retrieveRepresentationPair' );

var Comparison = keystone.list( 'Comparison' );

exports.retrieve = function( req,
                             res,
                             next ){

};

exports.actions = {};

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

  async.waterfall( [
    function( done ){
      retrieveRepresentationPair( done );
    },
    function( representations,
              done ){
      createAggregateComparison( {
        assessment      : req.param( 'assessment' ),
        assessor        : req.user.id,
        representations : representations
      }, done );
    }
  ], function( err,
               result ){
    if( err ){
      return next( err );
    }

    return res.apiResponse( result );
  } );
};
