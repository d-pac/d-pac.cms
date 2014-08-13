'use strict';

exports.initAPI = function initAPI( req,
                  res,
                  next ){

  res.apiResponse = function( status ){
    if( req.query.callback ){
      res.jsonp( status );
    }else{
      res.json( status );
    }
  };

  res.apiError = function( status,
                           message ){
    status = status || 500;
    res.status( status );
    res.apiResponse( { status : status, message : message || "Internal Server Error" } );
  };

  next();
};

/**
 Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function( req,
                                res,
                                next ){
  if( !req.user ){
    res.apiError( 401, "Not allowed");
  }else{
    next();
  }
};

exports.methodNotAllowed = function( req,
                                     res,
                                     next ){
  res.apiError( 406, "Method not allowed");
};
