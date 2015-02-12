"use strict";

var debug = require( "debug" )( "dpac:api.timelogs" );
var keystone = require( "keystone" );
var Controller = require( "./Controller" );
var service = require( "../../services/timelogs" );
var schema = keystone.list( "Timelog" );

var controller = new Controller( service, schema );

exports.list = function( req,
                         res,
                         next ){
  controller.list( {
    // no filtering, we need everything ?
  } ).then( function( result ){
    res.apiResponse( {
      timelogs : result
    } );
  } ).catch( function( err ){
    next( err );
  } );
};

exports.create = function( req,
                           res,
                           next ){
  debug( "#create" );
  controller.create( {
    fields : schema.api.creation
  }, req ).then( function( result ){
    res.apiResponse( {
      timelog : result
    } );
  } ).catch( function( err ){
    next( err );
  } );
};

exports.update = function( req,
                           res,
                           next ){
  debug( "#update" );
  controller.update( {
    fields : schema.api.editable
  }, req ).then( function( result ){
    res.apiResponse( {
      timelog : result
    } );
  } ).catch( function( err ){
    next( err );
  } );
};
