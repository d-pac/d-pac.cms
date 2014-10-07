'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var autoinc = require( './helpers/autoinc' );
var constants = require( './helpers/constants' );
var Assessment = keystone.list( 'Assessment' );

var Comparison = new keystone.List( 'Comparison', {
  map   : {
    name : '_rid'
  },
  track : true
} );

Comparison.api = {
  editable : ["selected", "phase", "timelogs", "comparativeFeedback"]
};

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

  phase : {
    type    : Types.Relationship,
    ref     : 'Phase',
    index   : true,
    initial : true
  },

  selected : {
    type  : Types.Relationship,
    ref   : 'Representation',
    index : true
  }

};

Comparison.add( config );

Comparison.schema.path( 'assessment' )
  .validate( function( value,
                       done ){
    //C05
    Assessment.model
      .findById( value )
      .lean()
      .exec()
      .then( function( assessment ){
        done( assessment && assessment.state === constants.publicationStates.published );
      } );
  }, "Assessment must be published." );

Comparison.schema.path( 'assessor' )
  .validate( function( value,
                       done ){
    //U04 //C06
    var filter = {
      user       : value,
      assessment : this.assessment,
      role       : constants.roles.assessor
    };
    var Persona = keystone.list( 'Persona' );
    Persona.model
      .find()
      .where( filter )
      .exec( function( err,
                       personas ){
        done( personas && personas.length > 0 );
      } );
  }, "User must have assessor persona for selected assessment." );

Comparison.schema.path( 'phase' )
  .validate( function( phase,
                       done ){
    //U06 //C07
    var current = this;
    if( phase ){
      var filter = {
        assessor : current.assessor
      };
      Comparison.model
        .find()
        .where( filter )
        .where( 'phase' ).ne( null )
        .where( '_id' ).ne( current.id )
        .exec( function( err,
                         comparisons ){
          done( !comparisons || comparisons.length <= 0 );
        } );
    }else{
      done( true );
    }
  }, "User may not have another active comparison." )
  .validate( function( phase,
                       done ){
    //C08
    var current = this;
    if( phase ){
      var Assessment = keystone.list( 'Assessment' );
      Assessment.model
        .findOne( {
          "_id"    : current.assessment,
          "phases" : phase
        } )
        .exec( function( err,
                         assessment ){
          done( !!assessment );
        } );
    }else{
      done( true );
    }
  }, "Phase must be included in workflow of Assessment." );

Comparison.schema.virtual( 'active' ).get( function(){
  return !!this.phase;
} );

Comparison.relationship( {
  path    : 'judgements',
  ref     : 'Judgement',
  refPath : 'comparison',
  label   : 'Judgements'
} );

Comparison.schema.plugin( autoinc.plugin, {
  model   : 'Comparison',
  field   : '_rid',
  startAt : 1
} );

Comparison.defaultColumns = 'name, assessor, assessment, selected, phase, active';
Comparison.register();



