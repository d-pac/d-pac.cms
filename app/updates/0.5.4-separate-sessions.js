"use strict";

var keystone = require( "keystone" );

exports = module.exports = function( done ){
  keystone.mongoose
    .connection
    .db
    .dropCollection( "app_sessions", function( err,
                                               result ){
      console.log( "'app_sessions' collection removed." );
      done();
    } );
};
