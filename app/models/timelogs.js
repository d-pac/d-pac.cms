"use strict";

var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var moment = require( "moment" );
require( 'moment-range' );

var format = "DD/MM/YYYY HH:mm:ss";
var Timelog = new keystone.List( "Timelog", {
  map: {
    name: "id"
  },
  track: true,
  defaultSort: "comparison"
} );

Timelog.api = {
  editable: [ "comparison", "phase", "begin", "end" ]
};

Timelog.defaultColumns = "name, comparison, phase, begin, end, duration";

var list = require( './helpers/setupList' )( Timelog )
  .add( {

    phase: {
      type: Types.Relationship,
      ref: "Phase",
      required: true,
      initial: true
    },

    comparison: {
      type: Types.Relationship,
      ref: "Comparison",
      require: true,
      initial: true
    },

    begin: {
      type: Types.Datetime,
      required: true,
      initial: true,
      format: format
    },

    end: {
      type: Types.Datetime,
      required: false,
      initial: true,
      format: format
    }

  } )
  .retain( 'track' )
  .virtualize( {
    duration: function(){
      if( this.end ){
        var d = moment.range( this.begin, this.end );
        return d.diff( "s" );
      }

      return 0;
    }
  } )
  .register();
