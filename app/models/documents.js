"use strict";

/* too many functions stealthily bound to mongoose documents: */
/* eslint no-invalid-this: "off" */

const _ = require( "lodash" );
const keystone = require( "keystone" );
const Types = keystone.Field.Types;
const path = require( "path" );
const constants = require( "./helpers/constants" );


const allowedTypes = [
  {
    title: 'png',
    mime: 'image/png'
  },
  {
    title: 'jpg',
    mime: 'image/jpeg'
  },
  {
    title: 'gif',
    mime: 'image/gif'
  },
  {
    title: 'pdf',
    mime: 'application/pdf'
  },
  {
    title: 'svg',
    mime: 'image/svg+xml'
  },
  {
    title: 'mp4 (video)',
    mime: 'video/mp4'
  },
  {
    title: 'mp4 (audio)',
    mime: 'audio/mp4'
  },
  {
    title: 'mpeg (audio)',
    mime: 'audio/mpeg'
  },
  {
    title: 'mp3',
    mime: 'audio/mp3'
  },
];

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
  if( this.file.size > 0 ){
    this.name = path.basename( this.file.originalname, this.ext );
  } else {
    //text-only document
    this.name = this.title;
  }

  callback();
} );

Document.defaultColumns = [ "name", "title", "owner", "href|40%", "ext" ];

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
        allowedTypes: _.map( allowedTypes, 'mime' ),
        note: `Allowed file types: ${_.map( allowedTypes, 'title' ).join( ', ' )}`
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
        return ( this.file.size > 0 ) ? path.extname( this.file.originalname ) : ".html";
      },
      depends: ['file']
    },
    href: {
      get: function(){
        return `${keystone.get( "root url" )}/media/${getAnon(this)}${this.ext}`;
      },
      depends: [ "file", "_rid" ]
    },
    mimeType: {
      get: function(){
        return this.file.filetype || 'text/html';
      },
      depends: [ "file" ]
    },
    title: {
      get: function(){
        return getAnon(this);
      }
    }
  } )
  .validate( {
    "file.filetype": [
      function( value,
                isValid ){
        let found = true;
        if( value ){
          found = _.find( allowedTypes, ( item )=>{
            return item.mime === value;
          } );
        }
        isValid( !!found );
      }, "Incorrect file type"
    ]
  } )
  .relate( {
    path: "representations",
    ref: "Representation",
    refPath: "document",
    label: "Representations"
  } )
  .register();
