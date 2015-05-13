"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var mime = require( "mime" );
var path = require( "path" );
var constants = require( "./helpers/constants" );
var P = require( "bluebird" );

var assessmentsService = require( "../services/assessments" );
var documentsService = require( "../services/documents" );

var Representation = new keystone.List( "Representation", {
  track : true
} );
Representation.defaultColumns = "name, comparedNum";

Representation.schema.methods.compareWith = function( other ){
    this.compared.push( other._id );
    other.compared.push( this._id );
};

require( './helpers/setupList' )( Representation )
  .add( {
    name : {
      type     : String,
      default  : "Representation name",
      noedit   : true,
      watch    : "assessment document",
      value    : function( callback ){
        if( this.assessment && this.document ){
          P.join( assessmentsService.retrieve( {
            _id : this.assessment
          } ), documentsService.retrieve( {
            _id : this.document
          } ), function( assessment,
                         document ){
            callback( null, assessmentsService.getName( assessment ) + " - " + documentsService.getName( document ) );
          } ).catch( function( err ){
            callback( err );
          } );
        } else {
          callback( null, "Empty representation" );
        }
      },
      required : false,
      note     : "is automatically generated"
    },

    assessment : {
      type     : Types.Relationship,
      ref      : "Assessment",
      initial  : true,
      required : true, // R02
      many     : false, // R02
      index    : true
    },

    document : {
      type     : Types.Relationship,
      ref      : "Document",
      initial  : true,
      required : true,
      many     : false,
      index    : true
    },

    compared : {
      type   : Types.Relationship,
      ref    : "Representation",
      many   : true,
      noedit : true
    },

    ability : {
      value : {
        type    : Types.Number,
        default : null //yes, we _really_ do want `null` here, since this is a two-state field, either with or without a value
      },
      se    : {
        type    : Types.Number,
        default : null //yes, we _really_ do want `null` here, since this is a two-state field, either with or without a value
      }
    },

    rankType : {
      type    : Types.Select,
      options : constants.representationTypes.list.toString(),
      default : constants.TO_RANK,
      index   : true
    },

    closeTo : {
      label : "Witin range of benchmark",
      type  : Types.Relationship,
      ref   : "Representation",
      many  : false
    }

  } )
  .retain("track")
  .relate( {
    path    : "comparisons",
    ref     : "Comparison",
    refPath : "representations",
    label   : "Comparisons"
  } )
  .register();
