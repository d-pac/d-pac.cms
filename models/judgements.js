'use strict';

var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Judgement = new keystone.List( 'Judgement', {
  map : {
    name : 'id'
  }
} );

Judgement.add( {
  assessor : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true
  },
  assessment : { 
    type : Types.Relationship,
    ref : 'Assessment',
    initial : true,
    required : true,
    index : true
  },
  representation : { 
    type : Types.Relationship,
    ref : 'Representation',
    initial : true,
    required : true,
    index : true
  },
  comparison : {
    type : Types.Relationship,
    ref : 'Comparison',
    initial : true,
    required : true,
    index : true
  },
  rank : {
    type : Types.Number,
    default : -1
  },
  individualFeedback : {
    type : Types.Html,
    wysiwyg: true
  },
  notes : {
    type : Types.Html,
    wysiwyg: true
  },
  passed : {
    type : Types.Boolean,
    default : false
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    noedit : true
  }  
} );
//Judgement.schema.plugin(require('mongoose-random')(), { path: '_r' });
Judgement.defaultColumns = 'name, assessor, assessment, comparison, representation, rank';
Judgement.register();


