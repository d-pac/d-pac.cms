'use strict';
var debug = require( "debug" )( "dpac:api.system" );
var errors = require( 'errors' );
var Controller = require( "./helpers/Controller" );
var base = new Controller( null );

module.exports.action = function( req,
                                  res,
                                  next ){
  const action = module.exports[ '_' + req.params.action ];
  let result = (action)
    ? action( req )
    : new errors.Http404Error();
  return base.handleResult( result, res, next );
};

module.exports._ping = function( req ){
  debug( '#ping' );
  return {
    now: Date.now(),
    type: 'ping'
  };
};
