'use strict';
var keystone = require( 'keystone' ),
  async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.users.controller' );
var User = keystone.list( 'User' ).model;

module.exports.list = function( req,
                                res,
                                next ){
  debug( 'list' );
  User.find().exec( function( err,
                              users ){
    if( err ){
      return next( err );
    }
    if( !users ){
      return res.apiError( new errors.Http404Error() );
    }
    var results = { };
    users.forEach( function( user ){
      results[user.id] = user;
    } );
    res.apiResponse( users );
  } );
};

module.exports.retrieve = function( req,
                                    res,
                                    next ){
  debug( 'retrieve' );
  User.findById( res.locals.user.id ).exec( function( err,
                                                      user ){
    if( err ){
      return next( err );
    }
    if( !user ){
      return res.apiError( new errors.Http404Error() );
    }
    return res.apiResponse( user );
  } );
};

module.exports.update = function( req,
                                  res,
                                  next ){
  debug( 'update' );
  User.findByIdAndUpdate( res.locals.user.id, req.body ).exec( function( err,
                                                                         user ){
      if( err ){
        return next( err );
      }
      if( !user ){
        return res.apiError( new errors.Http404Error() );
      }
      return res.apiResponse( user );
    }
  );
};
