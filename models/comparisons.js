'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var autoinc = require( './helpers/autoinc' );
var constants = require( './helpers/constants' );
var comparisonSteps = constants.comparisonSteps;

var Comparison = new keystone.List( 'Comparison', {
  map   : {
    name : 'id'
  },
  track : true
} );

var config = {

  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    many     : false, //C01
    initial  : true,
    required : true, //C01
    index    : true,
    filters  : {
      state : constants.publicationStates.published //C05
    }
  },

  assessor : {
    type     : Types.Relationship,
    ref      : 'User',
    many     : false, //C02
    index    : true,
    required : true, //C02
    initial  : true
  },

  comparativeFeedback : {
    type    : Types.Html,
    wysiwyg : true
  },

  timelogs : {
    type : Types.Relationship,
    ref  : 'Timelog',
    many : true //C04
  },

  state : {
    type    : Types.Select,
    options : comparisonSteps,
    initial : true
  },

  active : {
    type    : Types.Boolean,
    default : true,
    initial : true
  }

};

Comparison.add( config );

Comparison.schema.path( 'assessor' ).validate( function( value,
                                                         done ){
    //C02
    var filter = {
      user       : value,
      assessment : this.assessment,
      role       : constants.roles.assessor
    };
    var Persona = keystone.list( 'Persona' );
    Persona.model
      .find()
      .where( filter )
      .exec( function( err, personas ){
        done( personas && personas.length > 0 );
      } );
  }, "user must have assessor persona for selected assessment"
);

Comparison.relationship( {
  path    : 'judgements',
  ref     : 'Judgement',
  refPath : 'comparison',
  label   : 'Judgements'
} );

Comparison.schema.plugin( autoinc.plugin, { model : 'Comparison', field : '_rid' } );

var jsonFields = _.keys( config );

Comparison.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', '_rid', jsonFields );
    return model;
  }
} );

//Comparison.schema.plugin(require('mongoose-random')(), { path: '_r' });
Comparison.defaultColumns = 'name, assessor, assessment';
Comparison.register();



