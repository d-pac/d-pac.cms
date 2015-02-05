"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( "./helpers/constants" );

var Seq = new keystone.List( "Seq", {
  map   : {
    name : "id"
  },
  track : true
} );

var config = {

  comparison : {
    type     : Types.Relationship,
    ref      : "Comparison",
    required : true,
    many     : false,
    initial  : true
  },

  phase : {
    type     : Types.Relationship,
    ref      : "Phase",
    required : true,
    many     : false,
    initial  : true
  },

  value : {
    type    : Types.Number,
    initial : true
  }

};

Seq.api = {
  creation : _.keys( config ),
  editable : [ "value" ]
};
Seq.add( config );

Seq.defaultColumns = "name, comparison, phase, value";
Seq.register();
