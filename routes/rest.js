'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var keystoneRest = require( 'keystone-rest' );
var User = keystone.list( 'User' );

// Expose User model via REST api
keystoneRest.exposeRoutes( User, {
  get    : { omit : ['password'] },
  put    : { omit : ['password'] }
} );

exports = module.exports = {
  register : function register(app){
    _.each( keystoneRest.routes, function( route ){
      app[route.method]( route.route, route.handler );
    } );    
  }
};