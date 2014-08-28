'use strict';

var async = require( 'async' ),
  keystone = require( 'keystone' );

var Comparison = keystone.list( 'Comparison' );

exports.retrieve = function( req,
                             res,
                             next ){

};

exports.actions = { };

exports.actions.retrieveCurrent = function( req,
                                            res,
                                            next ){
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
  var assessment = req.param('assessment');

  /*
  1. select a new representation pair, if applicable
  2. create a comparison
  3. create 2 judgments
   */

  next();
};
