'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.middleware' );
var cors = require( 'cors' );

var Persona = keystone.list( 'Persona' );

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
  res.apiResponse = function( status,
                              data ){
    if( !data && !_.isNumber( status ) ){
      data = status;
      status = 200;
    }
    debug( 'RESPONSE', {
      status : status,
      body   : data
    } );
    if( req.query.callback ){
      res.jsonp( status, data );
    }else{
      res.json( status, data );
    }
  };

  res.apiError = function( error ){
    res.apiResponse( error.status, error );
  };

  //console.log(req.headers);

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
      return res.apiError( new errors.Http400Error() );
    /* falls through */
    default:
      return res.apiError( new errors.Http500Error() );
  }

};

exports.notFound = function notFound( req,
                                      res,
                                      next ){
  debug( 'notFound' );
  return res.apiError( new errors.Http404Error() );
};

exports.parseUserId = function( req,
                                res,
                                next ){
  debug( '#parseUserId' );
  var userId;
  if( 'undefined' !== typeof req.params.id ){
    if( req.params.id === 'me' ){
      userId = req.user.id;
    }else{
      userId = req.params.id;
    }

  }
  res.locals.user = {
    id : userId
  };
  next();
};

exports.requireSelf = function( req,
                                res,
                                next ){
  debug( '#requireSelf' );
  var id = res.locals.user.id;
  if( req.user.isAdmin || (id && id === req.user.id) ){
    return next();
  }else{
    return next( new errors.Http401Error() );
  }
};

exports.verifyCSRF = function( req,
                               res,
                               next ){

  if( "true" === process.env.CSRF_DISABLED || keystone.security.csrf.validate( req ) ){
    return next();
  }

  return next( new errors.Http403Error( {
    reason : "Failed CSRF authentication"
  } ) );

};

exports.factories.onlyAllow = function( methods ){
  return function methodNotAllowed( req,
                                    res,
                                    next ){
    debug( '#methodNotAllowed' );
    res.set( 'Allow', methods );
    return next( new errors.Http405Error() );
  };
};

exports.factories.initCORS = function(){
  var allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
  var corsOpts = {
    origin         : function( origin,
                               callback ){
      callback( null, allowedOrigins.indexOf( origin ) > -1 );
    },
    methods        : process.env.CORS_ALLOWED_METHODS,
    allowedHeaders : process.env.CORS_ALLOWED_HEADERS,
    credentials    : true
  };
  return cors( corsOpts );
};

exports.factories.requireParam = function( paramName ){
  return function( req,
                   res,
                   next ){
    debug( '#verifyRequiredParam' );
    if( 'undefined' === typeof req.param( paramName ) ){
      return next( new errors.Http400Error( {
        reason : "Missing parameter: " + paramName
      } ) );
    }
    return next();
  };
};

exports.factories.requirePersona = function( role ){
  return function( req,
                   res,
                   next ){
    debug( '#verifyPersona' );
    Persona.model.findOne( {
      role       : role,
      assessment : req.param( 'assessment' ),
      user       : req.user.id
    } ).exec( function( err,
                        persona ){
      if( err ){
        return next( err );
      }
      if( !persona ){
        return next( new errors.Http403Error( {
          reason : "Insufficient permissions"
        } ) );
      }

      return next();
    } );
  };
};
