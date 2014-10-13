'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var moment = require( 'moment-range' );

var Timelog = new keystone.List( 'Timelog', {
  map         : {
    name : 'id'
  },
  track       : true,
  defaultSort : 'comparison'
} );

var format = "DD/MM/YYYY HH:mm:ss";

var config = {

  phase : {
    type     : Types.Relationship,
    ref      : 'Phase',
    required : true,
    initial  : true
  },

  comparison : {
    type    : Types.Relationship,
    ref     : 'Comparison',
    require : true,
    initial : true
  },

  begin : {
    type     : Types.Datetime,
    required : true,
    initial  : true,
    format   : format
  },

  end : {
    type     : Types.Datetime,
    required : false,
    initial  : true,
    format   : format
  }

};

Timelog.api = {
  creation : _.keys( config ),
  editable : ["end"]
};

Timelog.add( config );

Timelog.schema.virtual( 'duration' ).get( function(){
  if(this.end){
    return moment.range( this.begin, this.end ).diff( 's' );
  }

  return "-";
} );

Timelog.schema.methods.toSafeJSON = function(){
  return _.pick( this, ['_id', 'duration'].concat( _.keys( config ) ) );
};
Timelog.defaultColumns = 'name, comparison, phase, begin, end, duration';
Timelog.register();
