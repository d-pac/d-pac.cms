"use strict";

const _ = require( "lodash" );
const keystone = require( "keystone" );
const Types = keystone.Field.Types;
const mime = require( "mime" );
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
    title: 'mp3',
    mime: 'audio/mp3'
  },
];

const utils = {
  local: {
    href: function(){
      return keystone.get( "root url" ) + (this.file.href || '/images/nodocument.png');
    },
    mimeType: function(){
      return this.file.filetype;
    },
    ext: function(){
      return "." + mime.extension( this.file.filetype );
    },
    name: function(){
      return this.file.originalname;
    }
  },
  remote: {
    href: function(){
      return this.link;
    },
    mimeType: function(){
      return mime.lookup( this.link );
    },
    ext: function(){
      return path.extname( this.link );
    },
    name: function(){
      return path.basename( this.link );
    }
  }
};

function callUtil( obj,
                   prop ){
  const fn = _.get( utils, [ obj.host, prop ] );
  if( !fn ){
    return false;
  }
  return fn.call( obj );
}

const Document = new keystone.List( "Document", {
  track: true
} );

Document.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Document",
  field: "_rid",
  startAt: 1
} );

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
    name: {
      type: String,
      default: "Document name",
      noedit: true,
      required: true,
      note: "Not shown in tool. Purely for administrative purposes. " +
      "Uses the value of title, or is automatically generated"
    },

    title: {
      type: Types.Text,
      required: false,
      initial: true,
      note: "Leave blank for automatic title generation"
    },

    owner: {
      type: Types.Relationship,
      ref: "User",
      index: true,
      required: false,
      many: false, // R01
      initial: true
    },

    host: {
      noedit: true,
      type: String,
      watch: "link file text",
      note: "Value automatically generated based on the choice of document type below.",
      value: function(){
        if( 0 < this.file.size ){
          return "local";
        } else if( this.link ){
          return "remote";
        }
        return "none";
      }
    }
  }, "Document", {
    text: {
      type: Types.Html,
      required: false,
      initial: false,
      wysiwyg: true,
      note: "The value of this field will be shown for all media types. " +
      "Leave the file and link fields empty to create text-only documents."
    },

    file: {
      type: Types.LocalFile,
      label: "Local file",
      dest: constants.directories.documents,
      prefix: "/media",
      required: false,
      initial: false,
      allowedTypes: _.map(allowedTypes, 'mime'),
      note: `Allowed file types: ${_.map(allowedTypes, 'title' ).join(', ')}`
    },

    link: {
      type: Types.Url,
      label: "External file"
    },

    representation: {
      type: Types.Boolean,
      default: false,
      label: "Create representation"
    },

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      index: true,
      required: false,
      many: false,
      initial: false,
      dependsOn: { representation: true },
      note: "When 'create representation' is checked a new representation will be created for this document. " +
      "To avoid accidental creation of multiple, unnecessary representations, " +
      "this field is unchecked automatically again after the representation is created."
    },

  } )
  .expose( "href", "mimeType", "ext" )
  .retain( "track", "link", "host", "title", "name", "file", "_rid", "owner", "type", "links", "assessment", "representation" )
  .virtualize( {
    href: {
      get: function(){
        return callUtil( this, 'href' ) || "none";
      },
      depends: [ "file", "host", "link" ]
    },
    mimeType: {
      get: function(){
        return callUtil( this, 'mimeType' ) || 'text/html';
      },
      depends: [ "file", "host", "link" ]
    },
    ext: {
      get: function(){
        return callUtil( this, 'ext' ) || '.html';
      },
      depends: [ "file", "host", "link" ]
    }
  } )
  .validate( {
    link: [
      function( value,
                isValid ){
        if( !!value ){
          isValid( !this.file.size );
        } else if( !this.text ){
          isValid( !!this.file.size );
        } else {
          isValid( true );
        }
      }, "You need to supply a local file, an external link or a text."
    ]
  } )
  .relate( {
    path: "representations",
    ref: "Representation",
    refPath: "document",
    label: "Representations"
  } )
  .register();
