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
  label: "Delete"
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
          value: "assessment"
        }
        //{
        //  label: "Comparison",
        //  value: "comparison"
        //}
      ],
      initial: true,
      required: true
    },

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: false,
      initial: true,
      note: "Will delete this assessment and all depending data: comparisons, representations and timelogs",
      dependsOn: {
        subject: "assessment"
      }
    },

    comparison: {
      type: Types.Relationship,
      ref: "Comparison",
      required: false,
      initial: true,
      note: "Will delete this comparison and adjust representation data",
      dependsOn: {
        subject: "comparison"
      }
    },

    result: {
      type: Types.Text,
      noedit: true,
      default: ''
    }
  } )
  .register();
