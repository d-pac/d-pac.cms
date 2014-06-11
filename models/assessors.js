'use strict';

var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Assessor = new keystone.List( 'Assessor', {
  map : {
    name : 'id'
  }
} );

Assessor.add( {
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
  createdAt: { 
    type: Date, 
    default: Date.now,
    noedit : true
  }
} );
//Assessor.schema.plugin(require('mongoose-random')(), { path: '_r' });
Assessor.defaultColumns = 'name, user, assessment';
Assessor.register();


