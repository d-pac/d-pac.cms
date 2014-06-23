'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var keystoneRest = require( 'keystone-rest' );

var excludedUserFields = ['password', 'isAdmin', 'email', '__v', '_r'];

keystoneRest.exposeRoutes( keystone.list( 'User' ), {
  get : { 
    omit : excludedUserFields 
  },
  put : { 
    omit : ['password'] 
  }
} );

keystoneRest.exposeRoutes( keystone.list( 'Representation' ), {
  get : {
    omit          : ['__v', '_r'],
    relationships : {
      assessee : {
        omit : excludedUserFields
      }
    }
  }
} );

exports = module.exports = {
  register : function register( app ){
    console.log( keystoneRest.routes );
    keystoneRest.registerRoutes(app);
  }
};