'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var constants = require( './helpers/constants' );

var Persona = new keystone.List( 'Persona', {
  map   : {
    name : 'id'
  },
  track : true
} );

var config = {

  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    index    : true,
    required : true, //P03
    many     : false, //P03
    initial  : true,
    collapse : true
  },

  user : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true, //P01
    many     : false, //P01
    initial  : true,
    collapse : true
  },

  role : {
    type     : Types.Select, //P02
    options  : constants.roles.list.toString(),
    index    : true,
    required : true,
    initial  : true
  }

};

Persona.add( config );

Persona.schema.path( 'user' ).validate( function( value,
                                                  done ){
    var current = this;
    //U01 //P05
    var filter = {
      user       : value,
      assessment : this.assessment
    };
    Persona.model
      .find()
      .where( filter )
      .where( '_id' ).ne( current.id )
      .exec( function( err,
                       personas ){
        done( !personas || personas.length <= 0 );
      } );
  }, "A user is not allowed to have more than one persona for an assessment."
);


/**
 * Registration
 */

Persona.defaultColumns = 'name, user, role, assessment';
Persona.register();
