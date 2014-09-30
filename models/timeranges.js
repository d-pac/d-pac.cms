'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Timerange = new keystone.List( 'Timerange', {
  map   : {
    name : 'id'
  },
  track : true
} );

var config = {

  begin : {
    type     : Date,
    required : true,
    initial  : true
  },

  end : {
    type     : Date,
    required : true,
    initial  : true
  }

};

Timerange.add( config );

Timerange.relationship( {
  path    : 'timelog',
  ref     : 'Timelog',
  refPath : 'times',
  label   : 'Time log'
} );


Timerange.defaultColumns = 'name, begin, end';
Timerange.register();


