'use strict';

var keystone = require( 'keystone' );
var Types = keystone.Field.Types;

var Note = new keystone.List( 'Note', {
  map: {
    name: "_rid"
  }
} );

Note.defaultColumns = 'name, author';

Note.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Note",
  field: "_rid",
  startAt: 1
} );

require( './helpers/setupList' )( Note )
  .add( "Connections", {
    author: {
      type: Types.Relationship,
      ref: "User",
      many: false, // C02
      index: true,
      required: false, // C02
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
  }, "Content",{
    body: {
      type: Types.Textarea
    }
  } )
  .register();
