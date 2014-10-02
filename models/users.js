var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

/**
 * Users
 * =====
 */

var User = new keystone.List( 'User' );

var config = {
  name         : {
    type     : Types.Name,
    required : true,
    index    : true
  },
  organization : {
    type    : Types.Relationship,
    ref     : 'Organization',
    index   : true,
    initial : true
  },
  email        : {
    type     : Types.Email,
    initial  : true,
    required : true,
    index    : true
  },
  password     : {
    type     : Types.Password,
    initial  : true,
    required : false
  }
};

User.add( config, 'Permissions', {
  isAdmin : {
    type  : Boolean,
    label : 'Can access Keystone'
  }
} );

// Provide access to Keystone
User.schema.virtual( 'canAccessKeystone' ).get( function(){
  return this.isAdmin;
} );

User.relationship( {
  path    : 'personas',
  ref     : 'Persona',
  refPath : 'user',
  label   : 'Personas'
} );

var jsonFields = _.keys( _.omit( config, 'password' ) );

User.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', jsonFields );
    return model;
  }
} );

User.api ={
  editable : [ 'name', 'email', 'password' ]
};

/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
