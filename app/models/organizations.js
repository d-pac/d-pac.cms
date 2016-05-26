'use strict';

var keystone = require( "keystone" );

var Organization = new keystone.List( "Organization", {
  track : true
} );
Organization.defaultColumns = "name";

require( './helpers/setupList' )( Organization )
  .add( {
    name : {
      type     : String,
      required : true,
      index    : true
    }
  } )
  .relate( {
    path    : "organization",
    ref     : "User",
    refPath : "organization",
    label   : "Organization"
  } )
  .register();
