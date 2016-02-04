'use strict';

const keystone = require( 'keystone' );
const Types = keystone.Field.Types;

const Feedback = new keystone.List( 'Feedback', {
  map: {
    name: "_rid"
  },
  path: "feedback",
  label: "Feedback",
  singular: "Feedback",
  plural: "Feedback"
} );

Feedback.defaultColumns = 'name, author, document';

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
    document: {
      type: Types.Relationship,
      ref: "Document",
      initial: true,
      required: false,
      many: false,
      index: true
    },
  }, "Content", {
    positive: {
      type: Types.Textarea
    },
    negative: {
      type: Types.Textarea
    }
  } )
  .register();
