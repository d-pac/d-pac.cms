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
  label: "Removals",
  singular: "Removal",
  plural: "Removals"
} );

Deletion.defaultColumns = "name, result, createdAt";

Deletion.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Deletion",
  field: "_rid",
  startAt: 1
} );

var list = require( './helpers/setupList' )( Deletion )
  .add( {
    subject: {
      type: Types.Select,
      options: [
        {
          label: "Assessment",
          value: "10"
        }
      //{
      //  label: "Comparison",
      //  value: 20
      //}
      ],
      initial: true,
      required: true,
      label: "Data type"
    },

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: false,
      initial: true,
      note: "Will delete/reset this assessment and its representations.<br/>" +
      "Comparisons and timelogs will always be deleted.",
      dependsOn: {
        subject: "10"
      }
    },

    comparison: {
      type: Types.Relationship,
      ref: "Comparison",
      required: false,
      initial: true,
      note: "Will delete this comparison and adjust representation data",
      dependsOn: {
        subject: "20"
      }
    },

    removalType: {
      type: Types.Select,
      options: [
        {
          label: "Reset",
          value: "1"
        },
        {
          label: "Delete",
          value: "2"
        }
      ],
      label: "Action",
      initial: true,
      required: true
    },

    confirm: {
      type: Types.Boolean,
      default: false,
      initial: true,
      label: "Yes, I realize this will delete data in the database."
    },

    result: {
      type: Types.Text,
      noedit: true,
      default: ''
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
