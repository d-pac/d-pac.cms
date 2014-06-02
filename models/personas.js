'use strict';

var _ = require( 'underscore' ),
    keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Persona = new keystone.List( 'Persona' );

Persona.add( {
  type       : {
    type     : Types.Select,
    options  : 'Assessor, Assessee',
    default  : 'Assessee',
    required : true
  },
  user       : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true
  },
  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    index    : true,
    required : true,
    initial  : true
  },
  createdAt  : { type : Date, default : Date.now }
} );

Persona.schema.virtual( 'isAssessor' ).get( function(){
  return 'Assessor' === this.type;
} );

Persona.schema.virtual( 'isAssessee' ).get( function(){
  return 'Assessee' === this.type;
} );

Persona.schema.pre( 'save', function( next ){
  Persona.model.find()
      .where( 'assessment', this.assessment )
      .where( 'user', this.user )
      .exec( function( err,
                       personas ){
        if( personas && personas.length > 0 ){
          return next( new Error('A user is only allowed to have one persona per assessment') );
        }
        return next();
      } );
} );

Persona.defaultColumns = 'type, user, assessment';
Persona.register();