'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var constants = require( './helpers/constants' );

var Assessment = new keystone.List( 'Assessment', {
  map   : {
    name : 'title'
  },
  track : true
} );

var config = {

  title : {
    type     : Types.Text,
    required : true,
    initial  : true
  },

  description : {
    type    : Types.Html,
    wysiwyg : true,
    height  : 400
  },

  phases : {
    type     : Types.Relationship,
    ref      : 'Phase',
    required : true,
    many     : true,
    initial  : false
  },

  comparisonsNum : {
    type : Types.Number,
    required : true,
    initial : true,
    default : 20
  },

  state : {
    type    : Types.Select,
    options : constants.publicationStates.list.toString(),
    default : constants.publicationStates.draft,
    index   : true
  }

};

Assessment.add( config );

Assessment.relationship( {
  path    : 'representations',
  ref     : 'Representation',
  refPath : 'assessment',
  label   : 'Representations'
} );

Assessment.relationship( {
  path    : 'comparisons',
  ref     : 'Comparison',
  refPath : 'assessment',
  label   : 'Comparisons'
} );

Assessment.relationship( {
  path    : 'personas',
  ref     : 'Persona',
  refPath : 'assessment',
  label   : 'Personas'
} );


Assessment.defaultColumns = 'title, createdBy, state';
Assessment.register();


