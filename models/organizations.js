var _ = require( 'underscore' ),
    keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Organization = new keystone.List( 'Organization',{
  track: true
} );

Organization.add( {
  name     : {
    type : String,
    required : true,
    index : true
  }
} );


Organization.relationship( {
  path    : 'organization',
  ref     : 'User',
  refPath : 'organization',
  label   : 'Organization'
} );


/**
 * Registration
 */

Organization.defaultColumns = 'name';
Organization.register();
