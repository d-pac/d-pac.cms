'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var keystoneRest = require( 'keystone-rest' );

keystoneRest.exposeRoutes( keystone.list( 'User' ), {
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
