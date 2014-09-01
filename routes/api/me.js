'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.me' );
var createAggregateComparison = require( '../../services/createAggregateComparison' );
var retrieveRepresentationPair = require( '../../services/retrieveRepresentationPair' );

module.exports.prepareForAccount = function prepareForAccount( req,
                                                               res,
                                                               next ){
  debug('#prepareForAccount');
  res.locals.filter = {
    user : req.user.id
  };

  next();
};

module.exports.prepareForComparison = function prepareForComparison( req,
                                                                     res,
                                                                     next ){
  debug('#prepareForComparison')
  res.locals.filter = {
    assessor : req.user.id,
    active   : true
  };
  next();
};

module.exports.createComparison = function( req,
                                                  res,
                                                  next ){
  debug( '#createComparison' );

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
