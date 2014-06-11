'use strict';

var _ = require( 'underscore' ),
    keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Representation = new keystone.List( 'Representation', {
  map : {
    name : 'id'
  }
} );

Representation.add( {
  file  : {
    type : Types.LocalFile,
    dest : 'public/uploads',
    required : true,
    initial : false
  },
  assessee : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true
  },
  assessment : { 
    type : Types.Relationship,
    ref : 'Assessment',
    initial : true,
    required : true,
    index : true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    noedit : true
  }
} );
Representation.schema.plugin(require('mongoose-random')(), { path: '_r' });
Representation.defaultColumns = 'name, assessee, assessment, file';
Representation.register();