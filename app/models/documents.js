"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var mime = require( "mime" );
var path = require( "path" );
var constants = require( "./helpers/constants" );

var Document = new keystone.List( "Document", {
  map   : {
    name : "name"
  },
  track : true
} );

Document.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model   : "Document",
  field   : "_rid",
  startAt : 1
} );

Document.schema.virtual( "name" ).get( function(){
  return ( this.file && this.file.originalname )
    ? this.file.originalname
    : this.id;
} ).depends = [ 'file', '_rid' ];

var config = {
  file : {
    type     : Types.LocalFile,
    dest     : "app/public/uploads",
    prefix   : "/uploads",
    required : true,
    initial  : false,
    filename : function( doc,
                         file ){
      return [
        path.basename( file.originalname, '.' + file.extension ),
        '-',
        Date.now().toString(),
        '.',
        file.extension
      ].join( '' );
    }
  },

  owner : {
    type     : Types.Relationship,
    ref      : "User",
    index    : true,
    required : true, // R01
    many     : false, // R01
    initial  : true
  }
};

Document.add( config );

//Document.schema.path( "assessee" )
//  .validate( function( value,
//                       done ){
//    // U02 // R04
//    var filter = {
//      user       : value,
//      assessment : this.assessment,
//      role       : constants.roles.assessee
//    };
//    var Persona = keystone.list( "Persona" );
//    Persona.model
//      .find()
//      .where( filter )
//      .exec( function( err,
//                       personas ){
//        done( personas && 0 < personas.length );
//      } );
//  }, "User must have `Assessee` Persona for selected Assessment" );

Document.schema.virtual( "url" ).get( function(){
  if( this.ext ){
    return "/documents/" + this._id + this.ext;
  }

  return undefined;
} ).depends = [ "_id", "ext" ];

Document.schema.virtual( "mimeType" ).get( function(){
  return this.file.filetype;
} ).depends = [ "file" ];

Document.schema.virtual( "ext" ).get( function(){
  if( this.file && this.file.filetype ){
    return "." + mime.extension( this.file.filetype );
  }

  return undefined;
} ).depends = [ "file" ];

Document.schema.virtual( "fileUrl" ).get( function(){
  if( this.file && this.file.filename ){
    return path.join( config.file.prefix, this.file.filename );
  }

  return undefined;
} ).depends = [ "file" ];

//Document.schema.methods.toSafeJSON = function(){
//  return _.pick( this, "_id", "url", "mimeType", "ext", "assessee", "assessment" );
//};
//

Document.defaultColumns = [ "name", "owner", "url|40%", "mimeType" ];
Document.register();
