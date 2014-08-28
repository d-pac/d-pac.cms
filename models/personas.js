'use strict';

var _ = require( 'underscore' ),
    keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Persona = new keystone.List( 'Persona', {
  map : {
    name : 'id'
  },
  track: true
} );

Persona.add( {
  role       : {
    type     : Types.Select,
    options  : 'assessor, assessee',
    index    : true,
    required : true,
    initial  : true
  },
  user       : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true,
    collapse : true
  },
  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    index    : true,
    required : true,
    initial  : true,
    collaps  : true
  }
} );

/**
 * Registration
 */

Persona.defaultColumns = 'name, user, role, assessment';
Persona.register();
