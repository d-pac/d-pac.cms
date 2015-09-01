"use strict";

var _ = require( "lodash" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require('./helpers/constants');

var Bulkupload = new keystone.List( "Bulkupload", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid'
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
      required: true,
      initial: true,
      label: "Note",
      note: "Short description of this bulkupload"
    },
    zipfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      required: false,
      initial: false,
      allowedTypes: [ "application/zip" ],
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
    completed: {
      type: Boolean,
      default: false,
      noedit: true
    }
  } )
  .register();
