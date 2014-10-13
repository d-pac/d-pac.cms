'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var moment = require( 'moment-range' );

var Timerange = new keystone.List( 'Timerange', {
  map   : {
    name : 'id'
  },
  track : true
} );

var format = "DD/MM/YYYY HH:mm:ss";

var config = {

  begin : {
    type     : Types.Datetime,
    required : true,
    initial  : true,
    format   : format
  },

  end : {
    type     : Types.Datetime,
    required : true,
    initial  : true,
    format   : format
  }

};

Timerange.add( config );

Timerange.schema.virtual( 'duration' ).get( function(){
  return moment.range( this.begin, this.end ).diff( 's' );
} );

Timerange.relationship( {
  path    : 'timelog',
  ref     : 'Timelog',
  refPath : 'times',
  label   : 'Time log'
} );

Timerange.defaultColumns = 'name, begin, end, duration';
Timerange.register();


