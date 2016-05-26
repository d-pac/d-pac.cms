"use strict";

var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var Action = new keystone.List( "Action", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid',
  noedit: !keystone.get( 'dev env' ),
  nodelete: !keystone.get( 'dev env' )
} );

Action.defaultColumns = "name, line, actionType, success, createdAt";

Action.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Action",
  field: "_rid",
  startAt: 1
} );

const confirmationNecessary = {
  "clone": false,
  "clone representations": false,
  "reset": true,
  "delete": true,
  "clear": true,
  "archive": true
};

require( './helpers/setupList' )( Action )
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
          label: "Clone",
          value: "clone"
        },
        {
          label: "Clone representations",
          value: "clone representations"
        },
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
      note: "<ul>" +
      "<li><strong>Clone</strong>: assessment cloned, representations cloned</li>" +
      "<li><strong>Clone representations</strong>: <em>only</em> representations cloned</li>" +
      "<li><strong>Reset</strong>: comparisons removed, representations <em>not</em>.</li>" +
      "<li><strong>Clear</strong>: comparisons removed, representations removed.</li>" +
      "<li><strong>Delete</strong>: comparisons removed, representations removed, assessment removed</li>" +
      "<li><strong>Archive</strong>: assessment archived, assessment DELETE</li>" +
      "</ul>"
    },

    targetAssessment: {
      type: Types.Relationship,
      label: "Receiving assessment",
      ref: "Assessment",
      required: false,
      initial: true,
      dependsOn: {
        actionType: 'clone representations'
      }
    },

    confirm: {
      type: Types.Boolean,
      default: false,
      initial: true,
      label: "Yes, I realize this will delete data in the database.",
      dependsOn: {
        actionType: [ 'reset', 'clear', 'delete', 'archive' ]
      }
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
  .validate( {
    confirm: [
      function( value ){
        if( confirmationNecessary[ this.actionType ] ){ //eslint-disable-line no-invalid-this
          return value;
        }

        return true;
      },
      "You must confirm!"
    ]
  } )
  .register();
