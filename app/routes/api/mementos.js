"use strict";

var debug = require( "debug" )( "dpac:api.mementos" );

var _ = require( "underscore" );
var errors = require( "errors" );
var keystone = require( "keystone" );

var service = require( "../../services/mementos" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );

module.exports.list = function list( req,
                                     res,
                                     next ){
  debug( "#list" );
  base.list()
    .then( function( result ){
      res.apiResponse( {
        user : result
      } );
    } ).catch( function( err ){
      next( err );
    } );
};
