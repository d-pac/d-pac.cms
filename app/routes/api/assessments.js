"use strict";

var debug = require( "debug" )( "dpac:api.assessments" );

var _ = require( "underscore" );
var errors = require( "errors" );
var keystone = require( "keystone" );

var service = require( "../../services/assessments" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );

module.exports.list = function list( req,
                                     res,
                                     next ){
  debug( "#list" );
  base.list( req )
    .then( function( result ){
      res.apiResponse( {
        assessments : result
      } );
    } ).catch( function( err ){
      next( err );
    } );
};
