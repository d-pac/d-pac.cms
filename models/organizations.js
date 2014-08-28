var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Organization = new keystone.List( 'Organization', {
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
  path    : 'organization',
  ref     : 'User',
  refPath : 'organization',
  label   : 'Organization'
} );

var jsonFields = _.keys( config );

Organization.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', jsonFields );
    return model;
  }
} );

/**
 * Registration
 */

Organization.defaultColumns = 'name';
Organization.register();
