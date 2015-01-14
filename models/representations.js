"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var mime = require( "mime" );
var path = require( "path" );
var constants = require( "./helpers/constants" );

var Representation = new keystone.List( "Representation", {
  map   : {
    name : "id"
  },
  track : true
} );

var config = {

  file : {
    type     : Types.LocalFile,
    dest     : "public/uploads",
    prefix   : "/uploads",
    required : true,
    initial  : false
  },

  assessee : {
    type     : Types.Relationship,
    ref      : "User",
    index    : true,
    required : true, // R01
    many     : false, // R01
    initial  : true
  },

  assessment  : {
    type     : Types.Relationship,
    ref      : "Assessment",
    initial  : true,
    required : true, // R02
    many     : false, // R02
    index    : true
  },

  // let"s cache the number of comparisons this representation is used in,
  // it"s NOT the same as using `compared.length` since `compared` has unique values only
  // which means that if two representations have been compared with each other already
  // this will not show up -> leads to uneven distribution
  comparedNum : {
    type    : Types.Number,
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

Representation.schema.path( "assessee" )
  .validate( function( value,
                       done ){
    // U02 // R04
    var filter = {
      user       : value,
      assessment : this.assessment,
      role       : constants.roles.assessee
    };
    var Persona = keystone.list( "Persona" );
    Persona.model
      .find()
      .where( filter )
      .exec( function( err,
                       personas ){
        done( personas && 0 < personas.length );
      } );
  }, "User must have `Assessee` Persona for selected Assessment" );

Representation.schema.virtual( "url" ).get( function(){
  return "/representations/" + this._id + this.ext;
} );

Representation.schema.virtual( "mimeType" ).get( function(){
  return this.file.filetype;
} );

Representation.schema.virtual( "ext" ).get( function(){
  return "." + mime.extension( this.file.filetype );
} );

Representation.schema.virtual( "fileUrl" ).get( function(){
  return path.join( config.file.prefix, this.file.filename );
} );

Representation.schema.methods.toSafeJSON = function(){
  return _.pick( this, "_id", "url", "mimeType", "ext", "assessee", "assessment" );
};

Representation.defaultColumns = "name, assessee, assessment";
Representation.register();
