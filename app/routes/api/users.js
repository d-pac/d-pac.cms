"use strict";

var debug = require( "debug" )( "dpac:api.users" );
var _ = require( 'underscore' );

var service = require( "../../services/users" );
var comparisonsService = require( "../../services/comparisons" );

var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.listAssessments = function( req,
                                           res,
                                           next ){
  debug( "#listAssessments" );
  base.handleResult( service.listAssessments( {
    _id: req.param( "_id" )
  } ), res, next );
};

module.exports.listComparisons = function( req,
                                           res,
                                           next ){
  debug( "#listComparisons" );

  var response = {};
  base.handleResult( service.listComparisons( {
    _id: req.param( "_id" )
  } ).then( function( comparisons ){
    response.data = comparisons;
    return comparisonsService.listRepresentationsForComparisons(comparisons).then(function(representations){
      response.included = representations;
      return response;
    });
  } ), res, next, true );
};
