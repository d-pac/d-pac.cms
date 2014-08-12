'use strict';
var keystone = require( 'keystone' ),
  async = require( 'async' );
var User = keystone.list( 'User' );

module.exports.retrieve = function( req,
                                    res,
                                    next ){
  User.model.findById( res.locals.id || req.params.id, function( err,
                                              user ){
    if( err || !user ){
      return res.apiError( 'Invalid id or resource with id not found' );
    }
    return res.apiResponse( user.toJSON() );
  } );
};
