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

var config = {
  name : {
    type     : String,
    default  : "Representation name",
    noedit   : true,
    watch    : "assessment document",
    value    : function( done ){
      if( this.assessment && this.document ){
        P.join( assessmentsService.retrieve( {
          _id : this.assessment
        } ), documentsService.retrieve( {
          _id : this.document
        } ), function( assessment,
                       document ){
          done( assessmentsService.getName( assessment ) + " - " + documentsService.getName( document ) );
        } );
        return {
          async : true
        };
      }

      return "Empty representation ";
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

  document    : {
    type     : Types.Relationship,
    ref      : "Document",
    initial  : true,
    required : true,
    many     : false,
    index    : true
  },

  // let"s cache the number of comparisons this representation is used in,
  // it"s NOT the same as using `compared.length` since `compared` has unique values only
  // which means that if two representations have been compared with each other already
  // this will not show up -> leads to uneven distribution
  comparedNum : {
    type    : Types.Number,
    label   : "Times compared",
    index   : true,
    default : 0,
    noedit  : true
  },

  compared : {
    type   : Types.Relationship,
    ref    : "Representation",
    many   : true,
    noedit : true
  },

  scale : {
    type    : Types.Number,
    default : null //yes, we _really_ do want `null` here, since this is a two-state field, either with or without a value
  },

  benchmark : {
    type    : Types.Boolean,
    default : false
  }

};

Representation.add( config );

//Representation.schema.methods.toSafeJSON = function(){
//  return _.pick( this, "_id", "url", "mimeType", "ext", "assessee", "assessment" );
//};

Representation.defaultColumns = "name, comparedNum";
Representation.register();
