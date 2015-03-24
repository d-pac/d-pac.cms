"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var mime = require( "mime" );
var path = require( "path" );
var constants = require( "./helpers/constants" );

var Document = new keystone.List( "Document", {
  track : true
} );

Document.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model   : "Document",
  field   : "_rid",
  startAt : 1
} );

var utils = {
  file : {
    href     : function(){
      return this.file.href;
    },
    mimeType : function(){
      return this.file.filetype;
    },
    ext      : function(){
      return "." + mime.extension( this.file.filetype );
    },
    name     : function(){
      return this.file.originalname;
    }
  },
  link : {
    href     : function(){
      return this.link;
    },
    mimeType : function(){
      return mime.lookup( this.link );
    },
    ext      : function(){
      return path.extname( this.link );
    },
    name     : function(){
      return path.basename( this.link );
    }
  }
};

var config = {
  name : {
    type     : String,
    default  : "Document name",
    noedit   : true,
    required : true,
    note     : "uses the value of title, or is automatically generated"
  },

  title : {
    type     : Types.Text,
    required : false,
    initial  : true
  },

  owner : {
    type     : Types.Relationship,
    ref      : "User",
    index    : true,
    required : true, // R01
    many     : false, // R01
    initial  : true
  },

  type : {
    hidden : true,
    type   : String,
    watch  : "link file",
    value  : function(){
      if( 0 < this.file.size ){
        return "file";
      }
      return "link";
    }
  }
};

Document.add( config, "File", {
  file : {
    type     : Types.LocalFile,
    label    : "Local file",
    dest     : "app/public/uploads",
    prefix   : "/uploads",
    required : false,
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

  link : {
    type  : Types.Url,
    label : "External file"
  }
} );

Document.schema.path( "link" )
  .validate( function( value,
                       isValid ){
    if( !!value ){
      isValid( !this.file.size );
    } else {
      isValid( !!this.file.size );
    }
  }, "You need to supply either a local file OR an external link." );

Document.schema.virtual( "href" ).get( function(){
  return utils[ this.type ].href.call( this );
} ).depends = [ "file", "type", "link" ];

Document.schema.virtual( "mimeType" ).get( function(){
  return utils[ this.type ].mimeType.call( this );
} ).depends = [ "file", "type", "link" ];

Document.schema.virtual( "ext" ).get( function(){
  return utils[ this.type ].ext.call( this );
} ).depends = [ "file", "type", "link" ];

Document.schema.pre( "save", function( callback ){
  if( this.title ){
    this.name = this.title;
  } else if( this.type ){
    this.name = utils[ this.type ].name.call( this );
  }
  callback();
} );
//Document.schema.methods.toSafeJSON = function(){
//  return _.pick( this, "_id", "url", "mimeType", "ext", "assessee", "assessment" );
//};
//

Document.relationship( {
  path    : "representations",
  ref     : "Representation",
  refPath : "document",
  label   : "Representations"
} );

Document.defaultColumns = [ "name", "owner", "href|40%", "mimeType" ];
Document.register();
