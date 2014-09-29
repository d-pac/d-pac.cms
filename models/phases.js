'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Phase = new keystone.List( 'Phase', {
  map:{
    name: "label"
  },
  noedit : true,
  nocreate: true,
  nodelete: true,
  hidden: true
} );

var config = {

  label : {
    type     : Types.Text,
    required : true,
    initial  : true
  },

  value : {
    type    : Types.Text,
    required : true,
    initial : true
  }

};

Phase.add(config);
var jsonFields = _.keys( config );
Phase.schema.set( 'toJSON', {
  virtuals  : true,
  transform : function( doc,
                        model,
                        options ){
    model = _.pick( model, 'id', jsonFields );
    return model;
  }
} );

Phase.defaultColumns = 'label, value';
Phase.register();


