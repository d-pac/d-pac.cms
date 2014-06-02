'use strict';

var _ = require( 'underscore' ),
    keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Representation = new keystone.List( 'Representation' );

Representation.add( {
  file  : {
    type : Types.LocalFile,
    dest : 'public/uploads',
    required : true,
    initial : false
  },
  owner : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true
  },
  assessment : {
    type : Types.Relationship,
    ref : 'Assessment',
    index : true,
    require : true,
    initial : true
  }
} );

Representation.defaultColumns = 'owner, file';
Representation.register();