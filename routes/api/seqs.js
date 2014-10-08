'use strict';

var debug = require( 'debug' )( 'dpac:api.seqs' );
var keystone = require( 'keystone' );
var Controller = require( './controller' );
var service = require( '../../services/seqs' );
var schema = keystone.list( 'Seq' );

var controller = new Controller( service, schema );

exports.create = function( req,
                           res,
                           next ){

  debug( '#create' );
  controller.create( {
    fields : schema.api.creation
  }, req, res, next );
};

exports.update = function( req,
                           res,
                           next ){
  debug( '#update' );
  controller.update( {
    fields : schema.api.editable
  }, req, res, next );
};
