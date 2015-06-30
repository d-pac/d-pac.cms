"use strict";

var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var _s = require( "underscore.string" );

var Phase = new keystone.List( "Phase", {
  map      : {
    name : "label"
  },
  noedit   : true,
  nocreate : true,
  nodelete : true,
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
