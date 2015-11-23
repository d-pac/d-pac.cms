"use strict";

var _ = require( "lodash" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var Report = new keystone.List( "Report", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid',
  noedit: !keystone.get('dev env')
} );

Report.defaultColumns = "name, assessment, url|50%, createdAt, createdBy";

Report.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Report",
  field: "_rid",
  startAt: 1
} );

var list = require( './helpers/setupList' )( Report )
  .add( {
    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: false,
      initial: true,
      note: "Leave blank to select all"
    },

    datatype: {
      type: Types.Select,
      options: [
        {
          label: "Representations",
          value: "representations"
        },
        {
          label: "Comparisons",
          value: "comparisons"
        }
      ],
      require: true,
      initial: true,
      default: 'comparisons'
    },

    format: {
      type: Types.Select,
      options: [
        {
          label: "JSON",
          value: "json"
        },
        {
          label: "CSV",
          value: "csv"
        }
      ],
      require: true,
      initial: true,
      default: 'csv'
    },

    filename: {
      type: String,
      required: true,
      initial: true,
      default: '{{assessment}}-{{datatype}}-{{time}}.{{ext}}',
      note: 'Use tokens to generate a dynamic name, as by default, ' +
      'or simply provide a string which will be used as the filename ' +
      '(in that case, don\'t forget to provide an extension!)'
    },

    url: {
      type: Types.Url,
      noedit: true
    },
    result: {
      type: Types.Html,
      wysiwyg: true,
      noedit: true,
      default: ''
    }
  } )
  .register();
