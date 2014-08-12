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

User.schema.plugin( require( 'mongoose-random' )(), { path : '_r' } );

User.schema.set('toJSON',{
  virtuals : true,
  transform : function(doc, model, options){
    model = _.pick(model, 'id', 'name', 'email');
    return model;
  }
});

User.relationship( {
  path    : 'personas',
  ref     : 'Persona',
  refPath : 'user',
  label   : 'Personas'
} );

/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
