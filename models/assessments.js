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

Assessment.relationship( {
  path    : 'assessees',
  ref     : 'Assessee',
  refPath : 'assessment',
  label   : 'Assessees'
} );

Assessment.relationship( {
  path    : 'assessors',
  ref     : 'Assessor',
  refPath : 'assessment',
  label   : 'Assessors'
} );

Assessment.relationship( {
  path    : 'comparisons',
  ref     : 'Comparison',
  refPath : 'assessment',
  label   : 'Comparisons'
} );

Assessment.schema.plugin(require('mongoose-random')(), { path: '_r' });
Assessment.defaultColumns = 'title, creator';
Assessment.register();


