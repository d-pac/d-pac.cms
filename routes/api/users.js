'use strict';
var debug = require( 'debug' )( 'dpac:api.users' );
var keystone = require( 'keystone' );
var _ = require('underscore');
var Controller = require( './controller' );
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

module.exports.update = function( req,
                                  res,
                                  next ){
  debug( '#update' );
  var opts = _.extend({ _id : req.user.id}, req.body);
  controller.update( opts, req, res, next );
};

module.exports.replace = function( req,
                                   res,
                                   next ){
  debug( '#replace' );
  var opts = _.extend({ _id : req.user.id}, req.body);
  controller.replace( opts, req, res, next );
};
