"use strict";

var _ = require( "lodash" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( './helpers/constants' );

var Bulkupload = new keystone.List( "Bulkupload", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid',
  nodelete: true
} );

Bulkupload.defaultColumns = "name, comment, createdAt, createdBy";

Bulkupload.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Bulkupload",
  field: "_rid",
  startAt: 1
} );

var list = require( './helpers/setupList' )( Bulkupload )
  .add( {
    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: true,
      initial: true
    },
    comment: {
      type: Types.Text,
      required: false,
      initial: true,
      label: "Note",
      note: "Short description of this bulkupload"
    },
    zipfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      required: false,
      initial: false,
      allowedTypes: [
        "application/zip", "application/x-zip-compressed", "application/zip-compressed", "multipart/x-zip",
        "application/octet-stream"
      ],
      note: "Zipfiles can be really large, i.e. this could take a LOOOOOOONG time!"
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
      required: true,
      note: "What needs to be done in case files with the same name already exist.",
      label: "Conflict resolution"
    },
    jsonfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      required: false,
      initial: false,
      allowedTypes: [ "application/json" ],
      note: "Optional. JSON file with representation data."
    },
    completed: {
      type: Boolean,
      default: false,
      hidden: true
    },

    result: {
      type: Types.Text,
      noedit: true,
      default: ''
    }
  } )
  .register();
