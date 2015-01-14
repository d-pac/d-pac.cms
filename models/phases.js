"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var _s = require( "underscore.string" );

var Phase = new keystone.List( "Phase", {
  map      : {
    name : "label"
  },
  noedit   : false,
  nocreate : true,
  nodelete : true,
  hidden   : false
} );

var config = {

  label : {
    type     : Types.Text,
    required : true,
    initial  : true
  },

  type : {
    type     : Types.Text,
    required : true,
    initial  : true,
    noedit   : true
  }

};

Phase.add( config );

// Provide access to Keystone
Phase.schema.virtual( "machinename" ).get( function(){
  return _s.slugify( this.label + "-" + this.type );
} );

Phase.defaultColumns = "label, type, machinename";
Phase.register();
