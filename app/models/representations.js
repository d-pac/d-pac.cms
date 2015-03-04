"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var mime = require( "mime" );
var path = require( "path" );
var constants = require( "./helpers/constants" );

var Representation = new keystone.List( "Representation", {
  map   : {
    name : "name"
  },
  track : true
} );

Representation.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model   : "Representation",
  field   : "_rid",
  startAt : 1
} );

Representation.schema.virtual( "name" ).get( function(){
  return "Representation " + this._rid;
} ).depends = [ '_rid' ];

var config = {

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
    label   : "Compared with",
    index   : true,
    default : 0,
    noedit  : true
  },

  compared : {
    type   : Types.Relationship,
    ref    : "Representation",
    many   : true,
    noedit : true
  }

};

Representation.add( config );

//Representation.schema.methods.toSafeJSON = function(){
//  return _.pick( this, "_id", "url", "mimeType", "ext", "assessee", "assessment" );
//};

Representation.defaultColumns = "name, assessment, document, comparedNum";
Representation.register();
