"use strict";

var debug = require( "debug" )( "dpac:api.messages" );

var service = require( "../../services/messages" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.create = function( req,
                                  res,
                                  next ){
  req.body.recipientType = 'pam';
  req.body.strategy = 'send';
  req.body.createdBy = req.user.id;
  req.body.confirm = true;
  req.body.fromAPI = true;
  base.handleResult( base.create( req ), res, next );
};
