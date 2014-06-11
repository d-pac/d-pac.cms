'use strict';

var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Assessee = new keystone.List( 'Assessee', {
  map : {
    name : 'id'
  }
} );

Assessee.add( {
  user : {
    type : Types.Relationship,
    ref : 'User',
    initial : true,
    required : true,
    index : true
  },
  assessment : { 
    type : Types.Relationship,
    ref : 'Assessment',
    initial : true,
    required : true,
    index : true
  },
  score : {
    type : Types.Number,
    default : 0,
    noedit: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    noedit : true
  }
} );
//Assessee.schema.plugin(require('mongoose-random')(), { path: '_r' });
Assessee.defaultColumns = 'name, user, assessment, score';
Assessee.register();


