'use strict';

var debug = require( 'debug' )( 'dpac:api.comparisons' );
var keystone = require( 'keystone' );
var Controller = require( './controller' );
var service = require( '../../services/comparisons' );
var schema = keystone.list( 'Comparison' );

var controller = new Controller( service, schema );

exports.retrieve = function( req,
                             res,
                             next ){

  debug( '#retrieve' );
  controller.retrieve( {
    _id : req.param( '_id' )
  }, req, res, next );
};

module.exports.update = function( req,
                                  res,
                                  next ){
  debug( '#update' );
  controller.update( {
    fields : schema.api.editable
  }, req, res, next );
};

