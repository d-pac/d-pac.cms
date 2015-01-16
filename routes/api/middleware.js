"use strict";
var _ = require( "underscore" );
var keystone = require( "keystone" );
var errors = require( "errors" );
var debug = require( "debug" )( "dpac:api.middleware" );
var cors = require( "cors" );
var utils = require( "./utils" );

exports.factories = {};

exports.initAPI = function initAPI( req,
                                    res,
                                    next ){
  debug( "#initAPI" );
  res.apiResponse = function( status,
                              data ){
    var rid = req.get( "Request-UUID" );
    res.header( "Request-UUID", rid );

    if( !data && !_.isNumber( status ) ){
      data = status;
      status = 200;
    }

    debug( "<<<<<<<<<<<<<<<<<<<< RESPONSE: " );
    debug( "\n", {
      STATUS  : status,
      BODY    : data,
      HEADERS : res._headers
    } );

    if( req.query.callback ){
      res.jsonp( status, data );
    } else {
      res.json( status, data );
    }
  };

  res.apiError = function( error ){
    res.apiResponse( error.status || 500, error );
  };

  // console.log(req.headers);

  next();
};

/**
 Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function( req,
                                res,
                                next ){
  debug( "#requireUser" );
  var output;

  if( !req.user ){
    output = new errors.Http401Error( {
      explanation : "You need to be logged in."
    } );
  }

  return next( output );
};

exports.requireAdmin = function( req,
                                 res,
                                 next ){
  debug( "#requireAdmin" );
  var output;

  if( !req.user.isAdmin ){
    output = new errors.Http401Error();
  }

  return next( output );
};

function parseValidationErrors( err ){
  var messages = _.pluck( err.errors, "message" );

  return new errors.Http422Error( {
    message     : err.message,
    explanation : messages
  } );
}

exports.handleError = function( err,
                                req,
                                res,
                                next ){
  debug( "#handleError", err );

  if( utils.isHttpError( err ) ){
    return res.apiError( err );
  }

  switch( err.name ){
    case "ValidationError":
      return res.apiError( parseValidationErrors( err ) );
    case "CastError":
      return res.apiError( new errors.Http400Error( {
        explanation : "Invalid id."
      } ) );
    /* falls through */
    default:
      return res.apiError( new errors.Http500Error( {
        explanation : err.message
      } ) );
  }
};

exports.notFound = function notFound( req,
                                      res,
                                      next ){
  debug( "notFound" );

  return res.apiError( new errors.Http404Error() );
};

exports.requireSelf = function( req,
                                res,
                                next ){
  debug( "#requireSelf" );
  var id = res.locals.user.id;

  if( req.user.isAdmin || ( id && id === req.user.id ) ){
    return next();
  } else {
    return next( new errors.Http401Error() );
  }
};

exports.verifyCSRF = function( req,
                               res,
                               next ){
  debug( "#verifyCSRF" );

  if( keystone.security.csrf.validate( req ) ){
    return next();
  }

  return next( new errors.Http403Error( {
    reason : "Failed CSRF authentication"
  } ) );
};

exports.onlyAllow = function( methods ){
  return function methodNotAllowed( req,
                                    res,
                                    next ){
    debug( "#methodNotAllowed" );
    res.set( "Allow", methods );

    return next( new errors.Http405Error() );
  };
};

exports.initCORS = function(){
  var allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
  var corsOpts = {
    origin         : function( url,
                               callback ){
      callback( null, -1 < allowedOrigins.indexOf( url ) );
    },
    methods        : process.env.CORS_ALLOWED_METHODS,
    allowedHeaders : process.env.CORS_ALLOWED_HEADERS,
    exposedHeaders : process.env.CORS_EXPOSED_HEADERS,
    credentials    : true
  };

  return cors( corsOpts );
};

exports.requireParams = function(){
  var args;

  if( 1 === arguments.length && _.isArray( arguments[ 0 ] ) ){
    args = arguments[ 0 ];
  } else {
    args = _.toArray( arguments );
  }

  return function( req,
                   res,
                   next ){
    debug( "#verifyRequiredParam" );
    var missing = [];
    _.each( args, function( paramName ){
      if( "undefined" === typeof req.param( paramName ) ){
        missing.push( paramName );
      }
    } );

    if( missing.length ){
      return next( new errors.Http400Error( {
        explanation : "Missing parameters: '" + missing.join( "', '" ) + "'"
      } ) );
    }

    return next();
  };
};
