"use strict";
var _ = require( "lodash" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var constants = require( "./helpers/constants" );
var Assessment = keystone.list( "Assessment" );

var format = "DD/MM/YYYY HH:mm:ss";

var Comparison = new keystone.List( "Comparison", {
  map: {
    name: "_rid"
  },
  track: true,
  nocreate: !keystone.get( 'dev env' ),
  noedit: !keystone.get( 'dev env' ),
  schema: {
    minimize: false
  }
} );

Comparison.api = {
  creatable: [ "assessment", 'assessor' ],
  editable: [ 'phase', 'data', 'completed' ]
};

var data = {};

_.forEach( constants.phases, function( phase ){
  data[ phase.slug ] = phase.field;
} );

Comparison.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Comparison",
  field: "_rid",
  startAt: 1
} );

Comparison.schema.plugin( require( "mongoose-deep-populate" )( keystone.mongoose ) );

Comparison.defaultColumns = "name, assessor, assessment, selected, phase, completed";
require( './helpers/setupList' )( Comparison )
  .add( "Connections", {

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      many: false, // C01
      initial: true,
      required: false, // C01
      index: true
    },

    // todo: filter on, dependsOn assessment
    assessor: {
      type: Types.Relationship,
      ref: "User",
      many: false, // C02
      index: true,
      required: false, // C02
      initial: true
    },

    representations: {
      a: {
        label: "Representation A",
        type: Types.Relationship,
        ref: "Representation",
        initial: true
      },
      b: {
        label: "Representation B",
        type: Types.Relationship,
        ref: "Representation",
        initial: true
      }
    },
  }, "State", {
    phase: {
      type: Types.Relationship,
      ref: "Phase",
      index: true,
      initial: true,
      label: "Current phase"
    },

    selectionMadeAt: {
      type: Types.Datetime,
      format: format,
      noedit: !keystone.get( "dev env" ),
      watch: "data.selection",
      value: function(){
        return Date.now();
      }
    },
    completed: {
      type: Types.Boolean,
      default: false,
      initial: false
    },

  }, "Assessor data", {
    data: data,
  } )
  .retain( "track" )
  .register();
