"use strict";
var debug = require( "debug" )( "dpac:api.authentication" );

var _ = require( "underscore" );
var errors = require( "errors" );
var keystone = require( "keystone" );

module.exports.status = function status( req,
                                         res,
                                         next ){
  debug( "#status" );
  if( req.user ){
    return res.apiResponse( {
      data : req.user
    } );
  }

  return res.apiResponse( { data: false } );
};

module.exports.signin = function( req,
                                  res,
                                  next ){
  debug( "signin" );
  keystone.session.signin( req.body, req, res, function( user ){
    debug( "signed in", user.id );

    return res.apiResponse( {
      data : req.user.toJSON()
    } );
  }, function( err ){
    if( err ){
      return next( err );
    } else {
      return next( new errors.Http401Error( {
        message     : "Authentication error",
        explanation : "Bad credentials."
      } ) );
    }
  } );
};

module.exports.signout = function( req,
                                   res,
                                   next ){
  debug( "signout" );
  keystone.session.signout( req, res, function(){
    return res.apiResponse( 204 );
  } );
};
