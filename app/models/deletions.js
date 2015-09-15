"use strict";

var _ = require( "lodash" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var Deletion = new keystone.List( "Deletion", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid',
  noedit: true,
  label: "Assessment Actions",
  singular: "Assessment Action",
  plural: "Assessment Actions"
} );

Deletion.defaultColumns = "name, line, removalType, success, createdAt";

Deletion.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Deletion",
  field: "_rid",
  startAt: 1
} );

var list = require( './helpers/setupList' )( Deletion )
  .add( {
    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: true,
      initial: true,
      note: "Will delete/reset this assessment and its representations.<br/>" +
      "Comparisons and timelogs will always be deleted."
    },

    removalType: {
      type: Types.Select,
      options: [
        {
          label: "Reset",
          value: "reset"
        },
        {
          label: "Delete",
          value: "delete"
        },
        {
          label: "Archive",
          value: "archive"
        }
      ],
      label: "Action Type",
      initial: true,
      required: true
    },

    confirm: {
      type: Types.Boolean,
      default: false,
      initial: true,
      label: "Yes, I realize this will delete data in the database."
    },

    line: {
      type: Types.Text,
      noedit: true,
      default: ''
    },

    log: {
      type: Types.Html,
      wysiwyg: true,
      noedit: true,
      default: ''
    },

    success: {
      type: Boolean,
      default: false
    }
  } )
  .validate({
    confirm: [
      function(value){
        return value;
      },
      "You must confirm!"
    ]
  })
  .register();
