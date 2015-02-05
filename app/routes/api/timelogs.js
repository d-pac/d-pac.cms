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
  }, req, res, next );
};

exports.create = function( req,
                           res,
                           next ){
  debug( "#create" );
  controller.create( {
    fields : schema.api.creation
  }, req, res, next );
};

exports.update = function( req,
                           res,
                           next ){
  debug( "#update" );
  controller.update( {
    fields : schema.api.editable
  }, req, res, next );
};
