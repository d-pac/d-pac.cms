'use strict';

var debug = require( 'debug' )( 'dpac:api.judgements' );
var keystone = require( 'keystone' );
var Controller = require( './Controller' );
var service = require( '../../services/judgements' );
var schema = keystone.list( 'Judgement' );

var controller = new Controller( service, schema );

module.exports.update = function( req,
                                  res,
                                  next ){
  debug( '#update' );
  controller.update( {
    fields : schema.api.editable
  }, req, res, next );
};
