"use strict";
var debug = require( "debug" )( "dpac:api.authentication" );
var P = require( 'bluebird' );

var errors = require( "errors" );
var keystone = require( "keystone" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( null );

module.exports.status = ( req,
                          res,
                          next ) =>{
  debug( "#status" );
  let data = (req.user)
    ? { 'type': 'sessions' }
    : null;
  return base.handleResult( data, res, next );
};

module.exports.signin = ( req,
                          res,
                          next ) =>{
  debug( "signin" );

  keystone.session.signin( req.body, req, res,
    ( user ) =>{
      debug( "signed in", user.id );
      return base.handleResult( {
        isNew: true,
        'type': 'sessions'
      }, res, next );
    },
    ( err ) =>{
      return base.handleResult( err || new errors.Http401Error( {
          message: "Authentication error",
          explanation: "Bad credentials."
        } ), res, next );
    } );
};

module.exports.signout = ( req,
                           res,
                           next ) =>{
  debug( "signout" );
  keystone.session.signout( req, res, () =>{
    base.handleResult( null, res, next );
  } );
};
