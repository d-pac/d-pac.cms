"use strict";

var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var Phase = new keystone.List( "Phase", {
  map      : {
    name : "label"
  },
  noedit   : !keystone.get('dev env'),
  nocreate : !keystone.get('dev env'),
  nodelete : !keystone.get('dev env'),
  hidden   : false
} );

Phase.defaultColumns = "label, slug";
require( './helpers/setupList' )( Phase )
  .add( {

    label : {
      type     : Types.Text,
      required : true,
      initial  : true
    },

    slug : {
      type     : Types.Text,
      required : true,
      initial  : true,
      noedit   : true
    }

  } )
  .register();
