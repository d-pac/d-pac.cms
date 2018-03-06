"use strict";
const {
  isArray,
  map: _map,
  toArray,
  forEach: _forEach,
  set: _set,
  get: _get, difference
} = require( "lodash" );

const {
  Http400Error,
  Http401Error,
  Http403Error,
  Http404Error,
  Http422Error,
  Http500Error
} = require( "errors" );

const keystone = require( "keystone" );
const debug = require( "debug" )( "dpac:api.middleware" );
const cors = require( "cors" );
const utils = require( "./utils" );

exports.factories = {};

exports.initAPI = function initAPI( req,
                                    res,
                                    next ){
  debug( "#initAPI" );
  res.apiResponse = function( status,
                              data ){
    const rid = req.get( "Request-UUID" );
    if( rid ){
      res.header( "Request-UUID", rid );
    }

    res.header( 'x-powered-by', keystone.get( 'name' ) );

    debug( "<<<<<<<<<<<<<<<<<<<< RESPONSE: " );
    debug( "\n", {
      STATUS: status,
      //BODY: data,
      HEADERS: res._headers
    } );

    if( req.query.callback ){
      res.status( status ).jsonp( data );
    } else {
      res.status( status ).json( data );
    }
  };

  res.apiError = function( status,
                           errors ){
    if( arguments.length === 1 ){
      errors = status;
      status = errors.status || 500;
    }
    if( ! isArray( errors ) ){
      errors = [ errors ];
    }
    res.apiResponse( status, { errors: errors } );
  };

  // console.log(req.headers);

  next();
};

exports.setIdParamToUser = function( req,
                                     res,
                                     next ){
  debug( "#setIdParamToUser" );
  req.params._id = req.user.id;
  next();
};

/**
 Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function( req,
                                res,
                                next ){
  debug( "#requireUser" );
  let output;

  if( !req.user ){
    output = new Http401Error( {
      explanation: "You need to be logged in."
    } );
  }

  return next( output );
};

exports.requireAdmin = function( req,
                                 res,
                                 next ){
  debug( "#requireAdmin" );
  let output;

  if( !req.user.isAdmin ){
    output = new Http401Error();
  }

  return next( output );
};

function parseValidationErrors( err ){
  const messages = _map( err.errors, "message" );

  return new Http422Error( {
    message: err.message,
    explanation: messages
  } );
}

exports.handleError = function( err,
                                req,
                                res,
                                next ){
  console.error( "dpac:api.middleware#handleError", err.message );
  const handler = (res.apiError) ? res.apiError : next;

  if(keystone.get('dev env')){
    console.log(err.stack);
  }

  if( utils.isHttpError( err ) ){
    return handler( err );
  }

  switch( err.name ){
    case "ValidationError":
      return handler( parseValidationErrors( err ) );
    case "CastError":
      return handler( new Http400Error( {
        explanation: "Invalid id."
      } ) );
    /* falls through */
    default:
      return handler( new Http500Error( {
        explanation: err.message
      } ) );
  }
};

exports.notFound = function notFound( req,
                                      res,
                                      next ){
  debug( "notFound" );

  return res.apiError( new Http404Error() );
};

exports.requireSelf = function( req,
                                res,
                                next ){
  const id = req.params._id;
  debug( "#requireSelf", id );

  if( req.user && ( req.user.isAdmin || ( id && id === req.user.id ) ) ){
    return next();
  }

  return next( new Http401Error() );
};

exports.verifyCSRF = function( req,
                               res,
                               next ){
  debug( "#verifyCSRF" );

  if( keystone.security.csrf.validate( req ) ){
    return next();
  }

  return next( new Http403Error( {
    reason: "Failed CSRF authentication"
  } ) );
};

exports.methodNotAllowed = function methodNotAllowed( req,
                                                      res,
                                                      next ){
  debug( "#methodNotAllowed" );
  //return next( new errors.Http405Error() );
  // we're gonna hide behind a 404
  return next( new Http404Error() );
};

exports.createCors = function(){
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS || [];
  const corsOpts = {
    origin: function( url,
                      callback ){
      callback( null, -1 < allowedOrigins.indexOf( url ) );
    },
    methods: process.env.CORS_ALLOWED_METHODS,
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
    exposedHeaders: process.env.CORS_EXPOSED_HEADERS,
    credentials: true
  };

  return cors( corsOpts );
};

exports.requireParams = function(){
  let args;

  if( 1 === arguments.length && isArray( arguments[ 0 ] ) ){
    args = arguments[ 0 ];
  } else {
    args = toArray( arguments );
  }

  return function( req,
                   res,
                   next ){
    debug( "#verifyRequiredParam" );
    const missing = [];
    _forEach( args, function( paramName ){
      if( "undefined" === typeof req.params[ paramName ] ){
        missing.push( paramName );
      }
    } );

    if( missing.length ){
      return next( new Http400Error( {
        explanation: "Missing parameters: '" + missing.join( "', '" ) + "'"
      } ) );
    }

    return next();
  };
};

module.exports.parseUserId = function parseUserId( req,
                                                   res,
                                                   next ){
  debug( "#parseUserId" );
  const idParam = req.params._id;
  if( ( !idParam || "me" === idParam ) && req.user ){
    req.params._id = req.user.id;
  }
  next();
};

module.exports.setType = ( name,
                           quantity ) =>{
  debug( '#setType', name, quantity );
  return ( req,
           res,
           next ) =>{
    _set( res, [ 'locals', 'type' ], {
      name: name,
      quantity: quantity
    } );
    next();
  };
};

module.exports.sendData = ( req,
                            res,
                            next ) =>{
  const type = _get( res, [ 'locals', 'type' ], {} );
  const results = _get( res, [ 'locals', 'results' ] );
  let status = 200;
  let payload;
  if( !results ){
    status = 204;
  } else {
    let requestedResults = results.filter( ( item ) =>{
      return item.type === type.name;
    } );
    let data = requestedResults;
    if( type.quantity === 'single' && requestedResults.length === 1 ){
      data = requestedResults[ 0 ];
      if( data.isNew ){
        status = 201;
      }
    }
    payload = {
      data: data,
      included: difference( results, requestedResults )
    };
  }

  res.apiResponse( status, payload );
};
