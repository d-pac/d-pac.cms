"use strict";

var debug = require( "debug" )( "dpac:api.comparisons" );
var representationsService = require( "../../services/representations" );
var service = require( "../../services/comparisons" );
var assessmentsService = require( '../../services/assessments' );
var statsService = require( '../../services/stats' );

var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.create = function( req,
                                  res,
                                  next ){
  req.body.assessor = req.user;
  var response = {};
  base.handleResult( base.create( req ).then( function( mixed ){
    if( "comparisons" !== mixed.type ){
      return mixed;
    }
    response.data = mixed;
    return service.listRepresentationsForComparisons( [ mixed ] ).then( function( representations ){
      response.included = representations;
      return response;
    } );
  } ), res, next, true );
};

module.exports.list = function( req,
                                res,
                                next ){
  var response = {};
  base.handleResult( base.list( req ).then( function( comparisons ){
    response.data = comparisons;
    return service.listRepresentationsForComparisons( comparisons ).then( function( representations ){
      response.included = representations;
      return response;
    } );
  } ), res, next, true );
};
