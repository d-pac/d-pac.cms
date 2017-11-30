"use strict";

/* too many functions stealthily bound to mongoose documents: */
/* eslint no-invalid-this: "off" */

const _ = require( "lodash" );
const keystone = require( "keystone" );
const Types = keystone.Field.Types;
const path = require( "path" );
const constants = require( "./helpers/constants" );

const allowedTypes = [ '.png', '.jpg', '.jpeg', '.gif', '.pdf', '.svg', '.mp4', '.mpeg', '.mp3' ];

function getAnon( item ){
  return "R" + item._rid;
}

const Document = new keystone.List( "Document", {
  track: true,
  autocreate: true
} );

Document.schema.methods.anon = function(){
  return getAnon( this );
};

Document.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Document",
  field: "_rid",
  startAt: 1
} );

Document.schema.pre( "save", function( callback ){
  if(!this.title){
    this.title = getAnon(this);
  }
  if( this.file.size > 0 ){
    this.name = path.basename( this.file.originalname, this.ext );
    if( allowedTypes.indexOf( this.ext ) < 0 ){
      callback( new Error( 'Incorrect file type' ) );
    }
  } else {
    //text-only document
    this.name = this.title;
  }

  callback();
} );

Document.defaultColumns = [ "name", "title", "anonymized", "owner", "href|40%", "ext" ];

require( './helpers/setupList' )( Document )
  .add(
    {
      name: {
        type: String,
        default: "Document name",
        noedit: true,
        note: "Not shown in tool. Purely for administrative purposes. " +
        "Uses the value of 'title' for text-only documents, or the original file name"
      },

      title: {
        type: Types.Text,
        required: false,
        initial: true,
        note: "The title as shown in the tool, both when comparing and in the results. If left blank an anonimized title will be generated"
      },

      owner: {
        type: Types.Relationship,
        ref: "User",
        index: true,
        many: true,
      },

    },
    "Content",
    {
      text: {
        type: Types.Html,
        wysiwyg: true,
        note: "The value of this field will be shown for all media types. " +
        "Leave the file and link fields empty to create text-only documents."
      },

      file: {
        type: Types.LocalFile,
        label: "Local file",
        dest: constants.directories.documents,
        prefix: "/media",
        note: `Allowed file types: ${allowedTypes.join( ', ' )}`
      }
    },
    "Actions",
    {
      representation: {
        type: Types.Boolean,
        default: false,
        label: "Create representation"
      },

      assessment: {
        type: Types.Relationship,
        ref: "Assessment",
        index: true,
        many: false,
        dependsOn: { representation: true },
        note: "When 'create representation' is checked a new representation will be created for this document. " +
        "To avoid accidental creation of multiple, unnecessary representations, " +
        "this field is unchecked automatically again after the representation is created."
      },

    } )
  .expose( "href", "mimeType", "ext" )
  .retain( "name", "file", "type", "links", "assessment", "representation" )
  .virtualize( {
    ext: {
      get: function(){
        return ( this.file.size > 0 )
          ? path.extname( this.file.originalname ).toLowerCase()
          : ".html";
      },
      depends: [ 'file' ]
    },
    href: {
      get: function(){
        return `${keystone.get( "root url" )}/media/${getAnon( this )}${this.ext}`;
      },
      depends: [ "file", "_rid" ]
    },
    mimeType: {
      get: function(){
        return this.file.filetype || 'text/html';
      },
      depends: [ "file" ]
    },
    anonymized: {
      get: function(){
        return getAnon( this );
      }
    },
    originalName: {
      get: function () {
        return this.file.originalname;
      },
      depends: ['file']
    }
  } )
  .emit("name")
  .relate( {
    path: "representations",
    ref: "Representation",
    refPath: "document",
    label: "Representations"
  } )
  .register();
