'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Role = new keystone.List( 'Role', {
  map     : { name : 'createdAt' }  
} );

Role.add( {
  type : {
    type     : Types.Select,
    options  : 'Assessor, Assessee',
    default  : 'Assessee',
    required : true
  },
  user : {
    type  : Types.Relationship,
    ref   : 'User',
    index : true
  },
  assessment : {
    type :  Types.Relationship,
    ref : 'Assessment',
    index : true
  },
  createdAt   : { type : Date, default : Date.now }
} );

Role.schema.virtual( 'isAssessor' ).get( function(){
  return 'Assessor' === this.name;
} );

Role.schema.virtual( 'isAssessee' ).get( function(){
  return 'Assessee' === this.name;
} );

Role.defaultColumns = 'type, user, assessment';
Role.register();