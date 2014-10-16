'use strict';
var debug = require( 'debug' )( 'dpac:api.users' );
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var Controller = require( './Controller' );
var service = require( '../../services/users' );
var schema = keystone.list( 'User' );

var controller = new Controller( service, schema );

exports.retrieve = function( req,
                             res,
                             next ){

  debug( '#retrieve' );
  controller.retrieve( {
    _id : req.user.id
  }, req, res, next );
};

var update = module.exports.update = function( req,
                                               res,
                                               next ){
  debug( '#update' );
  controller.update( {
    values : {
      _id : req.user.id
    },
    fields : schema.api.editable
  }, req, res, next );
};

module.exports.replace = function( req,
                                   res,
                                   next ){
  debug( '#replace' );
  update( req, res, next );
};
