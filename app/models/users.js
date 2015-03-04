var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

/**
 * Users
 * =====
 */

var User = new keystone.List( "User" );

var config = {
  name         : {
    type     : Types.Name,
    required : true,
    index    : true
  },
  organization : {
    type    : Types.Relationship,
    ref     : "Organization",
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
  },
  assessments  : {
    type     : Types.Relationship,
    ref      : "Assessment",
    index    : true,
    initial  : false,
    required : false,
    many     : true
  }
};

User.add( config, "Permissions", {
  isAdmin : {
    type  : Boolean,
    label : "Can access Keystone"
  }
} );

// Provide access to Keystone
User.schema.virtual( "canAccessKeystone" ).get( function(){
  return this.isAdmin;
} );

var jsonFields = _.keys( _.omit( config, "password" ) );

User.schema.set( "toJSON", {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, "_id", jsonFields );

    return model;
  }
} );

User.api = {
  editable : [ "name", "email", "password" ]
};

/**
 * Registration
 */

User.defaultColumns = "name, email, isAdmin";
User.register();
