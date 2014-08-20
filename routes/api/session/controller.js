'use strict';
var keystone = require( 'keystone' );
var debug = require( 'debug' )( 'dpac:api.session.controller' );
var errors = require( 'errors' );

module.exports.retrieve = function( req,
                                    res,
                                    next ){
  debug('retrieve');
  if(req.user){
    return res.apiResponse(204); //No content
  }else{
    return res.apiError(new errors.Http401Error());
  }
};

module.exports.create = function( req,
                                  res,
                                  next ){
  debug( 'create' );
  keystone.session.signin( req.body, req, res, function( user ){
    debug( 'signed in', user.id );
    return res.apiResponse( user );
  }, function( err ){
    if( err ){
      return next( err );
    }else{
      return next( new errors.Http401Error( {
        reason : {
          name    : "AuthenticationError",
          message : "Bad credentials."
        }
      } ) );
    }
  } );
};

module.exports.destroy = function( req,
                                   res,
                                   next ){
  debug( 'destroy' );
  keystone.session.signout( req, res, function(){
    return res.apiResponse( 204, { } );
  } );
};
