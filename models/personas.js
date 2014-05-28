'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Persona = new keystone.List( 'Persona', {
  map     : { name : 'createdAt' }  
} );

Persona.add( {
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

Persona.schema.virtual( 'isAssessor' ).get( function(){
  return 'Assessor' === this.name;
} );

Persona.schema.virtual( 'isAssessee' ).get( function(){
  return 'Assessee' === this.name;
} );

Persona.defaultColumns = 'type, user, assessment';
Persona.register();