'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Timelog = new keystone.List( 'Timelog', {
  map   : {
    name : 'id'
  },
  track : true
} );

var config = {

  type : {
    type     : Types.Relationship,
    ref      : 'Phase',
    required : true,
    initial  : true
  },

  duration : {
    type     : Number,
    default  : 0,
    required : true,
    initial  : true
  },

  times : {
    type     : Types.Relationship,
    ref      : 'Timerange',
    initial  : true,
    required : true,
    index    : true,
    many     : true
  }

};

Timelog.add( config );

var jsonFields = _.keys( config );

Timelog.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', jsonFields );
    return model;
  }
} );

Timelog.defaultColumns = 'name, type, duration';
Timelog.register();


