'use strict';

var debug = require( 'debug' )( 'dpac:api.comparisons' );
var async = require( 'async' ),
  keystone = require( 'keystone' );

var Comparison = keystone.list( 'Comparison' );

exports.retrieve = function( req,
                             res,
                             next ){

  debug( '#retrieve' );
  Comparison.model
    .findOne( res.locals.filter )
    .exec( function( err,
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
