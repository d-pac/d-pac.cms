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

  role : {
    type     : Types.Select, //P02
    options  : constants.roles.list.toString(),
    index    : true,
    required : true,
    initial  : true
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

  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    index    : true,
    required : true, //P03
    many     : false, //P03
    initial  : true,
    collapse : true,
    filters  : {
      state : constants.publicationStates.published //P04
    }
  }

};

Persona.add( config );

var jsonFields = _.keys( config );

Persona.schema.set( 'toJSON', {
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

Persona.defaultColumns = 'name, user, role, assessment';
Persona.register();
