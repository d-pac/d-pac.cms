var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

/**
 * Users
 * =====
 */

var User = new keystone.List( 'User' );

User.add( {
  name     : { type : Types.Name, required : true, index : true },
  email    : { type : Types.Email, initial : true, required : true, index : true },
  password : { type : Types.Password, initial : true, required : false }
}, 'Permissions', {
  isAdmin : { type : Boolean, label : 'Can access Keystone' }
} );

// Provide access to Keystone
User.schema.virtual( 'canAccessKeystone' ).get( function(){
  return this.isAdmin;
} );

/**
 * Relationships
 */

User.relationship( {
  //"field" name in _this_ model
  path    : 'personas',
  //_other_ model name
  ref     : 'Persona',
  //relationship field in _other_ model
  refPath : 'user',
  //label to be used in Admin GUI
  label   : 'Active as'
} );
/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
