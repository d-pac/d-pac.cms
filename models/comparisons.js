'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var autoinc = require('./helpers/autoinc');
var comparisonSteps = require( './helpers/constants' ).comparisonSteps;

var Comparison = new keystone.List( 'Comparison', {
  map   : {
    name : 'id'
  },
  track : true
} );

var config = {

  assessor            : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true
  },

  assessment          : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    initial  : true,
    required : true,
    index    : true
  },

  comparativeFeedback : {
    type    : Types.Html,
    wysiwyg : true
  },

  timelogs            : {
    type : Types.Relationship,
    ref  : 'Timelog',
    many : true
  },

  state               : {
    type    : Types.Select,
    options : comparisonSteps,
    initial : true
  },

  active              : {
    type    : Types.Boolean,
    default : true,
    initial : true
  }

};

Comparison.add(config);

Comparison.relationship( {
  path    : 'judgements',
  ref     : 'Judgement',
  refPath : 'comparison',
  label   : 'Judgements'
} );

Comparison.schema.plugin(autoinc.plugin, { model: 'Comparison', field: '_rid' });

var jsonFields = _.keys(config);

Comparison.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', '_rid', jsonFields );
    return model;
  }
} );

//Comparison.schema.plugin(require('mongoose-random')(), { path: '_r' });
Comparison.defaultColumns = 'name, assessor, assessment';
Comparison.register();



