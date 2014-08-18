'use strict';
var keystone = require( 'keystone' );
var debug = require( 'debug' )( 'dpac:api.auth.controller' );
var errors = require('errors');

module.exports.signin = function( req,
                                  res,
                                  next ){
  debug('signin');
  keystone.session.signin(req.body, req, res, function(user){
    debug('signed in', user.id);
    return res.apiResponse(user);
  }, function(err){
    if(err){
      return next(err);
    }else{
      return next(new errors.Http401Error({
        reason:{
          name: "AuthenticationError",
          message: "Bad credentials."
        }
      }));
    }
  });
};

module.exports.signout = function(req,
  res,
  next){
  debug('signout');
  keystone.session.signout(req, res, function(){
    return res.apiResponse(204, {});
  });
};
