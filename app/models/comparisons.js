"use strict";
var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var constants = require( "./helpers/constants" );
var Assessment = keystone.list( "Assessment" );

var Comparison = new keystone.List( "Comparison", {
  map   : {
    name : "_rid"
  },
  track : true
} );

Comparison.api = {
  editable : [ "selected", "phase", "timelogs", "comparativeFeedback", "completed" ]
};

var config = {

  assessment : {
    type     : Types.Relationship,
    ref      : "Assessment",
    many     : false, // C01
    initial  : true,
    required : false, // C01
    index    : true
  },

  // todo: filter on, dependsOn assessment
  assessor   : {
    type     : Types.Relationship,
    ref      : "User",
    many     : false, // C02
    index    : true,
    required : false, // C02
    initial  : true
  },

  phase : {
    type    : Types.Relationship,
    ref     : "Phase",
    index   : true,
    initial : true
  },

  representations : {
    a : {
      type    : Types.Relationship,
      ref     : "Representation",
      initial : false
    },
    b : {
      type    : Types.Relationship,
      ref     : "Representation",
      initial : false
    }
  },

  completed : {
    type    : Types.Boolean,
    default : false,
    initial : false
  }

};

Comparison.add( config );

//Comparison.schema.path( "assessment" )
//  .validate( function( value,
//                       done ){
//    // C05
//    Assessment.model
//      .findById( value )
//      .lean()
//      .exec()
//      .then( function( assessment ){
//        done( assessment && assessment.state === constants.publicationStates.published );
//      } );
//  }, "Assessment must be published." );

//Comparison.schema.path( "assessor" )
//  .validate( function( value,
//                       done ){
//    // U04 // C06
//    var filter = {
//      user       : value,
//      assessment : this.assessment,
//      role       : constants.roles.assessor
//    };
//    var Persona = keystone.list( "Persona" );
//    Persona.model
//      .find()
//      .where( filter )
//      .exec( function( err,
//                       personas ){
//        done( personas && 0 < personas.length );
//      } );
//  }, "User must have assessor persona for selected assessment." );

//Comparison.schema.path( "assessor" )
//  .validate( function( value,
//                       done ){
//    // U06 // C07
//    var current = this;
//    var filter = {
//      assessor  : current.assessor,
//      completed : false
//    };
//    Comparison.model
//      .find()
//      .where( filter )
//      .where( "_id" ).ne( current.id )
//      .exec( function( err,
//                       comparisons ){
//        done( !comparisons || 0 >= comparisons.length );
//      } );
//  }, "User may not have another active comparison." );

//Comparison.schema.path( "phase" )
//  .validate( function( phase,
//                       done ){
//    // C08
//    var current = this;
//
//    if( phase ){
//      var Assessment = keystone.list( "Assessment" );
//      Assessment.model
//        .findOne( {
//          _id    : current.assessment,
//          phases : phase
//        } )
//        .exec( function( err,
//                         assessment ){
//          done( !!assessment );
//        } );
//    } else {
//      done( true );
//    }
//  }, "Phase must be included in workflow of Assessment." );

Comparison.schema.virtual( "active" ).get( function(){
  return !this.completed;
} );

Comparison.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model   : "Comparison",
  field   : "_rid",
  startAt : 1
} );

Comparison.defaultColumns = "name, assessor, assessment, selected, phase, completed";
Comparison.register();
