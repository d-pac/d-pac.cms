'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var constants = require('./helpers/constants');

var Judgement = new keystone.List( 'Judgement', {
  map   : {
    name : 'id'
  },
  track : true
} );

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

  rank : {
    type    : Types.Number,
    default : -1
  },

  individualFeedback : {
    type    : Types.Html,
    wysiwyg : true
  },

  notes : {
    type    : Types.Html,
    wysiwyg : true
  },

  passed : {
    type    : Types.Select,
    options : [
      { value : 1, label : "Passed" },
      { value : 0, label : "Undecided" },
      { value : -1, label : "Failed" }
    ],
    initial : true,
    default : 0
  },

  timelogs : {
    type : Types.Relationship,
    ref  : 'Timelog',
    many : true //J05
  }

};

Judgement.add( config );

Judgement.defaultColumns = 'name, assessor, assessment, comparison, representation, rank';
Judgement.register();


