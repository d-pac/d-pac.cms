'use strict';
var keystone = require( 'keystone' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.middleware' );

//-- taken from 'errors' module
function isHttpError( err ){
  return err && err.hasOwnProperty( 'explanation' ) && err.hasOwnProperty( 'code' );
}
//--

exports.factories = {};

exports.initAPI = function initAPI( req,
                                    res,
                                    next ){
  debug( '#initAPI' );
  res.apiResponse = function( status, data ){
    if(!data){
      data = status;
      status = 200;
    }
    if( req.query.callback ){
      res.jsonp( status, data );
    }else{
      res.json( status, data );
    }
  };

  res.apiError = function( error ){
    res.apiResponse( error.status, error );
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
      return res.apiError( new errors.Http422Error( { reason : err } ) );
    case 'CastError':
      if( err.path && '_id' === err.path ){
        return res.apiError( new errors.Http404Error() );
      }
    /* falls through */
    default:
      return res.apiError( new errors.Http500Error() );
  }

};

exports.notFound = function(req,
  res,
  next){
  return res.apiError(new errors.Http404Error());
};

exports.factories.onlyAllow = function( methods ){
  return function methodNotAllowed( req,
                                    res,
                                    next ){
    debug( 'methodNotAllowed' );
    res.set('Allow', methods);
    return next( new errors.Http405Error() );
  };
};
