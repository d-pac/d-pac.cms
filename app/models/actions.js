"use strict";

var _ = require( "lodash" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var Action = new keystone.List( "Action", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid',
  noedit: !keystone.get('dev env'),
  nodelete: !keystone.get('dev env')
} );

Action.defaultColumns = "name, line, actionType, success, createdAt";

Action.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Action",
  field: "_rid",
  startAt: 1
} );

var list = require( './helpers/setupList' )( Action )
  .add( {
    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: true,
      initial: true
    },

    actionType: {
      type: Types.Select,
      options: [
        {
          label: "Reset",
          value: "reset"
        },
        {
          label: "Clear",
          value: "clear"
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
      required: true,
      note: "<strong>Reset</strong>: comparisons removed, representations <em>not</em>.<br/>" +
      "<strong>Clear</strong>: comparisons removed, representations removed.<br/>" +
      "<strong>Delete</strong>: comparisons removed, representations removed, assessment removed<br/>" +
      "<strong>Archive</strong>: assessment archived, assessment DELETE"
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
