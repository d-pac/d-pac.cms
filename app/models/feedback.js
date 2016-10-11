'use strict';

const _ = require('lodash');
const keystone = require( 'keystone' );
const Types = keystone.Field.Types;
const constants = require('./helpers/constants');
const phases  = _.map(constants.phases, function (p) {
  return {
    label: p.label,
    value: p.slug
  }
});

const Feedback = new keystone.List( 'Feedback', {
  map: {
    name: "_rid"
  },
  path: "feedback",
  label: "Feedback",
  singular: "Feedback",
  plural: "Feedback"
} );

Feedback.defaultColumns = 'name, author, representation, phase';

Feedback.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Feedback",
  field: "_rid",
  startAt: 1
} );

require( './helpers/setupList' )( Feedback )
  .add( "Connections", {
    author: {
      type: Types.Relationship,
      ref: "User",
      many: false,
      index: true,
      required: false,
      initial: true
    },
    representation: {
      type: Types.Relationship,
      ref: "Representation",
      initial: true,
      required: false,
      many: false,
      index: true
    },
    phase: {
      type: Types.Select,
      initial: true,
      required: true,
      options: phases,
      default: constants.PROSCONS
    }
  }, "Content", {
    positive: {
      type: Types.Textarea
    },
    negative: {
      type: Types.Textarea
    }
  } )
  .register();
