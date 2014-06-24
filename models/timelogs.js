'use strict';

var keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Timelog = new keystone.List( 'Timelog', {
  map : {
    name : 'id'
  }
} );

Timelog.add( {
  type      : {
    type     : Types.Select, options : [
      { value : 'judgement', label : "Judgement" },
      { value : 'judgementSEQ', label : "Judgement SEQ" },
      { value : 'comparative', label : "Comparative Feedback" },
      { value : 'comparativeSEQ', label : "Comparative Feedback SEQ" },
      { value : 'passfail', label : "Pass/Fail" },
      { value : 'passfailSEQ', label : "Pass/Fail SEQ" },
      { value : 'individual', label : "Individual Feedback" },
      { value : 'individualSEQ', label : "Individual Feedback SEQ" }
    ],
    required : true,
    initial  : true
  },
  duration  : {
    type     : Number,
    default  : 0,
    required : true,
    initial  : true
  },
  times     : {
    type     : Types.Relationship,
    ref      : 'Timerange',
    initial  : true,
    required : true,
    index    : true,
    many     : true
  },
  createdAt           : {
    type    : Date,
    default : Date.now,
    noedit  : true
  }
} );
//Timelog.schema.plugin(require('mongoose-random')(), { path: '_r' });
Timelog.defaultColumns = 'name, type, duration';
Timelog.register();


