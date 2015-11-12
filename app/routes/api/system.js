'use strict';

var debug = require( "debug" )( "dpac:api.system" );
var errors = require( 'errors' );

module.exports.action = function( req,
                                  res,
                                  next ){
  var action = module.exports[ req.params.action ];
  if( !action ){
    return next( new errors.Http404Error() );
  }

  return action( req, res, next );
};

module.exports.ping = function( req,
                                res,
                                next ){
  debug('#ping');
  return res.send( 200 );
};
