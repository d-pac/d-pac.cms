'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

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
    required : true,
    initial  : true
  },

  assessment : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    initial  : true,
    required : true,
    index    : true
  },

  representation : {
    type     : Types.Relationship,
    ref      : 'Representation',
    initial  : true,
    required : true,
    index    : true
  },

  comparison : {
    type     : Types.Relationship,
    ref      : 'Comparison',
    initial  : true,
    required : true,
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
    type    : Types.Boolean,
    default : false
  },

  timelogs : {
    type : Types.Relationship,
    ref  : 'Timelog',
    many : true
  }

};

Judgement.add( config );

var jsonFields = _.keys( config );

Judgement.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', jsonFields );
    return model;
  }
} );

Judgement.defaultColumns = 'name, assessor, assessment, comparison, representation, rank';
Judgement.register();


