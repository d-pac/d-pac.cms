'use strict';

var _ = require( 'underscore' ),
    keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Assessment = new keystone.List( 'Assessment', {
  map : { name : 'title' }
} );

Assessment.add( {
  title       : {
    type     : Types.Text,
    required : true,
    initial  : true
  },
  description : {
    type    : Types.Html,
    wysiwyg : true,
    height  : 400
  },
  creator     : {
    type  : Types.Relationship,
    ref   : 'User',
    index : true
  }
} );

Assessment.relationship( {
  path    : 'representations',
  ref     : 'Representation',
  refPath : 'assessment',
  label   : 'Representations'
} );

Assessment.defaultColumns = 'title, creator';
Assessment.register();


