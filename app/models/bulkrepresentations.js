"use strict";

const keystone = require( "keystone" );
const Types = keystone.Field.Types;
const constants = require( './helpers/constants' );

const Bulkrepresentation = new keystone.List( "Bulkrepresentation", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid',
  nodelete: !keystone.get( 'dev env' ),
  autocreate: true,
  plural: "Bulk Representations",
  singular: "Bulk Representation",
  label: "Bulk Representations",
} );

Bulkrepresentation.defaultColumns = "name, title, createdAt, createdBy, completed";

Bulkrepresentation.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Bulkrepresentation",
  field: "_rid",
  startAt: 1
} );

require( './helpers/setupList' )( Bulkrepresentation )
  .add( {
    title: {
      type: Types.Text,
      default:'',
      label: "Title",
      note: "For administrative use only",
    },

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      many: true,
    },

    bulktype: {
      type: Types.Select,
      options: [
        {
          value: "files",
          label: "Files"
        },
        {
          value: "texts",
          label: "Texts"
        }
      ],
      default: "files",
    },

    texts: {
      type: Types.TextArray,
      label: 'Text-only representations',
      dependsOn: {bulktype: 'texts'},
      default: []
    },
    zipfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      allowedTypes: [
        "application/zip", "application/x-zip-compressed", "application/zip-compressed", "multipart/x-zip",
        "application/octet-stream"
      ],
      note: "Zipfiles can be really large, i.e. this could take a LOOOOOOONG time!",
      dependsOn: { bulktype: "files" }
    },
    conflicts: {
      type: Types.Select,
      options: [
        {
          label: "Use new file",
          value: constants.OVERWRITE
        }, {
          label: "Use existing file",
          value: constants.REUSE
        }, {
          label: "Rename new file",
          value: constants.RENAME
        }
      ],
      default: constants.REUSE,
      note: "What needs to be done in case files with the same name already exist.",
      label: "Conflict resolution",
      dependsOn: { bulktype: "files" }
    },
    jsonfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      allowedTypes: [ "application/json", "application/octet-stream" ],
      note: "Optional. JSON file with representation data.",
      dependsOn: { bulktype: "files" }
    },
    log: {
      type: Types.Html,
      wysiwyg: true,
      noedit: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false,
      noedit: true
    }
  } )
  .register();
