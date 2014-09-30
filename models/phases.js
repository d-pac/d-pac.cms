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


Phase.defaultColumns = 'label, value';
Phase.register();


