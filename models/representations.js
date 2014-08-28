'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Representation = new keystone.List( 'Representation', {
  map   : {
    name : 'id'
  },
  track : true
} );

var config = {

  file : {
    type     : Types.LocalFile,
    dest     : 'public/uploads',
    required : true,
    initial  : false
  },

  assessee : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true
  },

  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    initial  : true,
    required : true,
    index    : true
  }

};

Representation.add( config );

var jsonFields = _.keys( config );

Representation.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', jsonFields );
    return model;
  }
} );

Representation.defaultColumns = 'name, assessee, assessment, file';
Representation.register();
