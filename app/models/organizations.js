var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var Organization = new keystone.List( "Organization", {
  track : true
} );

var config = {
  name : {
    type     : String,
    required : true,
    index    : true
  }
};

Organization.add( config );

Organization.relationship( {
  path    : "organization",
  ref     : "User",
  refPath : "organization",
  label   : "Organization"
} );

/**
 * Registration
 */

Organization.defaultColumns = "name";
Organization.register();
