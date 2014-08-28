'use strict';

var keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Timerange = new keystone.List( 'Timerange', {
  map : {
    name : 'id'
  },
  track: true
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

Timerange.relationship( {
  path    : 'timelog',
  ref     : 'Timelog',
  refPath : 'times',
  label   : 'Time log'
} );

//Timerange.schema.plugin(require('mongoose-random')(), { path: '_r' });
Timerange.defaultColumns = 'name, begin, end';
Timerange.register();


