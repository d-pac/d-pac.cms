"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var mime = require( "mime" );
var path = require( "path" );
var constants = require( "./helpers/constants" );

var utils = {
  local  : {
    href     : function(){
      return process.env.ROOT_URL + this.file.href;
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
  remote : {
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
var Document = new keystone.List( "Document", {
  track : true
} );

Document.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model   : "Document",
  field   : "_rid",
  startAt : 1
} );

Document.schema.virtual( "href" ).get( function(){
  return utils[ this.host ].href.call( this );
} ).depends = [ "file", "host", "link" ];

Document.schema.virtual( "mimeType" ).get( function(){
  return utils[ this.host ].mimeType.call( this );
} ).depends = [ "file", "host", "link" ];

Document.schema.virtual( "ext" ).get( function(){
  return utils[ this.host ].ext.call( this );
} ).depends = [ "file", "host", "link" ];

Document.schema.pre( "save", function( callback ){
  if( this.title ){
    this.name = this.title;
  } else if( this.host ){
    this.name = utils[ this.host ].name.call( this );
  }
  callback();
} );

Document.defaultColumns = [ "name", "owner", "href|40%", "mimeType" ];

require( './helpers/setupList' )( Document )
  .add( {
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

    host : {
      hidden : true,
      type   : String,
      watch  : "link file",
      value  : function(){
        if( 0 < this.file.size ){
          return "local";
        }
        return "remote";
      }
    }
  }, "File", {
    file : {
      type     : Types.LocalFile,
      label    : "Local file",
      dest     : "app/public/uploads",
      prefix   : "/uploads",
      required : false,
      initial  : false
    },

    link : {
      type  : Types.Url,
      label : "External file"
    }
  } )
  .expose( "href", "mimeType", "ext" )
  .retain("track", "link", "host", "title", "name", "file", "_id", "_rid", "owner", "type", "links")
  .validate( {
    link : [
      function( value,
                isValid ){
        if( !!value ){
          isValid( !this.file.size );
        } else {
          isValid( !!this.file.size );
        }
      }, "You need to supply either a local file OR an external link."
    ]
  } )
  .relate( {
    path    : "representations",
    ref     : "Representation",
    refPath : "document",
    label   : "Representations"
  } )
  .register();
