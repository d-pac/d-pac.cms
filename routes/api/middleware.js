'use strict';

var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.middleware' );

exports.initAPI = function initAPI( req,
                                    res,
                                    next ){
  debug( 'initAPI' );
  res.apiResponse = function( status ){
    if( req.query.callback ){
      res.jsonp( status );
    }else{
      res.json( status );
    }
  };

  res.apiError = function( error ){
    res.status( error.status );
    res.apiResponse( error );
  };

  next();
};

/**
 Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function( req,
                                res,
                                next ){
  debug( 'requireUser' );
  if( !req.user ){
    res.apiError( new errors.Http401Error() );
  }else{
    next();
  }
};

exports.methodNotAllowed = function( req,
                                     res,
                                     next ){
  return res.apiError( new errors.Http406Error() );
};

exports.requireAdmin = function( req,
                                 res,
                                 next ){
  debug( 'requireAdmin' );
  if( !req.user.isAdmin ){
    return res.apiError( new errors.Http401Error() );
  }else{
    next();
  }
};

exports.handleError = function( err,
                                req,
                                res,
                                next ){
  console.error( err );
  if( (err.name && 'CastError' === err.name) && (err.path && '_id' === err.path ) ){
    return res.apiError( new errors.Http404Error() );
  }else{
    return res.apiError( new errors.Http500Error() );
  }
};
