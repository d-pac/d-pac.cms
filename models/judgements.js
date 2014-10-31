'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var constants = require( './helpers/constants' );

var Judgement = new keystone.List( 'Judgement', {
  map   : {
    name : 'id'
  },
  track : true
} );

Judgement.api = {
  editable : ['notes', 'passed']
};

var config = {

  assessor : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true, //J03
    many     : false, //J03
    initial  : true
  },

  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    initial  : true,
    required : true, //J01
    many     : false, //J01
    index    : true,
    filters  : {
      state : constants.publicationStates.published //J06
    }
  },

  representation : {
    type     : Types.Relationship,
    ref      : 'Representation',
    initial  : true,
    required : true, //J02
    many     : false, //J02
    index    : true
  },

  comparison : {
    type     : Types.Relationship,
    ref      : 'Comparison',
    initial  : true,
    required : true, //J04
    many     : false, //J04
    index    : true
  },

  notes : {
    type    : Types.Html,
    wysiwyg : true
  },

  passed : {
    type    : Types.Select,
    options : [
      { value : "passed", label : "Passed" },
      { value : "undecided", label : "Undecided" },
      { value : "failed", label : "Failed" }
    ],
    initial : true
  }
};

Judgement.add( config );

Judgement.defaultColumns = 'name, assessor, assessment, comparison, representation, passed';
Judgement.register();


