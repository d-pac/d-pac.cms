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
  state       : {
    type    : Types.Select,
    options : 'draft, published, archived',
    default : 'draft',
    index   : true
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
  path    : 'comparisons',
  ref     : 'Comparison',
  refPath : 'assessment',
  label   : 'Comparisons'
} );

Assessment.relationship( {
  path    : 'personas',
  ref     : 'Persona',
  refPath : 'assessment',
  label   : 'Personas'
} );

Assessment.schema.plugin( require( 'mongoose-random' )(), { path : '_r' } );
Assessment.defaultColumns = 'title, creator';
Assessment.register();


