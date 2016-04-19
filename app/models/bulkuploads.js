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
  nodelete: !keystone.get( 'dev env' )
} );

Bulkupload.defaultColumns = "name, comment, createdAt, createdBy";

Bulkupload.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Bulkupload",
  field: "_rid",
  startAt: 1
} );

var list = require( './helpers/setupList' )( Bulkupload )
  .add( {
    comment: {
      type: Types.Text,
      required: false,
      initial: true,
      label: "Note",
      note: "Short description of this bulkupload"
    },
    uploadType: {
      type: Types.Select,
      options: [
        {
          value: "representations",
          label: "Representations"
        },
        {
          value: "users",
          label: "Users"
        }
      ],
      default: "representations",
      initial: true
    },

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: true,
      initial: true,
      many: true
    },
    roles: {
      asAssessee: {
        type: Types.Boolean,
        label: "As assessee",
        default: false,
        initial: true,
        dependsOn: { uploadType: "users" }
      },
      asAssessor: {
        type: Types.Boolean,
        label: "As assessor",
        default: false,
        initial: true,
        dependsOn: { uploadType: "users" }
      },
      asPAM: {
        type: Types.Boolean,
        label: "As PAM",
        default: false,
        initial: true,
        dependsOn: { uploadType: "users" }
      },
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
      note: "Zipfiles can be really large, i.e. this could take a LOOOOOOONG time!",
      dependsOn: { uploadType: "representations" }
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
      label: "Conflict resolution",
      dependsOn: { uploadType: "representations" }
    },
    jsonfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      required: false,
      initial: false,
      allowedTypes: [ "application/json" ],
      note: "Optional. JSON file with representation data.",
      dependsOn: { uploadType: "representations" }
    },
    csvfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      label: "CSV File",
      required: false,
      initial: false,
      allowedTypes: [ "text/csv" ],
      note: "Format: &lt;first name&gt;;&lt;surname&gt;;&lt;e-mail&gt;[;&lt;password&gt;]</br>Password is optional",
      dependsOn: { uploadType: "users" }
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
