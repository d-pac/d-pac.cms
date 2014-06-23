'use strict';

var keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Timerange = new keystone.List( 'Timerange', {
  map : {
    name : 'id'
  }
} );

Timerange.add( {
  begin      : {
    type     : Date,
    required : true,
    initial  : true
  },
  end  : {
    type     : Date,
    required : true,
    initial  : true
  }
} );
//Timerange.schema.plugin(require('mongoose-random')(), { path: '_r' });
Timerange.defaultColumns = 'name, type, duration, score';
Timerange.register();


