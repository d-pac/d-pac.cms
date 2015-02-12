"use strict";

var debug = require( "debug" )( "dpac:api.users" );

var _ = require( "underscore" );
var errors = require( "errors" );
var keystone = require( "keystone" );

var schema = keystone.list( "User" );
var service = require( "../../services/users" );
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

module.exports.retrieve = function list( req,
                                         res,
                                         next ){
  debug( "#retrieve" );
  base.retrieve( {
    _id : req.param( "_id" )
  } )
    .then( function( result ){
      res.apiResponse( {
        user : result
      } );
    } ).catch( function( err ){
      next( err );
    } );
};

module.exports.update = function update( req,
                                         res,
                                         next ){
  debug( "update" );
  base.update( {
    fields : schema.api.editable
  }, req )
    .then( function( result ){
      res.apiResponse( {
        user : result
      } );
    } ).catch( function( err ){
      next( err );
    } );
};
