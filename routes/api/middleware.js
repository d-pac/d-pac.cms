'use strict';

var errors = require( 'errors' );
var debug = require('debug')('dpac:api.middleware');

exports.initAPI = function initAPI( req,
                                    res,
                                    next ){
  debug('initAPI');
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
  debug('requireUser');
  if( !req.user ){
    res.apiError( new errors.Http401Error() );
  }else{
    next();
  }
};

exports.methodNotAllowed = function( req,
                                     res,
                                     next ){
  res.apiError( new errors.Http406Error() );
};
