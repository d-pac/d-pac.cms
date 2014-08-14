'use strict';

var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.middleware' );

//-- taken from 'errors' module
function isHttpError( err ){
  return err && err.hasOwnProperty( 'explanation' ) && err.hasOwnProperty( 'code' );
}
//--

exports.initAPI = function initAPI( req,
                                    res,
                                    next ){
  debug( '#initAPI' );
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
  debug( '#requireUser' );
  var output;
  if( !req.user ){
    output = new errors.Http401Error();
  }
  return next( output );
};

exports.methodNotAllowed = function( req,
                                     res,
                                     next ){
  debug( '#methodNotAllowed' );
  return next( new errors.Http405Error() );
};

exports.requireAdmin = function( req,
                                 res,
                                 next ){
  debug( '#requireAdmin' );
  var output;
  if( !req.user.isAdmin ){
    output = new errors.Http401Error();
  }
  return next( output );
};

exports.handleError = function( err,
                                req,
                                res,
                                next ){
  debug( '#handleError' );
  console.error( err );

  if( isHttpError( err ) ){
    return res.apiError( err );
  }

  switch( err.name ){
    case 'ValidationError':
      return res.apiError( new errors.Http403Error( { wrapped : err } ) );
    case 'CastError':
      if( err.path && '_id' === err.path ){
        return res.apiError( new errors.Http404Error() );
      }
    /* falls through */
    default:
      return res.apiError( new errors.Http500Error() );
  }

};
