"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( "./helpers/constants" );
var plugins = require( "keystone-dpac-plugins" );

var Assessment = new keystone.List( "Assessment", {
  map         : {
    name : "title"
  },
  track       : true,
  defaultSort : "order"
} );

var config = {

  title : {
    type     : Types.Text,
    required : true,
    initial  : true
  },

  algorithm : {
    type    : Types.Select,
    label   : "Selection algorithm",
    options : plugins.list( "select" ),
    initial : true
  },

  description : {
    type    : Types.Html,
    wysiwyg : true,
    height  : 400
  },

  phases : {
    type     : Types.Relationship,
    label    : "Workflow",
    ref      : "Phase",
    required : true,
    many     : true,
    initial  : false
  },

  comparisonsNum : {
    type     : Types.Number,
    label    : "Number of comparisons",
    required : true,
    initial  : true,
    default  : 20
  },

  state : {
    type    : Types.Select,
    options : constants.publicationStates.list.toString(),
    default : constants.publicationStates.draft,
    index   : true
  },

  order : {
    type : Types.Number
  }

};

Assessment.add( config );

Assessment.relationship( {
  path    : "representations",
  ref     : "Representation",
  refPath : "assessment",
  label   : "Representations"
} );

Assessment.relationship( {
  path    : "comparisons",
  ref     : "Comparison",
  refPath : "assessment",
  label   : "Comparisons"
} );

Assessment.relationship( {
  path    : "personas",
  ref     : "Persona",
  refPath : "assessment",
  label   : "Personas"
} );

Assessment.defaultColumns = "title, createdBy, state, order";
Assessment.register();
