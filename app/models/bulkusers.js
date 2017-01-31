"use strict";

const keystone = require( "keystone" );
const Types = keystone.Field.Types;
const constants = require( './helpers/constants' );

const Bulkuser = new keystone.List( "Bulkuser", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid',
  nodelete: !keystone.get( 'dev env' ),
  autocreate: true,
  plural: "Bulk Users",
  singular: "Bulk User",
  label: "Bulk Users",
} );

Bulkuser.defaultColumns = "name, title, createdAt, createdBy, completed";

Bulkuser.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Bulkuser",
  field: "_rid",
  startAt: 1,
} );

require( './helpers/setupList' )( Bulkuser )
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
      many: true
    },
    roles: {
      asAssessee: {
        type: Types.Boolean,
        label: "As assessee",
        default: false,
      },
      asAssessor: {
        type: Types.Boolean,
        label: "As assessor",
        default: false,
      },
      asPAM: {
        type: Types.Boolean,
        label: "As PAM",
        default: false,
      },
    },
    csvfile: {
      type: Types.LocalFile,
      dest: constants.directories.bulk,
      label: "CSV File",
      allowedTypes: [ "text/csv", "application/vnd.ms-excel" ],
      note: "Format: &lt;first name&gt;;&lt;surname&gt;;&lt;e-mail&gt;[;&lt;password&gt;]</br>Password is optional",
    },
    sendInvites: {
      type: Boolean,
      default: false,
      label: "Send invites (immediately)",
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
      noedit: true,
    }
  } )
  .register();
