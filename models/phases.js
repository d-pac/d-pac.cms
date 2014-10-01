'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;
var _s = require('underscore.string');

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

  type : {
    type    : Types.Text,
    required : true,
    initial : true
  }

};

Phase.add(config);

// Provide access to Keystone
Phase.schema.virtual( 'machinename' ).get( function(){
  return _s.slugify(this.label+'-'+this.type);
} );

Phase.defaultColumns = 'label, type, machinename';
Phase.register();


